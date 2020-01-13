(function (document, window, $) {
    var ajaxModule = $.site.ajax;
    var urlParams = ajaxModule.splitUrlParams();
    var id = urlParams.id;
    var specMany = '';
    var umEditor = '';
    var oldData = null;
    var editTypeModule = (function () {
        var init = function (id) {
            $('#fileLibrary').load('/layouts/_template/file_library.html');
            $('#deliveryTpl').load('/goods/_template/spec_many.html');
            //获取商品分类列表
            types='';
            getTypeList().then(function (result) {
                 types=result.data;
                if (result.code === 0) {
                    return  getGoodDetail(id)
                 
                } else {
                    layer.msg('获取商品列表失败');
                    return false;
                }
            }).then(function(res){
                if(res){
                renderTypeHtml(types,res.categoryId);
                //渲染商品
                renderGoodDetail(res,res.spuId);
                }else{
                    layer.msg('获取商品失败');
                    return false;
                }
              
            })
            bind();
            umEditor = UM.getEditor('container', {
                langPath: '/assets/store/plugins/umeditor/lang/'
            });
            $('.upload-file').selectImages({
                multiple: true
            });
         
            // 图片列表拖动
            $('.uploader-list').DDSort({
                target: '.file-item',
                delay: 100, // 延时处理，默认为 50 ms，防止手抖点击 A 链接无效
                floatStyle: {
                    'border': '1px solid #ccc',
                    'background-color': '#fff'
                }
            });
            //获取运费模板
            getDelivery();
            submitForm();

        }
        var getGoodDetail = function (id) {
            var load = layer.load();
            return new Promise(function(resolve,reject){
                ajaxModule.proxy({
                    url: '/goodsspu/goodsDetail/' + id,
                    type: 'get',
                    success: function (res) {
                        if (res.code === 0) {
                            oldData = res.data;
                            resolve(res.data);
                        }
                        layer.close(load);
                    }
                })
            })
           
        }
        var renderGoodDetail = function (data,pkid) {
            var $goodsSpecMany = $('.goods-spec-many')
                , $goodsSpecSingle = $('.goods-spec-single');
            $('#goodsName').val(data.goodsName);
            //$('#categoryType').val(data.categoryId);
          //  $('#categoryType').find('option[value="'+data.categoryId+'"]').attr('selected', true)
            $('input[name="stockType"][vaue="' + data.deductStockType + '"]').attr('checked', true);
            $('#container').html(data.content);
            umEditor.ready(function () {
                umEditor.setContent(data.content);
            });
            $('input[name="goodType"][value="'+data.specType+'"]').attr('checked',true);
            $('select[name="deliveryId"]').val(data.deliveryId)
            $('input[name="goodStatus"][value="' + data.goodsStatus + '"]').attr('checked', true);
            $('input[name="salesInitial"]').val(data.salesInitial);
            $('input[name="goodSort"]').val(data.goodsSort);
            
            var imageId = [];
            var files = data.goodsUploadFiles;
            var html = [];
            for (var j = 0; j < files.length; j++) {

                html.push('<div class="file-item">' +
                    '<img src="/file/show/' + files[j].fileId + '">' +
                    '<input type="hidden" code="' + files[j].fileId + '" name="' + files[j].fileName + '" value="' + files[j].fileId + '">' +
                    '<i class="iconfont icon-shanchu file-item-delete"></i></div>');
            }
            $('.uploader-list').empty().append(html.join(''));
            $('input[name="goodType"][value="' + data.goodType + '"]').attr('checked', true);
            //多规格渲染
            if (data.specType === 1) {
                var baseData = {
                    spec_attr: [],
                    spec_list: [],
                    goodsSkus: [],
                };
                baseData.goodsSkus = data.goodsSkus;
                baseData.spec_attr = data.goodsSpecs;
                baseData.spec_list = setSpecList(baseData,pkid);
                specMany = new GoodsSpec({
                    container: '.goods-spec-many',
                }, baseData);
                $goodsSpecMany.show() && $goodsSpecSingle.hide();
            } else {
                specMany = new GoodsSpec({
                    container: '.goods-spec-many'
                });
                //单规格渲染
                $goodsSpecMany.hide() && $goodsSpecSingle.show();
                $('input[name="singleGoodNo"]').val(data.goodsSkus[0].goodsNo);
                $('input[name="singleGoodPrice"]').val(data.goodsSkus[0].goodsPrice);
                $('input[name="singleGoodLinePrice"]').val(data.goodsSkus[0].linePrice);
                $('input[name="singleGoodStockNum"]').val(data.goodsSkus[0].stockNum);
                $('input[name="singleGoodWeight"]').val(data.goodsSkus[0].goodsWeight);
            }
        }
        var setSpecList = function (data,pkid) {
            // 规格组合总数 (table行数)
            var totalRow = 1;
            for (var i = 0; i < data.spec_attr.length; i++) {
                totalRow *= data.spec_attr[i].specValues.length;
            }
            // 遍历tr 行
            var spec_list = [];
            for (i = 0; i < totalRow; i++) {
                var rowData = [], rowCount = 1, specSkuIdAttr = [];
                // 遍历td 列
                for (var j = 0; j < data.spec_attr.length; j++) {
                    var specId = data.spec_attr[j].specId;
                    var specName = data.spec_attr[j].specName;
                    var skuValues = data.spec_attr[j].specValues;
                    rowCount *= skuValues.length;
                    var anInterBankNum = (totalRow / rowCount)
                        , point = ((i / anInterBankNum) % skuValues.length);
                    if (0 === (i % anInterBankNum)) {
                        rowData.push({
                            rowspan: anInterBankNum,
                            item_id: skuValues[point].specValueId,
                            spec_value: skuValues[point].specValue
                        });
                    }
                    specSkuIdAttr.push(skuValues[parseInt(point.toString())].specValueId);
                }
                specSkuIdAttr.sort(function(a,b){
                    return parseInt(a)-parseInt(b);
                })
                spec_list.push({
                    spec_sku_id: specSkuIdAttr.join('_'),
                    rows: rowData,
                    form: {}
                });
              
            }
            for (m = 0; m < spec_list.length; m++) {
                 for(var p=0;p<data.goodsSkus.length;p++){
                    var spuSpecvalue=data.goodsSkus[p].spuSpecvalue.substr(0,data.goodsSkus[p].spuSpecvalue.lastIndexOf('_'))     
                     if(spec_list[m].spec_sku_id===spuSpecvalue){
                        spec_list[m].form = $.extend({}, spec_list[m].form, data.goodsSkus[p])
                     }
                 }
               
            }
            return spec_list;
        }

        //获取商品分类列表
        var getTypeList = function () {
            return new Promise(function (resolve, reject) {
                ajaxModule.proxy({
                    url: '/goodscategory/tree',
                    type: 'get',
                    success: function (res) {
                        if (res.code === 0) {
                           
                            resolve(res);
                        }
                    }
                })
            })

        }
        //渲染商品分类列表
        var renderTypeHtml = function (result,pkid) {
            if (result) {
                var rowDatas = [];
                for (var i = 0; i < result.length; i++) {
                    rowDatas.push({
                        id: result[i].id,
                        name: result[i].name,
                        imageId: result[i].imageId,
                        parentId: result[i].parentId,
                        sort: result[i].sort,
                        createTime: result[i].createTime
                    })
                    if (result[i].children && result[i].children.length) {
                        var childrens = result[i].children;
                        for (var j = 0; j < childrens.length; j++) {
                            rowDatas.push({
                                id: childrens[j].id,
                                name: '&nbsp;&nbsp;&nbsp;&nbsp;' + childrens[j].name,
                                imageId: childrens[j].imageId,
                                parentId: childrens[j].parentId,
                                sort: childrens[j].sort,
                                createTime: childrens[j].createTime
                            })
                        }
                    } else {

                    }
                }
                var type = [];
                rowDatas.forEach(function (value, index) {
                    if(value.id===pkid){
                        type.push('<option value="' + value.id + '" selected>' + value.name + '</option>')
                    }else{
                        type.push('<option value="' + value.id + '">' + value.name + '</option>')
                    }
                    
                })
                $('#categoryType').empty().append(type.join(' '));

            }
        }
        var bind = function () {
            $('input:radio[name="goodType"]').change(function (e) {
                var $goodsSpecMany = $('.goods-spec-many')
                    , $goodsSpecSingle = $('.goods-spec-single');
                if (e.currentTarget.value === '0') {
                    $goodsSpecMany.hide() && $goodsSpecSingle.show();
                } else {
                    $goodsSpecMany.show() && $goodsSpecSingle.hide();
                }
            });
        }
        var getDelivery = function () {
            ajaxModule.proxy({
                url: '/delivery/page',
                type: 'get',
                data: { 'current': '0', size: '100' },
                success: function (res) {
                    if (res.code === 0) {
                        var result = res.data.records;
                        var options = [];
                        for (var i = 0; i < result.length; i++) {
                            options.push('<option value="' + result[i].deliveryId + '">' + result[i].name + '</option>')
                        }
                        $('#deliveryId').empty().append(options.join(''));
                    }
                }
            })
        }
        /**
        * 表单验证提交
        * @type {*}
        */
        var submitForm = function () {

            var options = $('#my-form').superForm({
                buildData: function () {
                    return JSON.stringify(getData);
                },
                // submitUrl:'/goodsspu',
                // newUrl:'',

            });

            $('.j-submit').on('click', function () {

                var data = specMany.getData();
                var getData = {};
                getData.goodsName = $('input[name="goodsName"]').val();
                getData.specType = $('input[name="goodType"]:checked').val();
                getData.goodsSkus = [];
                if (getData.specType === "0") {
                    getData.goodsSkus.push({
                        goodsNo: $('input[name="singleGoodNo"]').val(),
                        goodsPrice: $('input[name="singleGoodPrice"]').val(),
                        linePrice: $('input[name="singleGoodLinePrice"]').val(),
                        stockNum: $('input[name="singleGoodStockNum"]').val(),
                        goodsWeight: $('input[name="singleGoodWeight"]').val(),
                    })
                } else {
                    if (data.goodsSkus && data.goodsSkus.length) {
                        getData.goodsSkus = data.goodsSkus;
                        getData.goodsSpecs = data.spec_attr;
                    } else {
                        layer.msg('选择多规格的时候必须添加规格');
                        return false;
                    }
                }
                getData.categoryId = $('#categoryType').val();
                getData.deductStockType = $('input[name="stockType"]:checked').val();
                getData.content = $('#container').val();
                getData.deliveryId = $('select[name="deliveryId"]').val();
                getData.goodsSort = $('input[name="goodSort"]').val();
                getData.goodsStatus = $('input[name="goodStatus"]:checked').val();
                getData.salesInitial = $('input[name="salesInitial"]').val();
                var imageId = [];
                var inputs = $('.uploader-list').find('input');
                getData.salesActual = 0;
                if (inputs.length) {
                    inputs.each(function () {
                        var value = $(this).val();
                        imageId.push({
                            fileId: value
                        })
                    })
                } else {
                    layer.msg('请选择图片');
                    return false;
                }

                getData.goodsUploadFiles = imageId;
                //return false;
                var load = layer.load();
                getData = $.extend({}, oldData, getData)
                ajaxModule.proxy({
                    contentType: 'application/json;charset=UTF-8',
                    url: '/goodsspu',
                    type: 'put',
                    data: JSON.stringify(getData),
                    success: function (res) {
                        layer.close(load);
                        if (res.code === 0) {
                            layer.msg('修改成功');
                            window.location.href = "/goods/index.html";
                        } else {
                            layer.msg('修改失败');
                            window.location.reload();
                        }
                    }
                })
                return false;
            })

        }

        return {
            init: init,
        }
    })();
    $(document).ready(function () {
        editTypeModule.init(id);
    })
})(document, window, $)