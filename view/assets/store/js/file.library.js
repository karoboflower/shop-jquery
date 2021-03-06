; (function ($, window, document, undefined) {

    /**
     * 文件库模块
     * @param trigger
     * @param options
     * @constructor
     */
    var ajaxModule = $.site.ajax;
    var userInfo = ajaxModule.userInfo;
    var token = userInfo.access_token;
    var TENANTID=window.sessionStorage.getItem('TENANTID');
    function FileLibrary(trigger, options) {
        // 配置项
        var defaults = {
            type: 'image',
            layerId: 'file-library'
            , layerSkin: 'file-library'
        };
        this.options = $.extend({}, defaults, options);
        // 触发对象
        this.$trigger = trigger;
        this.$touch = null; // 当前触发元素
        // 容器元素
        this.$element = null;
        // 初始化对象事件
        this.init();
    }

    FileLibrary.prototype = {

        /**
         * 初始化
         */
        init: function () {
            var _this = this;
            // 打开文件库事件
            _this.triggerEvent();
        },

        /**
         * 打开文件库事件
         */
        triggerEvent: function () {
            var _this = this;
            // 点击开启文件库弹窗
            if (_this.$trigger !== false) {
                // 点击开启文件库弹窗
                _this.$trigger.unbind().click(function (e) {
                    if($(e.target).closest('.image-delete').length>0){
                    
                       
                    }else{
                        _this.$touch = $(this);
                        _this.showLibraryModal();
                    }
                
                });
            } else {
                _this.showLibraryModal();
            }
          
        },

        /**
         * 显示文件库弹窗
         */
        showLibraryModal: function () {
            var _this = this;

            _this.getJsonData({ group_id: 1 }, function (data) {
                data.is_default = true;
                _this.getImageData({ 'current': 1, "size": 32 }).then(function (result) {
                    layer.open({
                        type: 1
                        , id: _this.options.layerId
                        , title: '图片库'
                        , skin: _this.options.layerSkin
                        , area: '840px'
                        , offset: 'auto'
                        , anim: 1
                        , closeBtn: 1
                        , shade: 0.3
                        , btn: ['确定', '取消']
                        , content: template('tpl-file-library', { group_list: data, is_default: true, file_list: { result: result.records, current: result.current, totalPage:result.pages } })
                        , success: function (layero) {
                            // 初始化文件库弹窗
                            _this.initModal(layero);
                        }
                        , yes: function (index) {
                            // 确认回调
                            _this.done();
                            layer.close(index);
                        }
                    });
                })
            });
        },

        /**
         * 初始化文件库弹窗
         */
        initModal: function (element) {
            var _this = this;
            _this.$element = element;
            // 注册分组下拉选择组件
            _this.selectDropdown();
            // 注册分类切换事件
            _this.switchClassEvent();
            // 注册文件点击选中事件
            _this.selectFilesEvent();
            // 新增分组事件
            _this.addGroupEvent();
            // 编辑分组事件
            _this.editGroupEvent();
            // 删除分组事件
            _this.deleteGroupEvent();
            // 注册文件上传事件
            _this.uploadImagesEvent();
            // 注册文件删除事件
            _this.deleteFilesEvent();
            // 注册文件移动事件
            _this.moveFilesEvent();
            // 注册文件列表分页事件
            _this.fileListPage();
        },

        /**
         * 注册文件列表分页事件
         */
        fileListPage: function () {
            var _this = this;
            _this.$element.find('#file-list-body').on('click', '.switch-page', function () {
                var page = $(this).data('page');
                _this.renderFileList(page);
            });
        },

        /**
         * 文件移动事件
         */
        moveFilesEvent: function () {
            var _this = this
                , $groupSelect = _this.$element.find('.group-select');
            // 绑定文件选中事件
            $groupSelect.on('click', '.move-file-group', function () {
                $groupSelect.dropdown('close');
                var groupId = $(this).data('group-id')
                    , fileIds = _this.getSelectedFileIds();
                if (fileIds.length === 0) {
                    layer.msg('您还没有选择任何文件~', { offset: 't', anim: 6 });
                    return false;
                }
                var json=[];
                for(var i=0;i<fileIds.length;i++){
                    json.push({
                        fileId:fileIds[i],
                        groupId:groupId
                    })
                }
                layer.confirm('确定移动选中的文件吗？', { title: '友情提示' }, function (index) {
                    var load = layer.load();
                    ajaxModule.proxy({
                        contentType: 'application/json;charset=UTF-8',
                        url: '/file/movefile',
                        type: 'put',
                        data: JSON.stringify(json),
                        success: function (res) {
                            layer.close(load);
                            layer.close(index);
                            if (res.code === 0) {

                                _this.renderFileList();
                            }

                        }
                    })
                   
                });
            });
        },

        /**
         * 删除选中的文件
         */
        deleteFilesEvent: function () {
            var _this = this;
            _this.$element.on('click', '.file-delete', function () {
                var fileIds = _this.getSelectedFileIds();
                if (fileIds.length === 0) {
                    layer.msg('您还没有选择任何文件~', { offset: 't', anim: 6 });
                    return;
                }
                layer.confirm('确定删除选中的文件吗？', { title: '友情提示' }, function (index) {
                    var load = layer.load();
                    ajaxModule.proxy({
                        contentType: 'application/json;charset=UTF-8',
                        url: '/file/deletes/'+fileIds,
                        type: 'delete',
                        success: function (res) {
                            layer.close(load);
                            layer.close(index);
                            if (res.code === 0) {
                                _this.renderFileList();
                               
                            }

                        }
                    })
                    layer.close(index);
                });
            });
        },

        /**
         * 文件上传 (多文件)
         */
        uploadImagesEvent: function () {
            var _this = this;
            var loadIndex = null;
            // 文件大小
            var maxSize = 2;
            // 初始化Web Uploader
            var uploader = WebUploader.create({
                // 选完文件后，是否自动上传。
                auto: true,
                // 文件接收服务端。
                server: '/file/upload',
                // 选择文件的按钮。可选。
                // 内部根据当前运行是创建，可能是input元素，也可能是flash.
                pick: {
                    id: '.j-upload',
                    multiple: true
                },
                // 文件上传域的name
                fileVal: 'file',
                // 图片上传前不进行压缩
                compress: false,
                // 允许重复
                duplicate: true,
                // 文件总数量
                // fileNumLimit: 10,
                // 文件大小2m => 2097152
                fileSingleSizeLimit: maxSize * 1024 * 1024,
                // 只允许选择图片文件。
                accept: {
                    title: 'Images',
                    extensions: 'gif,jpg,jpeg,bmp,png',
                    mimeTypes: 'image/*'
                },
                // 文件上传header扩展
                headers: {
                    Authorization:token,
                    TENANTID:TENANTID
                }

            });
            //  验证大小
            uploader.on('error', function (type) {
                if (type === 'F_DUPLICATE') {
                    console.log('请不要重复选择文件！');
                } else if (type === 'F_EXCEED_SIZE') {
                    alert('文件大小不可超过' + maxSize + 'm 哦！换个小点的文件吧！');
                }
            });
            // 文件上传前触发,添加附带参数
            uploader.on('uploadBeforeSend', function (obj, data) {
                data.groupId = _this.getCurrentGroupId();
                if(!data.groupId){
                    data.groupId='0';
                }
            });
            // 文件上传成功，给item添加成功class, 用样式标记上传成功。
            uploader.on('uploadSuccess', function (file, response) {
                if (response.code === 0) {
                    var $list = _this.$element.find('ul.file-list-item');
                    $list.prepend(template('tpl-file-list-item', { data: [response.data] }));
                } else {
                    uploader.uploadError(file, response);
                }
            });
            // 监听文件上传失败
            uploader.on('uploadError', function (file, reason) {
                uploader.uploadError(file, reason);
            });
            // 文件上传失败回调函数
            uploader.uploadError = function (file, reason) {
                layer.msg(reason.msg, { anim: 6 });
            };
            // 文件开始上传
            uploader.on('startUpload', function () {
                loadIndex = layer.load();
            });
            // 文件上传结束
            uploader.on('uploadFinished', function () {
                layer.close(loadIndex);
            });
        },

        /**
         * 新增分组事件
         */
        addGroupEvent: function () {
            var _this = this
                , $groupList = _this.$element.find('.file-group > ul');
            _this.$element.on('click', '.group-add', function () {
                layer.prompt({ title: '请输入新分组名称' }, function (value, index) {
                    var load = layer.load();
                    ajaxModule.proxy({
                        contentType: 'application/json;charset=UTF-8',
                        url: '/filegroup',
                        type: 'post',
                        data: JSON.stringify({
                            groupType: 'goods_img',
                            groupName: value,
                            sort: 1
                        }),
                        success: function (res) {
                            layer.close(load);
                            layer.close(index);
                            if (res.code === 0) {
                                $groupList.append(template('tpl-group-item', {data:res.data}));
                                var $groupSelectList = _this.$element.find('.group-select > .group-list');
                                $groupSelectList.append(
                                    '<li>' +
                                    '    <a class="move-file-group" data-group-id="' + res.data.groupId + '"' +
                                    '       href="javascript:void(0);">' + res.data.groupName + '</a>' +
                                    '</li>'
                                );
                            }

                        }
                    })
                });
            });
        },

        /**
         * 编辑分组事件
         */
        editGroupEvent: function () {
            var _this = this;
            _this.$element.find('.file-group').on('click', '.group-edit', function () {
                var $li = $(this).parent()
                    , group_id = $li.data('group-id'), groupSort = $li.data('group-sort');
                layer.prompt({ title: '修改分组名称', value: $li.attr('title') }, function (value, index) {
                    var load = layer.load();
                    ajaxModule.proxy({
                        headers: {
                            "Content-Type": "application/json",
                            "X-HTTP-Method-Override": "PUT"
                        },
                        url: '/filegroup',
                        type: 'put',
                        data:
                            JSON.stringify({
                                groupId: group_id,
                                groupName: value,
                            })
                        ,
                        success: function (res) {
                            if (res.code === 0) {
                                layer.msg('修改成功');
                                layer.close(load);
                                layer.close(index);
                                $li.attr('title', value).find('.group-name').text(value);
                                var $groupSelectList = _this.$element.find('.group-select > .group-list');
                                $groupSelectList.find('[data-group-id="' + group_id + '"]').text(value);
                            }

                        }
                    })

                });
                return false;
            });
        },

        /**
         * 删除分组事件
         */
        deleteGroupEvent: function () {
            var _this = this;
            _this.$element.find('.file-group').on('click', '.group-delete', function () {
                var $li = $(this).parent()
                    , group_id = $li.data('group-id');
                layer.confirm('确定删除该分组吗？', { title: '友情提示' }, function (index) {
                    var load = layer.load();
                    ajaxModule.proxy({
                        url: '/filegroup/' + group_id,
                        type: 'delete',
                        success: function (res) {
                            layer.close(load);
                            layer.close(index);
                            if (res.code === 0) {
                                layer.msg('删除成功');
                                $li.remove();
                                var $groupSelectList = _this.$element.find('.group-select > .group-list');
                                $groupSelectList.find('[data-group-id="' + group_id + '"]').remove();
                            }

                        }
                    })
                });
                return false;
            });
        },

        /**
         * 注册文件选中事件
         */
        selectFilesEvent: function () {
            // 绑定文件选中事件
            this.$element.find('#file-list-body').on('click', '.file-list-item li', function () {
                $(this).toggleClass('active');

            });
        },

        /**
         * 分类切换事件
         */
        switchClassEvent: function () {
            var _this = this;
            // 注册分类切换事件
            _this.$element.find('.file-group').on('click', 'li', function () {
                var $this = $(this);
                // 切换选中状态
                $this.addClass('active').siblings('.active').removeClass('active');
                var groupId = $this.data('group-id');
                if (groupId) {
                    var params = { 'current': 1, 'size': 32, groupId: groupId };
                } else {
                    var params = { 'current': 1, 'size': 32 };
                }

                //重新渲染文件列表
                _this.getImageData(params).then(function (data) {
                    var html = template('tpl-file-list', { data: data.records, current: data.current,totalPage:data.pages });
                    _this.$element.find('#file-list-body').empty().append(html);
                })
            });
        },

        /**
         * 注册分组下拉选择组件
         */
        selectDropdown: function () {
            this.$element.find('.group-select').dropdown();
        },

        /**
         * 获取分组列表数据
         * @param params
         * @param success
         */
        getJsonData: function (params, callback) {
            var loadIndex = layer.load();
            $.site.ajax.proxy({
                url: '/filegroup/page',
                type: 'get',
                success: function (res) {
                    layer.close(loadIndex);
                    if (res.code === 0) {
                        callback && callback(res.data.records);
                    } else {
                        layer.msg(res.msg, { anim: 6 });
                    }
                }
            })
            // 获取文件库列表

        },
        /**
        * 获取文件库列表详情数据
        * @param params
        * @param success
        */
        getImageData: function (params) {
            return new Promise(function (resolve, reject) {
                var loadIndex = layer.load();
                $.site.ajax.proxy({
                    url: '/file/page',
                    type: 'get',
                    data: params,
                    success: function (res) {
                        layer.close(loadIndex);
                        if (res.code === 0) {
                            resolve(res.data);
                        } else {
                            layer.msg(res.msg, { anim: 6 });
                            return false;
                        }
                    }
                })

            })


        },
        /**
         * 重新渲染文件列表
         * @param page
         */
        renderFileList: function (page) {
            var _this = this
                , groupId = this.getCurrentGroupId();
            // 重新渲染文件列表
            _this.getImageData({ groupId: groupId, current: page || 1,size:'32' }).then(function(data){
                var html=template('tpl-file-list',  { data: data.records, current: data.current,totalPage:data.pages });
                _this.$element.find('#file-list-body').empty().append(html);
            }) 
        },
        /**
         * 重新渲染页面
         * @param page
         */
        renderList: function () {
            var _this = this;
            // 重新渲染文件列表
            _this.getJsonData('', function (data) {
                _this.getImageData({ 'current': 1, "size": 32 }).then(function (result) {
                    _this.$element.html(template('tpl-file-library', { group_list: data, is_default: true, file_list: { result: result.records, current: result.current, totalPage: result.pages } }));
                })

            });
        },

        /**
         * 获取选中的文件列表
         * @returns {Array}
         */
        getSelectedFiles: function () {
            var selectedList = [];
            this.$element.find('.file-list-item > li.active').each(function (index) {
                var $this = $(this);
                selectedList[index] = {
                    file_id: $this.data('file-id'),
                    file_name: $this.data('file-name')

                };
            });
            return selectedList;
        },

        /**
         * 获取选中的文件的ID集
         * @returns {Array}
         */
        getSelectedFileIds: function () {
            var fileList = this.getSelectedFiles();
            var data = [];
            fileList.forEach(function (item) {
                data.push(item.file_id);
            });
            return data;
        },

        /**
         * 获取当前分组id
         * @returns {*}
         */
        getCurrentGroupId: function () {
            return this.$element.find('.file-group > ul > li.active').data('group-id');
        },

        /**
         * 确认回调
         */
        done: function () {
            var selectedList = this.getSelectedFiles();
            selectedList.length > 0 && typeof this.options.done === 'function'
                && this.options.done(selectedList, this.$touch);
        }

    };

    // 在Jquery插件中使用FileLibrary对象
    $.fn.fileLibrary = function (options) {
        new FileLibrary(this, options);
    };
     // 在Jquery插件中使用FileLibrary对象
     $.fileLibrary = function (options) {
        new FileLibrary(false, options);
    };

})(jQuery, window, document);
