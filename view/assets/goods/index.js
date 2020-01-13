(function (document, window, $) {
    var ajaxModule = $.site.ajax;//获取组装的ajax请求方法
    var goodMoule = (function () {
        var pagination;
        var tempPage=1;
        var init = function () {
            getType();//获取商品的分类列表
            getGoodLists(1, 0);
            bind();
        }
        /**
        * 获取商品的分裂列表
        */
        var getType = function () {
            ajaxModule.proxy({
                url: '/goodscategory/tree',
                type: 'get',
                success: function (res) {
                    if (res.code === 0) {
                        renderType(res.data);
                    } else {
                        layer.msg('获取商品分类失败');
                        return false;
                    }
                }
            })
        }
        /**
        * 获取文件库列表详情数据
        * @param result 分类列表
        * @param object
        * @return
        */
        renderType = function (result) {
            if (result) {
                var rowDatas = [];
                for (var i = 0; i < result.length; i++) {
                    rowDatas.push({
                        id: result[i].id,
                        name: result[i].name,
                        imageId: result[i].imageId,
                        parentId: result[i].parentId,
                        sort: result[i].sort,
                    })
                    if (result[i].children && result[i].children.length) {
                        var childrens = result[i].children;
                        for (var j = 0; j < childrens.length; j++) {
                            rowDatas.push({
                                id: childrens[j].id,
                                name: '&nbsp;&nbsp;&nbsp;' + childrens[j].name,
                                imageId: childrens[j].imageId,
                                parentId: childrens[j].parentId,
                                sort: childrens[j].sort,
                            })
                        }
                    }
                }
                var types = [];
                types.push('<option value=""></option>');
                for (var m = 0; m < rowDatas.length; m++) {
                    types.push(' <option value="' + rowDatas[m].id + '">' + rowDatas[m].name + '</option>')
                }
                $('#typeDetails').empty().append(types.join(''));
            }
        }

        /**
        * 获取商品列表
        * @param pageNum 当前页 flag 是否首次进入 
        * @return
        */
        var getGoodLists = function (pageNum, flag) {
            pageNum = pageNum ? pageNum : '1';
            var param={};
            param.current=pageNum;
            param.size=10;
            var name=$('input[name="goods_name"]').val();
            var types=$('#typeDetails').val();
            var status= $('#currentTypes').val();
            if(name){
                param.goodsName=name
            }
            if(types){
                param.categoryId=types;
            }
            if(status){
                param.goodsStatus=status;
            }
            var load = layer.load();
            ajaxModule.proxy({
                url: '/goodsspu/page',
                type: 'get',
                data: param,
                success: function (res) {
                    if (res.code === 0) {
                        renderHtml(pageNum, flag, res.data.records,res.data.total,res.data.pages)
                    }
                    layer.close(load);
                }
            })
        }
        /**
        * 渲染别表
        * @param pageNum 当前页 flag 是否首次进入 result 商品列表
        * @return
        */
        var renderHtml = function (pageNum, flag, result,total,page) {
            $('.all-total').empty().append('总记录：'+total);
            if(result&&result.length){
                var html = template('good-list-tpl', { rowDatas: result });
                $('#goodLists').empty().append(html);
                if(flag===0){
                    tempPage=1;
                    $('#nav-pagination').empty();
                    $('#nav-pagination').removeData("twbs-pagination");
                    $('#nav-pagination').unbind('page');
                }
                var visiableCount=5;
                if(page<visiableCount){
                    visiableCount=page;
                }
                pagination=$('#nav-pagination').twbsPagination({
                    totalPages: page,//总页数
                    startPage: 1,//起始页
                    visiblePages: visiableCount,//展示页数，超出5页展示5页，未超出时展示总页数
                    initiateStartPageClick: true,
                    hideOnlyOnePage: true,//只有一页时不展示分页
                    prev:'«',
                    next:'»',
                    first:false,
                    last:false,
                    onPageClick:function(event,page){
                        if(tempPage!==page){
                            tempPage=page;
                            getGoodLists(page,1);
                        }
                    }
                })
            }else{
                $('#nav-pagination').empty();
                $('#nav-pagination').removeData("twbs-pagination");
                $('#nav-pagination').unbind('page');
                $('#goodLists').empty();
            }
         

        }
        //相关点击事件
        var bind=function(){
            $('#searchGoods').on('click',function(){
                getGoodLists(1,0);
            })
            $('#searchText').keydown(function(){
                if(event.keyCode===13){
                    $('#searchGoods').click();
                }
            })
            $('#goodLists').on('click','.item-delete',function(){
                var id=$(this).parents('tr').data('spu-id');
                if(id){
                    deleteItem(id);
                }
            })
        }
        //删除商品
        var deleteItem=function(id){
            layer.confirm('确定删除选中的商品吗？', { title: '友情提示' }, function (index) {
                var load = layer.load();
                ajaxModule.proxy({
                    url: '/goodsspu/'+id,
                    type: 'delete',
                    success: function (res) {
                        if (res.code === 0) {
                            getGoodLists(1, 0);
                        }
                        layer.close(load);
                        layer.close(index);
                    }
                })
               
               
            });
           
        }
        return {
            init: init
        }
    })();
    $(document).ready(function () {
        goodMoule.init();
    })
})(document, window, $)