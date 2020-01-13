(function(document,window,$){
    var ajaxModule=$.site.ajax;
   var typeModule=(function(){
       var init=function(){
           $('.upload-file').selectImages({
            
           })
           getTypeList();
           bind();
       }
       var getTypeList=function(){
        ajaxModule.proxy({
            url:'/goodscategory/tree',
            type:'get',
            success:function(res){
                if(res.code===0){
                    var data=res.data;
                    var types=[];
                    types.push('<option value="0">顶级分类</option>')
                    for(var i=0;i<data.length;i++){
                        types.push(' <option value="'+data[i].id+'">'+data[i].name+'</option>')
                    }
                    $('#goodsType').empty().append(types);
                    
                }
            }
        })
       }    
       var bind=function(){
           $('#addTypeButton').on('click',function(){
               var name=$('#typeName').val();
               var parentId=$('#goodsType').val();
               var sort=$('#typeSort').val();
               var imageId=$('.uploader-list').find('input').attr('code');
               var goodsCategory = {
                "name":name,
                "parentId":parentId,
                "sort":sort,
                "imageId":imageId
               }
               addType(goodsCategory);
           })
       }
       var addType=function(params){
           ajaxModule.proxy({
            contentType:'application/json;charset=UTF-8',
            url:'/goodscategory',
            type:'post',
            data:JSON.stringify(params),
            success:function(res){
                if(res.code===0){
                    window.location.href="/goods/type.html";
                }else {
                    layer.msg('添加失败');
                    return false;
                }
                // if(res.status===0){
                //     var data=res.data;
                //     var types=[];
                //     types.push('<option value="1">顶级分类</option>')
                //     for(var i=0;i<data.length;i++){
                //         types.push(' <option value="'+data[i].id+'">'+data[i].name+'</option>')
                //     }
                //     $('#goodsType').empty().append(types);
                    
                // }
            }
           })
       }
     
       return {
           init:init,
       }
   })();
   $(document).ready(function(){
    typeModule.init();
   })
})(document,window,$)