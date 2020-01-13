(function (document, window, $) {
    var ajaxModule = $.site.ajax;//获取组装的ajax请求方法
    var orderModule = (function () {
        var pagination;
        var tempPage=1;
        var init = function () {
            getorderLists(1, 0);
            bind();
        }
       
        /**
        * 获取文件库列表详情数据
        * @param result 分类列表
        * @param object
        * @return
        */
        renderType = function (pageNum, flag, result,total) {
            if (result&&result.length) {
                
                $('#typeDetails').empty().append(types.join(''));
            }
        }

        /**
        * 获取商品列表
        * @param pageNum 当前页 flag 是否首次进入 
        * @return
        */
        var getorderLists = function (pageNum, flag) {
            pageNum = pageNum ? pageNum : '1';
            var param={};
            param.current=pageNum;
            param.size=10;
            param.orderStatus=10;
            // var name=$('input[name="goods_name"]').val();
            // var types=$('#typeDetails').val();
            // var status= $('#currentTypes').val();
            // if(name){
            //     param.goodsName=name
            // }
            // if(types){
            //     param.categoryId=types;
            // }
            // if(status){
            //     param.goodsStatus=status;
            // }
            var load = layer.load();
            ajaxModule.proxy({
                url: '/order/queryOrderList',
                type: 'get',
                data: param,
                success: function (res) {
                    if (res.code === 0) {
                        renderHtml(res.data.records,res.data.total,flag)
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
        var renderHtml = function (result,total,flag) {
            $('.total-list').empty().append('总记录:'+total);
            if(result&&result.length){
                var html=template('pay-list-tpl',{data:result});
                $('#payLists').empty().append(html);
                if(flag===0){
                    $('#nav-pagination').empty();
                    $('#nav-pagination').removeData("twbs-pagination");
                    $('#nav-pagination').unbind('page');
                }
                var visiableCount=5;
                var totals=parseInt(total/20);
                if(total%10!==0){
                    totals++;
                }
                if(totals<visiableCount){
                    visiableCount=totals;
                }
                pagination=$('#nav-pagination').twbsPagination({
                    totalPages: totals,//总页数
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
                            getOrderList(page,0);
                        }
                    }
                })
            }else{
                $('#nav-pagination').empty();
                $('#nav-pagination').removeData("twbs-pagination");
                $('#nav-pagination').unbind('page');
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
        }
        return {
            init: init
        }
    })();
    $(document).ready(function () {
        orderModule.init();
    })
})(document, window, $)