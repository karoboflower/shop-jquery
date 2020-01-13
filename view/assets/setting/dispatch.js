(function (document, window, $) {
    var ajaxModule = $.site.ajax;
  
    /**
    * 模块初始化
    * @return function
    */
    var dispatchModule = (function () {
        var pagination;
        var tempPage=1;
        var init = function () {
            getdispatchList(1,0);
            bind();
        }
        /**
        * 获取商品分类别表
        * @return 
        */
        var getdispatchList = function (pageNum,flag) {
            pageNum = pageNum ? pageNum : '1';
            var param={};
            param.current=pageNum;
            param.size=10;
            ajaxModule.proxy({
                url: '/delivery/page',
                type: 'get',
                success: function (res) {
                    if (res.code === 0) {
                        renderHtml(pageNum, flag, res.data.records,res.data.total,res.data.pages)
                        // var html = template('dispatch-table-tpl', { rowDatas: res.data.records });
                        // $('.all-total').empty().append('总记录：' + rowDatas.length)
                        // $('#typeDetails').empty().append(html);
                    }
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
            var html = template('dispatch-table-tpl', { rowDatas: result });
            $('#dispatchDetails').empty().append(html);
            if(flag===0){
                tempPage=1;
                $('#nav-pagination').empty();
                $('#nav-pagination').removeData("twbs-pagination");
                $('#nav-pagination').unbind('page');
                tempPage=1;
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
                        getdispatchList(page,1);
                    }
                }
            })
        }else{
            $('#nav-pagination').empty();
            $('#nav-pagination').removeData("twbs-pagination");
            $('#nav-pagination').unbind('page');
            $('#dispatchDetails').empty();
        }
     

    }
        //相关点击事件
        var bind = function () {
         
        }
      

        return {
            init: init,
        }
    })();
    $(document).ready(function () {
        dispatchModule.init();//商品分类模块初始化
    })
})(document, window, $)