(function () {
    var ajaxModule = $.site.ajax;//获取组装的ajax请求方法
    // 商品规格数据
    var data = {
        spec_attr: [],
        spec_list: [],
        goodsSkus: [],
    }

        // 配置信息
        , setting = {
            container: '.goods-spec-many'
        };

    function GoodsSpec(options, baseData) {
        // 配置信息
        setting = $.extend(true, {}, setting, options);
        // 已存在的规格数据
        typeof baseData !== 'undefined' && baseData !== null && (data = baseData);
        // 初始化
        this.initialize();
    }

    GoodsSpec.prototype = {
        /**
         * 初始化
         */
        initialize: function () {
            // 注册html容器
            this.$container = $(setting.container);
            this.$specAttr = this.$container.find('.spec-attr');
            // 显示添加规则组表单事件
            this.showAddSpecGroupEvent();
            // 确认新增规则组事件
            this.submitAddSpecGroupEvent();
            // 取消新增规则组事件
            this.cancelAddSpecGroupEvent();
            // 注册添加规格元素事件
            this.addSpecItemEvent();
            // 注册删除规则组事件
            this.deleteSpecGroupEvent();
            // 注册删除规则元素事件
            this.deleteSpecItemEvent();
            // 注册批量设置sku事件
            this.batchUpdateSku();
            // 注册表格input数据修改事件
            this.updateSpecInputEvent();
            // 渲染已存在的sku信息
            this.renderHtml();
        },
        /**
        * 添加规格图片
        */
        addSpecItemImageEvent: function () {

            var container = this.$container;
            var uploadImages=$(container).find('.data-image');
            uploadImages.each(function(){
                var index = $(this).parent().parent().data('index');
                var _image=$(this);
                $(this).selectImages({
                    multiple: false,
                    done: function (result) {
                        data.goodsSkus[index].fileId = result[0].file_id;
                        _image.empty().append('<img src="/file/show/'+result[0].file_id+'" alt=""> <i class="iconfont icon-shanchu image-delete"></i>');
                    }
                })
            })
            $(container).on('click','.image-delete',function(){
                var index=$(this).parents('tr').data('index');
                data.goodsSkus[index].fileId='';
                $(this).parent().empty().append('<i class="iconfont icon-add"></i>');
            })
            
        },
        /**
         * 显示添加规则组表单
         */
        showAddSpecGroupEvent: function () {
            // 显示添加规则组表单
            this.$container.on('click', '.btn-addSpecGroup', function () {
                var $specGroupButton = $(this).parent()
                    , $specGroupAdd = $specGroupButton.next();
                $specGroupButton.hide();
                $specGroupAdd.show();
            });
        },

        /**
         * 确认新增规则组
         */
        submitAddSpecGroupEvent: function () {
            var _this = this;
            // 确认添加
            _this.$container.on('click', '.btn-addSpecName', function () {
                var $specGroupAdd = $(this).parent().parent()
                    , $specGroupButton = $specGroupAdd.prev()
                    , $specNameInput = _this.$container.find('.input-specName')
                    , $specValueInput = _this.$container.find('.input-specValue')
                    , specValueInputValue = $specValueInput.val()
                    , specNameInputValue = $specNameInput.val();
                if (specNameInputValue === '' || specValueInputValue === '') {
                    layer.msg('请填写规则名或规则值');
                    return false;
                }
                // 添加到数据库
                var load = layer.load();
                ajaxModule.proxy({
                    contentType: 'application/json;charset=UTF-8',
                    url: '/goodsspec/savespec',
                    type: 'post',
                    data: JSON.stringify({ 'specName': specNameInputValue, 'specValues': [{ 'specValue': specValueInputValue }] }),
                    success: function (res) {
                        layer.close(load);
                        if (res.code === 0) {
                            var result = res.data;
                            $specNameInput.val('') && $specValueInput.val('');
                            // 记录规格数据
                            data.spec_attr.push({
                                specId: result.specId,
                                specName: result.specName,
                                specValues: [{
                                    specValueId: result.specValues[0].specValueId,
                                    specValue: result.specValues[0].specValue
                                }]
                            });



                            // 渲染规格属性html
                            _this.renderHtml();
                            // 隐藏添加规格组表单
                            $specGroupAdd.hide() && $specGroupButton.show();
                        } else {
                            layer.msg(res.msg);
                            return false;
                        }

                    }
                })
            });
        },

        /**
         * 取消新增规格组
         */
        cancelAddSpecGroupEvent: function () {
            this.$container.on('click', '.btn-cancleAddSpecName', function () {
                var $specGroupAdd = $(this).parent().parent()
                    , $specGroupButton = $specGroupAdd.prev();
                // 隐藏添加规格组表单
                $specGroupAdd.hide() && $specGroupButton.show()
            });
        },

        /**
         * 添加规则元素事件
         */
        addSpecItemEvent: function () {
            var _this = this;
            _this.$container.on('click', '.btn-addSpecItem', function () {
                var $this = $(this)
                    , $iptSpecItem = $this.prev('.ipt-specItem')
                    , specItemInputValue = $iptSpecItem.val()
                    , $specItemAddContainer = $this.parent()
                    , $specGroup = $specItemAddContainer.parent().parent();
                if (specItemInputValue === '') {
                    layer.msg('规格值不能为空');
                    return false;
                }
                // 添加到数据库
                var load = layer.load();
                ajaxModule.proxy({
                    contentType: 'application/json;charset=UTF-8',
                    url: '/goodsspec/savespecvalue',
                    type: 'post',
                    data: JSON.stringify({ 'specId': $specGroup.data('group-id'), 'specValue': specItemInputValue }),
                    success: function (res) {
                        layer.close(load);

                        if (res.code === 0) {
                            var result = res.data;
                            // 记录规格数据
                            data.spec_attr[$specGroup.data('index')].specValues.push({
                                specValueId: result.specValueId,
                                specValue: result.specValue
                            });

                            // 渲染规格属性html
                            _this.renderHtml();
                        } else {
                            layer.msg(res.msg);
                            return false;
                        }

                    }
                })

            });
        },

        /**
         * 删除规则组事件
         */
        deleteSpecGroupEvent: function () {
            var _this = this;
            _this.$container.on('click', '.spec-group-delete', function () {
                // 规则组索引
                var index = $(this).parent().parent().attr('data-index');
                var id = $(this).parent().parent().data('group-id');
              
                layer.confirm('确定要删除该规则组吗？确认后不可恢复请谨慎操作', function (layerIndex) {
                    layer.msg('删除成功');
                    // 删除指定规则组
                    data.spec_attr.splice(index, 1);
                    // 重新渲染规格属性html
                    _this.renderHtml();
                    // var load = layer.load();
                    // ajaxModule.proxy({
                    //     url: '/goodsspec/spec/' + id,
                    //     type: 'delete',
                    //     success: function (res) {
                    //         layer.close(load);
                    //         if (res.code === 0) {
                    //             layer.msg('删除成功');
                    //             // 删除指定规则组
                    //             data.spec_attr.splice(index, 1);
                    //             // 重新渲染规格属性html
                    //             _this.renderHtml();
                    //         }


                    //     }
                    // })

                    layer.close(layerIndex);
                });
            });
        },

        /**
         * 删除规则事件
         */
        deleteSpecItemEvent: function () {
            var _this = this;
            _this.$container.on('click', '.spec-item-delete', function () {
                var $item = $(this).parent()
                    , $specGroup = $item.parent().parent()
                    , groupIndex = $specGroup.attr('data-index')
                    , itemIndex = $item.attr('data-item-index'), itemId = $item.data('id');

                layer.confirm('确定要删除该规则吗？确认后不可恢复请谨慎操作', function (layerIndex) {
                    data.spec_attr[groupIndex].specValues.splice(itemIndex, 1);
                    _this.renderHtml();
                    layer.msg('删除成功');
                    // 删除指定规则
                    // var load = layer.load();
                    // ajaxModule.proxy({
                    //     url: '/goodsspec/specValue/' + itemId,
                    //     type: 'delete',
                    //     success: function (res) {
                    //         layer.close(load);
                    //         if (res.code === 0) {
                    //             layer.msg('删除成功');
                    //             data.spec_attr[groupIndex].specValues.splice(itemIndex, 1);
                    //             // 重新渲染规格属性html
                    //             _this.renderHtml();
                    //             layer.close(layerIndex);
                    //         }


                    //     }
                    // })

                });
            });
        },

        /**
         * 注册批量设置sku事件
         */
        batchUpdateSku: function () {
            var _this = this,
                $specBatch = _this.$container.find('.spec-batch');
            $specBatch.on('click', '.btn-specBatchBtn', function () {
                var formData = {};
                $specBatch.find('input').each(function () {
                    var $this = $(this)
                        , formType = $this.data('type')
                        , value = $this.val();
                    if (typeof formType !== 'undefined' && formType !== '' && value !== '') {
                        formData[formType] = value;
                    }
                });
                if (!$.isEmptyObject(formData)) {
                    data.spec_list.forEach(function (item, index) {
                        //data.goodsSkus[index].push(formData);
                        data.goodsSkus[index] = $.extend({}, data.goodsSkus[index], formData)
                        data.spec_list[index].form = $.extend({}, data.spec_list[index].form, formData);
                    });
                    // 渲染商品规格table
                    _this.renderTabelHtml();
                }
            });
        },

        /**
         * 渲染多规格模块html
         */
        renderHtml: function () {
            // 渲染商品规格元素
            if (data.spec_attr && data.spec_attr.length) {
                this.$specAttr.html(template('tpl_spec_attr', { spec_attr: data.spec_attr }));
                // 渲染商品规格table
                this.renderTabelHtml();
            }else{
                this.$specAttr.empty();
                this.renderTabelHtml();
            }

        },

        /**
         * 渲染表格html
         */
        renderTabelHtml: function () {
            var $specTabel = this.$container.find('.spec-sku-tabel')
                , $goodsSku = $specTabel.parent();
            // 商品规格为空：隐藏sku容器
            if (data.spec_attr.length === 0) {
                $specTabel.empty();
                $goodsSku.hide();
                return false;
            }
            // 构建规格组合列表
            this.buildSpeclist();
            // 渲染table
            $specTabel.html(template('tpl_spec_table', data));
            // 显示sku容器
            $goodsSku.show();
             //添加规格图片数据
             this.addSpecItemImageEvent();
        },

        /**
         * 构建规格组合列表
         */
        buildSpeclist: function () {
            // 规格组合总数 (table行数)
            var totalRow = 1;
            // var result2=this.calcDescartes(data.spec_attr);
            data.goodsSkus = [];
            this.resetGroup(data.spec_attr);
            for (var i = 0; i < data.spec_attr.length; i++) {
                totalRow *= data.spec_attr[i].specValues.length;
            }
            // 遍历tr 行
            var spec_list = [];
            for (i = 0; i < totalRow; i++) {
                var rowData = [], rowCount = 1, specSkuIdAttr = [];
                // 遍历td 列
                for (var j = 0; j < data.spec_attr.length; j++) {
                    var specId = data.spec_attr[j].specId;
                    var specName = data.spec_attr[j].specName;
                    var skuValues = data.spec_attr[j].specValues;
                    rowCount *= skuValues.length;
                    var anInterBankNum = (totalRow / rowCount)
                        , point = ((i / anInterBankNum) % skuValues.length);
                    if (0 === (i % anInterBankNum)) {
                        rowData.push({
                            rowspan: anInterBankNum,
                            item_id: skuValues[point].specValueId,
                            spec_value: skuValues[point].specValue
                        });
                    }
                    specSkuIdAttr.push(skuValues[parseInt(point.toString())].specValueId);
                    specSkuIdAttr.sort(function(a,b){
                        return parseInt(a)-parseInt(b);
                    })
                }
                spec_list.push({
                    spec_sku_id: specSkuIdAttr.join('_'),
                    rows: rowData,
                    form: {}
                });
            }
            // 合并旧sku数据
            if (data.spec_list.length > 0 && spec_list.length > 0) {
                for (i = 0; i < spec_list.length; i++) {
                    var overlap = data.spec_list.filter(function (val) {
                        return val.spec_sku_id === spec_list[i].spec_sku_id;
                    });
                    if (overlap.length > 0) {
                        spec_list[i].form = overlap[0].form;
                    }
                }
            }
            for (m = 0; m < spec_list.length; m++) {
                var form = spec_list[m].form;
                var spec_sku_id = spec_list[m].spec_sku_id;
                data.goodsSkus[m] = $.extend({}, data.goodsSkus[m], form);
                //fix me 临时测试
                // data.goodsSkus[m].fileId='4';
                data.goodsSkus[m].goodsSales = 0;

            }
            data.spec_list = spec_list;
        },
        resetGroup: function (object) {
            var newArray = [];
            var oldArray = new Map();
            object.forEach(function (item, index) {
                newArray.push([]);
                item.specValues.forEach(function (item1, index1) {
                    newArray[index].push(item1.specValueId);
                    oldArray.set(item1.specValueId, {
                        "specId": item.specId,
                        "specName": item.specName,
                        "specValue": item1.specValue,
                        "specValueId": item1.specValueId
                    })
                })
            })
            var goodsSku = this.calcDescartes(newArray);
            var goodsSkus = [];
            for (var i = 0; i < goodsSku.length; i++) {
                var goodItem = goodsSku[i];
                data.goodsSkus.push({
                    specValues: [],
                });
                if (goodItem && goodItem.length) {
                    for (var j = 0; j < goodItem.length; j++) {
                        if (oldArray.has(goodItem[j])) {
                            data.goodsSkus[i].specValues.push(oldArray.get(goodItem[j]));
                        }
                    }
                } else {
                    if (oldArray.has(goodItem)) {
                        data.goodsSkus[i].specValues.push(oldArray.get(goodItem));
                    }
                }

            }
        },
        calcDescartes: function (array) {
            if (array.length < 2) return array[0] || [];
            return [].reduce.call(array, function (col, set) {
                var res = [];
                col.forEach(function (c) {
                    set.forEach(function (s) {
                        var t = [].concat(Array.isArray(c) ? c : [c]);
                        t.push(s);
                        res.push(t);
                    })
                });
                return res;
            });
        },
        /**
         * 输入规格信息自动同步更新spec_list
         */
        updateSpecInputEvent: function () {
            var _this = this;
            _this.$container.find('.spec-sku-tabel').on('propertychange change', 'input', function () {
                var $this = $(this)
                    , dataType = $this.attr('name')
                    , specIndex = $this.parent().parent().data('index');
                data.spec_list[specIndex].form[dataType] = $this.val();
                data.goodsSkus[specIndex][dataType] = $this.val();
            });
        },

        /**
         * 获取当前data
         */
        getData: function () {
            return data;
        },

        /**
         * sku列表是否为空
         * @returns {boolean}
         */
        isEmptySkuList: function () {
            return !data.spec_list.length;
        }

    };

    window.GoodsSpec = GoodsSpec;

})();

