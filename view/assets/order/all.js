(function (document, window, $) {
    var ajaxModule = $.site.ajax;//获取组装的ajax请求方法
    var urlParams = ajaxModule.splitUrlParams();
    var getOrderModule = (function () {
        var pagination;
        var tempPage=1;
        var init = function () {
            getOrderList(1,0);
            bind()
        }
        var getOrderList=function(pageNum,flag){
            pageNum = pageNum ? pageNum : '1';
            var load=layer.load();
            var param={};
            param.current=pageNum;
            param.size=10;
            var orderNo=$('input[name="orderNo"]').val();
            if(orderNo){
                param.orderNo=orderNo
            }
            ajaxModule.proxy({
                url: '/order/queryOrderList',
                type: 'get',
                data:param,
                success: function (res) {
                    layer.close(load);
                    if (res.code === 0) {
                        renderHtml(res.data.records,res.data.total,flag)
                    }
                }
            })
        }
        var renderHtml=function(result,total,flag){
            $('.total-list').empty().append('总记录:'+total);
            if(result&&result.length){
                var html=template('order-list-tpl',{data:result});
                $('#orderList').empty().append(html);
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
                $('#orderList').empty();
            }
            
        }
        var bind = function () {
           $('#orderList').on('click','.show-image',function(){
              var src=$(this).attr('src');
              layer.photos({
                photos:{
                    "title": "订单", //相册标题
                    "id": 123, //相册id
                    "start": 0, //初始显示的图片序号，默认0
                    "data": [   //相册包含的图片，数组格式
                      {
                        "alt": "订单图片",
                        "pid": 666, //图片id
                        "src": src, //原图地址
                        "thumb": "" //缩略图地址
                      }
                    ]
                  }
                  ,shift: 5 
              }
               
              )
            //   layer.open({
            //     type: 1,
            //     title: false,
            //     closeBtn: 0,
            //     offset: ['10%', '10%'],//设置位移
            //     area: ['80%', '80%'],//设置相对于父页面的大小
            //     skin: 'layui-layer-nobg', //没有背景色
            //     shadeClose: true,
            //     content:'<div><img src="'+src+'"></div>'
            //   });
               
           })
           $('.am-icon-search').on('click',function(){
            getOrderList(1,0);
           })
           $('#orderList').on('click','.delivery',function(){
            var orderId=$(this).attr('code');
            ajaxModule.proxy({
                contentType: 'application/json;charset=UTF-8',
                url: '/order/deliverGoodsOrder/'+orderId,
                type: 'put',
                async:false,
                success: function (res) {
                    if (res.code === 0) {
                        getorderLists(1, 0);
                    }else{
                        layer.msg(res.msg);
                        return false;
                    }
                }
            })
            return false;
        })
        }
     
        
        return {
            init: init
        }
    })();
    $(document).ready(function () {
        getOrderModule.init();
    })
})(document, window, $)