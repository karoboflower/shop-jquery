(function (document, window, $) {
    var ajaxModule = $.site.ajax;//获取组装的ajax请求方法
    var urlParams = ajaxModule.splitUrlParams();
    var specMany = '';
    var addGoodModule = (function () {
        var init = function () {
            $('#fileLibrary').load('/layouts/_template/file_library.html');
            $('#deliveryTpl').load('/goods/_template/spec_many.html');
            //获取商品分类列表
            getTypeList();
            bind();
            UM.getEditor('container', {
                lang:"zh-cn",
                langPath: '/assets/store/plugins/umeditor/lang/'
            });
            $('.upload-file').selectImages({
                multiple: true
            });
            specMany = new GoodsSpec({
                container: '.goods-spec-many'
            });
            submitForm();
            //获取运费模板
            getDelivery();
           
            // 图片列表拖动
            $('.uploader-list').DDSort({
                target: '.file-item',
                delay: 100, // 延时处理，默认为 50 ms，防止手抖点击 A 链接无效
                floatStyle: {
                    'border': '1px solid #ccc',
                    'background-color': '#fff'
                }
            });


            // $('.uploader-list').DDSort({
            //     target: '.file-item',
            //     delay: 100, // 延时处理，默认为 50 ms，防止手抖点击 A 链接无效
            //     floatStyle: {
            //         'border': '1px solid #ccc',
            //         'background-color': '#fff'
            //     }
            // });




        }
        var bind = function () {
            // $('.btn-addSpecName').on('click', function () {
            //     var specName = $('.input-specName').val();
            //     var specValue = $('.input-specValue').val();
            //     if (specName && specValue) {
            //         addSpec(specName, specValue).then(function (data) {
            //             $('#specTypes').append('<label class="am-radio-inline">' +
            //                 '<input type="radio" name="" value="10" data-am-ucheck >单规格</label>')
            //         })
            //     } else {
            //         layer.msg('请填写规格名和规格值');
            //         return false;
            //     }
            // });
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
        var addSpec = function (name, value) {
            return new Promise(function (resolve, reject) {
                ajaxModule.proxy({
                    contentType: 'application/json;charset=UTF-8',
                    url: '/goodsspec/savespec',
                    type: 'post',
                    data: JSON.stringify({ 'specName': name, 'specValue': value }),
                    success: function (res) {
                        if (res.code === 0) {
                            resolve(res.data)
                        }
                    }
                })
            })

        }
        //获取商品分类列表
        var getTypeList = function () {
            ajaxModule.proxy({
                url: '/goodscategory/tree',
                type: 'get',
                success: function (res) {
                    if (res.code === 0) {
                        renderTypeHtml(res.data)
                    }
                }
            })
        }
        //渲染商品分类列表
        var renderTypeHtml = function (result) {
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
                    }
                }
                var type = [];
                rowDatas.forEach(function (value, index) {
                    type.push('<option value="' + value.id + '">' + value.name + '</option>')
                })
                $('#categoryType').empty().append(type.join(' '));

            }
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
                if($('#my-form').validator('isFormValid')){
                    var data = specMany.getData();
                    var getData = {};
                    getData.goodsName = $('input[name="goodsName"]').val();
                    getData.specType = $('input[name="goodType"]:checked').val();
                    getData.goodsSkus=[];
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
                    getData.salesInitial = $('input[name="salesInitial"]:checked').val();
                    getData.goodsSort = $('input[name="goodSort"]').val();
                    getData.goodsStatus = $('input[name="goodStatus"]:checked').val();
                    getData.salesInitial = $('input[name="salesInitial"]').val();
                    var imageId = [];
                    var inputs = $('.uploader-list').find('input');
                    getData.deliveryId = $('select[name="deliveryId"]').val();
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
    
                    ajaxModule.proxy({
                        contentType: 'application/json;charset=UTF-8',
                        url: '/goodsspu',
                        type: 'post',
                        data: JSON.stringify(getData),
                        success: function (res) {
                            layer.close(load);
                            if (res.code === 0) {
                                layer.msg('添加成功');
                                window.location.href = "/goods/index.html";
                            } else {
                                layer.msg('添加失败');
                                return false;
                            }
                        }
                    })
                }else{
                    layer.msg('请填写必填字段');
                    return false;
                }
               
                return false;
            })

        }
        return {
            init: init
        }
    })();
    $(document).ready(function () {
        addGoodModule.init();
    })
})(document, window, $)