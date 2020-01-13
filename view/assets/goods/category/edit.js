(function(document,window,$){
    var ajaxModule=$.site.ajax;
    var urlParams=ajaxModule.splitUrlParams();
    var id=urlParams.id
   var editTypeModule=(function(){
       var init=function(id){
           $('.upload-file').selectImages({
           })
           getSingleType(id).then(function(data){
           getTypeList(data.parentId);
            $('#typeName').val(data.name);
            $('#typeSort').val(data.sort);
            $('#goodsType').val(data.parentId)
            if(data.imageId){
                $('.uploader-list').empty().append('<div class="file-item">'+
                '<img src="/file/show/'+data.imageId+'">'+
                '<input type="hidden"  value="'+data.imageId+'">'+
                '<i class="iconfont icon-shanchu file-item-delete"></i></div>');
            }else{
                $('.uploader-list').empty().append('<div class="file-item"><img src="/assets/public/images/noimage.jpg"></div>')
            }
        
           });
          
          
           bind();
       }
       var getSingleType=function(id){
           return new Promise(function(resolve,reject){
            ajaxModule.proxy({
                url:'/goodscategory/'+id,
                type:'get',
                success:function(res){
                    if(res.code===0){
                      
                        resolve(res.data);
                    }
                   
                }
            })
           })
       }
       var getTypeList=function(parentId){
        ajaxModule.proxy({
            url:'/goodscategory/tree',
            type:'get',
            success:function(res){
                if(res.code===0){
                    var data=res.data;
                    var types=[];
                    types.push('<option value="1">顶级分类</option>')
                    for(var i=0;i<data.length;i++){
                        types.push(' <option value="'+data[i].id+'">'+data[i].name+'</option>')
                    }
                    $('#goodsType').empty().append(types);
                    $('#goodsType').val(parentId);
                }
            }
        })
       }    
       var bind=function(){
           $('#addTypeButton').on('click',function(){
               var name=$('#typeName').val();
               var parentId=$('#goodsType').val();
               var sort=$('#typeSort').val();
               var imageId=$('.uploader-list').find('input').val();
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
            type:'put',
            data:JSON.stringify(params),
            success:function(res){
                if(res.code===0){
                    window.location.href="/goods/type.html";
                }else {
                    layer.msg('添加失败');
                    return false;
                }
            }
           })
       }
     
       return {
           init:init,
       }
   })();
   $(document).ready(function(){
    editTypeModule.init(id);
   })
})(document,window,$)