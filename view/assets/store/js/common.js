(function () {
    $("#header").append('     <!-- 右侧内容 -->\n' +
        '        <div class="tpl-header-fluid">\n' +
        '            <!-- 侧边切换 -->\n' +
        '            <div class="am-fl tpl-header-button switch-button">\n' +
        '                <i class="iconfont icon-menufold"></i>\n' +
        '            </div>\n' +
        '            <!-- 刷新页面 -->\n' +
        '            <div class="am-fl tpl-header-button refresh-button">\n' +
        '                <i class="iconfont icon-refresh"></i>\n' +
        '            </div>\n' +
        '            <!-- 其它功能-->\n' +
        '            <div class="am-fr tpl-header-navbar">\n' +
        '                <ul>\n' +
        '                    <!-- 欢迎语 -->\n' +
        '                    <li class="am-text-sm tpl-header-navbar-welcome">\n' +
        '                        <a href=""></span>\n' +
        '                        </a>\n' +
        '                    </li>\n' +
        '                    <!-- 退出 -->\n' +
        '                    <li class="am-text-sm">\n' +
        '                        <a href="">\n' +
        '                            <i class="iconfont icon-tuichu"></i> 退出\n' +
        '                        </a>\n' +
        '                    </li>\n' +
        '                </ul>\n' +
        '            </div>\n' +
        '        </div>')

    $("#left").append('<!-- 侧边导航栏 -->\n' +
        '    <div class="left-sidebar">\n' +
        '        <!-- 一级菜单 -->\n' +
        '        <ul class="sidebar-nav" id="left-nav">\n' +
        '            <li class="sidebar-nav-heading"></li>\n' +
        '                <li class="sidebar-nav-link">\n' +
        '                    <a href="/index/index.html" class="">\n' +
        '                        <i class="iconfont sidebar-nav-link-logo icon-home" style=""></i>\n' +
        '                        首页\n' +
        '                    </a>\n' +
        '                </li>\n' +
        '            <li class="sidebar-nav-link">\n' +
        '                <a href="/goods/index.html" class="">\n' +
        '                    <i class="iconfont sidebar-nav-link-logo icon-goods" style=""></i>\n' +
        '                    商品管理                    </a>\n' +
        '            </li>\n' +
        '            <li class="sidebar-nav-link">\n' +
        '                <a href="/ord/index.html" class="">\n' +
        '                    <i class="iconfont sidebar-nav-link-logo icon-order" style=""></i>\n' +
        '                    订单管理                    </a>\n' +
        '            </li>\n' +

        '            <li class="sidebar-nav-link">\n' +
        '                <a href="/user/index.html" class="">\n' +
        '                    <i class="iconfont sidebar-nav-link-logo icon-user" style=""></i>\n' +
        '                    用户管理                    </a>\n' +
        '            </li>\n' +
        '            <li class="sidebar-nav-link">\n' +
        '                <a href="/store/index.html" class="">\n' +
        '                    <i class="iconfont sidebar-nav-link-logo icon-shop" style="color:#36b313;"></i>\n' +
        '                    门店管理                    </a>\n' +
        '            </li>\n' +
        '            <li class="sidebar-nav-link">\n' +
        '                <a href="/wxapp/index.html" class="">\n' +
        '                    <i class="iconfont sidebar-nav-link-logo icon-wxapp" style="color:#36b313;"></i>\n' +
        '                    小程序                    </a>\n' +
        '            </li>\n' +
        '            <li class="sidebar-nav-link">\n' +
        '                <a href="/setting/index.html" class="">\n' +
        '                    <i class="iconfont sidebar-nav-link-logo icon-setting" style=""></i>\n' +
        '                    设置                    </a>\n' +
        '            </li>\n' +
        '        </ul>\n' +
        '    </div>')
    $("#left-nav .sidebar-nav-link").eq(bodyConfig.active).find('a').addClass('active');
    var listLen = bodyConfig.bodyList.length;
    if (listLen > 0) {
        $("#left-nav").after('<ul id="leftBody" class="left-sidebar-second"></ul>')
        if (bodyConfig.hasOwnProperty('bodyTitle')) {
            $("#leftBody").append('<li class="sidebar-second-title">' + bodyConfig.bodyTitle + '</li>')
        }

        $("#leftBody").append('<li class="sidebar-second-item"></li>')

        for (var i = 0; i < listLen; i++) {
            if (!!bodyConfig.bodyList[i].active) {
                $(".sidebar-second-item").append('<a href="' + bodyConfig.bodyList[i].url + '" class="active">' + bodyConfig.bodyList[i].title + '</a>')
            } else {
                $(".sidebar-second-item").append('<a href="' + bodyConfig.bodyList[i].url + '" >' + bodyConfig.bodyList[i].title + '</a>')
            }
        }
    }

})()
