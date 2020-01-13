(function (document, window, $) {
    var ajaxModule = $.site.ajax;//获取组装的ajax请求方法
    var urlParams=ajaxModule.splitUrlParams();
    var id=urlParams.id;
    var detailModule = (function () {

        var init = function (id) {
            getDetailLists(id);
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
        var getDetailLists = function (id) {
            var load = layer.load();
            ajaxModule.proxy({
                url: '/order/queryOrderDetail/'+id,
                type: 'get',
                success: function (res) {
                    if (res.code === 0) {
                        renderHtml(res.data)
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
        var renderHtml = function (result) {
            var html = template('detail-list-tpl', { da: result });
            $('#showDetails').empty().append(html);
            if(result.orderStatus===10&&result.payStatus===20){
                $('.order-detail-progress').addClass('progress-2');
                
            }else if(result.orderStatus===30&&result.deliveryStatus===40){
                $('.order-detail-progress').addClass('progress-2');
                $('.order-detail-progress').addClass('progress-3');
            }else if(result.orderStatus===50&&result.receiptStatus===60){
                $('.order-detail-progress').addClass('progress-2');
                $('.order-detail-progress').addClass('progress-3');
                $('.order-detail-progress').addClass('progress-5');
            }else {
                $('.order-detail-progress').addClass('progress-1');
            }
        }
        //相关点击事件
        var bind=function(){
            $('#showDetails').on('click','.show-image',function(){
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
                  })
                 
             })
        }
        return {
            init: init
        }
    })();
    $(document).ready(function () {
        detailModule.init(id);
    })
})(document, window, $)