(function (document, window, $) {
    var ajaxModule = $.site.ajax;
    var typeId = [];
    /**
    * 模块初始化
    * @return function
    */
    var typeModule = (function () {
        var init = function () {
            getTypeList();
            bind();
        }
        /**
        * 获取商品分类别表
        * @return 
        */
        var getTypeList = function () {
            ajaxModule.proxy({
                url: '/goodscategory/tree',
                type: 'get',
                success: function (res) {
                    if (res.code === 0) {
                        var rowDatas = renderHtml(res.data);
                        var html = template('type-list-tpl', { rowDatas: rowDatas });
                        $('.all-total').empty().append('总记录：' + rowDatas.length)
                        $('#typeDetails').empty().append(html);
                    }
                }
            })
        }
        /**
        * 渲染商品分类别表
        * @params result 商品分类列表
        * @object
        * @return 
        */
        var renderHtml = function (result) {
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
                                name: '--' + childrens[j].name,
                                imageId: childrens[j].imageId,
                                parentId: childrens[j].parentId,
                                sort: childrens[j].sort,
                                createTime: childrens[j].createTime
                            })

                        }
                    } else {

                    }
                }

                return rowDatas;



            }
        }
        //相关点击事件
        var bind = function () {
            $('#typeDetails').on('click', '.item-delete', function () {
                var id = $(this).parents('tr').data('id');
                if (id) {
                    ajaxModule.proxy({
                        url: '/goodscategory/tree',
                        type: 'get',
                        success: function (res) {
                            var typeId = renderHtml(res.data);
                            var type = [];
                            for (var i = 0; i < typeId.length; i++) {
                                if (id === typeId[i].parentId) {
                                    layer.msg('请先删除分类下面的子类');
                                    return false;
                                }
                                if (id !== typeId[i].id) {
                                    type.push(' <option value="' + typeId[i].id + '">' + typeId[i].name + '</option>');
                                }

                            }
                            layer.confirm('直接删除会删除分类下的商品，建议先转移该分类下的商品？', {
                                btn: ['直接删除', '先转移分类下的商品'], //按钮
                                title: '友情提示',
                            }, function (index) {
                                var load = layer.load();
                                ajaxModule.proxy({
                                    url: '/goodscategory/delete?delId=' + id + '&newId=-1',
                                    type: 'delete',
                                    success: function (res) {
                                        if (res.code === 0) {
                                            layer.msg('删除成功');
                                            layer.close(load);
                                            getTypeList();
                                        }
                                    }
                                })
                                layer.close(index);

                            }, function () {
                                var html = '  <div class="am-form-group">' +
                                    '<div class="am-u-sm-9 am-u-end">' +
                                    '<select style="width:100%" id="goodsTypeM"  data-am-selected="{searchBox: 1, btnSize: sm}">' + type.join('') +
                                    '</select></div></div>';
                                layer.open({
                                    type: 1
                                    , id: '2'
                                    , title: '转移商品至其他分类'
                                    , skin: ''
                                    , area: '300px'
                                    , offset: 'auto'
                                    , anim: 1
                                    , closeBtn: 1
                                    , shade: 0.3
                                    , btn: ['确定', '取消']
                                    , content: html
                                    , yes: function (index, layero) {
                                        var load = layer.load();
                                        var newId = layero.find('#goodsTypeM').val();
                                        ajaxModule.proxy({
                                            url: '/goodscategory/delete?delId=' + id + '&newId=' + newId,
                                            type: 'delete',
                                            success: function (res) {
                                                if (res.code === 0) {
                                                    layer.msg('删除成功');
                                                    layer.close(load);
                                                    getTypeList();
                                                }
                                            }
                                        })
                                        layer.close(index);
                                    }
                                });


                            });
                        }
                    })
                }
            })
            $('#typeDetails').on('dblclick', 'tr', function () {
                var id = $(this).data('id');
                showDetails(id)
            })
            $('body').on('click', '.show-image', function () {
                var imgSrc = $(this).attr('src');
                layer.photos({
                    photos:
                    {
                        "title": "", //相册标题
                        "id": 123, //相册id
                        "start": 0, //初始显示的图片序号，默认0
                        "data": [   //相册包含的图片，数组格式
                            {
                                "alt": "",
                                "pid": 666, //图片id
                                "src": imgSrc, //原图地址
                                "thumb": "" //缩略图地址
                            }
                        ]
                    } //格式见API文档手册页
                    , anim: 5 //0-6的选择，指定弹出图片动画类型，默认随机
                });
            })
        }
        var showDetails = function (id) {
            var load = layer.load();
            ajaxModule.proxy({
                url: '/goodscategory/' + id,
                type: 'get',
                success: function (res) {
                    if (res.code === 0) {
                        layer.open({
                            type: 1,
                            title: false,
                            closeBtn: 0,
                            shadeClose: true,
                            skin: '',
                            content: template('detail-list-tpl', { da: res.data })
                        });
                    }
                    layer.close(load);
                }
            })

        }

        return {
            init: init,
        }
    })();
    $(document).ready(function () {
        typeModule.init();//商品分类模块初始化
    })
})(document, window, $)