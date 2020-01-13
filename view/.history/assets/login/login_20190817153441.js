$(function () {
    var cToken='';
    var tab = 'account_number';
    // 选项卡切换
    $(".account_number").click(function () {
        $('.tel-warn').addClass('hide');
        tab = $(this).attr('class').split(' ')[0];
        checkBtn();
        $(this).addClass("on");
        $(".message").removeClass("on");
        $(".form2").addClass("hide");
        $(".form1").removeClass("hide");
    });
    // 选项卡切换
    $(".message").click(function () {
        $('.tel-warn').addClass('hide');
        tab = $(this).attr('class').split(' ')[0];
        checkBtn();
        $(this).addClass("on");
        $(".account_number").removeClass("on");
        $(".form2").removeClass("hide");
        $(".form1").addClass("hide");

    });

    $('#num').keyup(function (event) {
        $('.tel-warn').addClass('hide');
        checkBtn();
    });

    $('#pass').keyup(function (event) {
        $('.tel-warn').addClass('hide');
        checkBtn();
    });

    $('#veri').keyup(function (event) {
        $('.tel-warn').addClass('hide');
        checkBtn();
    });

    $('#num2').keyup(function (event) {
        $('.tel-warn').addClass('hide');
        checkBtn();
    });

    $('#veri-code').keyup(function (event) {
        $('.tel-warn').addClass('hide');
        checkBtn();
    });

    // 按钮是否可点击
    function checkBtn() {
        $(".log-btn").off('click');
        if (tab == 'account_number') {
            var inp = $.trim($('#num').val());
            var pass = $.trim($('#pass').val());
            if (inp != '' && pass != '') {
                if (!$('.code').hasClass('hide')) {
                    code = $.trim($('#veri').val());
                    if (code == '') {
                        $(".log-btn").addClass("off");
                    } else {
                        $(".log-btn").removeClass("off");
                        sendBtn();
                    }
                } else {
                    $(".log-btn").removeClass("off");
                    sendBtn();
                }
            } else {
                $(".log-btn").addClass("off");
            }
        } else {
            var phone = $.trim($('#num2').val());
            var code2 = $.trim($('#veri-code').val());
            if (phone != '' && code2 != '') {
                $(".log-btn").removeClass("off");
                sendBtn();
            } else {
                $(".log-btn").addClass("off");
            }
        }
    }

    function checkAccount(username) {
        if (username == '') {
            $('.num-err').removeClass('hide').find("em").text('请输入账户');
            return false;
        } else {
            $('.num-err').addClass('hide');
            return true;
        }
    }

    function checkPass(pass) {
        if (pass == '') {
            $('.pass-err').removeClass('hide').text('请输入密码');
            return false;
        } else {
            $('.pass-err').addClass('hide');
            return true;
        }
    }

    function checkCode(code) {
        if (code == '') {
            // $('.tel-warn').removeClass('hide').text('请输入验证码');
            return false;
        } else {
            // $('.tel-warn').addClass('hide');
            return true;
        }
    }

    function checkPhone(phone) {
        var status = true;
        if (phone == '') {
            $('.num2-err').removeClass('hide').find("em").text('请输入手机号');
            return false;
        }
        var param = /^1[34578]\d{9}$/;
        if (!param.test(phone)) {
            // globalTip({'msg':'手机号不合法，请重新输入','setTime':3});
            $('.num2-err').removeClass('hide');
            $('.num2-err').text('手机号不合法，请重新输入');
            return false;
        }
        $.ajax({
            url: '/checkPhone',
            type: 'post',
            dataType: 'json',
            async: false,
            data: {phone: phone, type: "login"},
            success: function (data) {
                if (data.code == '0') {
                    $('.num2-err').addClass('hide');
                    // console.log('aa');
                    // return true;
                } else {
                    $('.num2-err').removeClass('hide').text(data.msg);
                    // console.log('bb');
                    status = false;
                    // return false;
                }
            },
            error: function () {
                status = false;
                // return false;
            }
        });
        return status;
    }

    function checkPhoneCode(pCode) {
        if (pCode == '') {
            $('.error').removeClass('hide').text('请输入验证码');
            return false;
        } else {
            $('.error').addClass('hide');
            return true;
        }
    }

    // 登录点击事件
    function sendBtn() {
        if (tab == 'account_number') {
            $(".log-btn").click(function () {
                // var type = 'phone';
                var inp = $.trim($('#num').val());
                var pass = $.trim($('#pass').val());
                if (checkAccount(inp) && checkPass(pass)) {
                    var ldata = {userinp: inp, password: pass};
                    if (!$('.code').hasClass('hide')) {
                        code = $.trim($('#veri').val());
                        if (!checkCode(code)) {
                            return false;
                        }
                        ldata.code = code;
                    }
                    $.ajax({
                        url: '/oauth/pcLogin',
                        type: 'post',
                        timeout: 50000,
                        data: {
                            username: inp,
                            password: pass,
                            code:code,
                            ctoken: cToken
                        },
                        success: function (data) {
                            if(data.code===0){
                                sessionStorage.setItem('loginUserInfo',JSON.stringify({'access_token':data.data}));
                                getCity().then(function(res){
                                    if(res&&res.data){
                                        sessionStorage.setItem('TENANTID',res.data.shopId);
                                        location.href = '/index/index.html'
                                    }
                                })
                               
                            }else{
                                layer.msg('登陆失败，请重新登陆');
                                return false;
                            }
                         
                        },
                        error: function () {
                            layer.open({

                                content: '服务无响应'  //这里content是一个DOM，这个元素要放在body根节点下
                            });
                        }
                    })
                } else {
                    return false;
                }
            });
        } else {
            $(".log-btn").click(function () {
                // var type = 'phone';
                var phone = $.trim($('#num2').val());
                var pcode = $.trim($('#veri-code').val());
                if (checkPhone(phone) && checkPass(pcode)) {

                } else {
                    $(".log-btn").off('click').addClass("off");
                    // $('.tel-warn').removeClass('hide').text('登录失败');
                    return false;
                }
            });
        }
    }

    // 登录的回车事件
    $(window).keydown(function (event) {
        if (event.keyCode == 13) {
            $('.log-btn').trigger('click');
        }
    });


    $(".form-data").delegate(".send", "click", function () {
        var phone = $.trim($('#num2').val());
        if (checkPhone(phone)) {
            $.ajax({
                url: '/getcode',
                type: 'post',
                dataType: 'json',
                async: true,
                data: {phone: phone, type: "login"},
                success: function (data) {
                    if (data.code == '0') {

                    } else {

                    }
                },
                error: function () {

                }
            });
            var oTime = $(".form-data .time"),
                oSend = $(".form-data .send"),
                num = parseInt(oTime.text()),
                oEm = $(".form-data .time em");
            $(this).hide();
            oTime.removeClass("hide");
            var timer = setInterval(function () {
                var num2 = num -= 1;
                oEm.text(num2);
                if (num2 == 0) {
                    clearInterval(timer);
                    oSend.text("重新发送验证码");
                    oSend.show();
                    oEm.text("120");
                    oTime.addClass("hide");
                }
            }, 1000);
        }
    });
    //刷新验证码
    var randomCode = '';

    $("#veri-sign").click(function () {
        refreshCode()
    })
    function refreshCode() {
        $.ajax({
            type: "GET",
            url: '/oauth/code',
            dataType: "json",
            success: function(result){
                if(result.code===0){
                    $("#veri-sign").attr('src',result.img);
                    cToken=result.cToken;

                }else{
                    layer.msg('获取验证码失败');
                    return false;
                }
             
            }
        });
     
    }
    function getCity(){
        return new Promise(function(resolve,reject){
            $.ajax({
                url:'/shop/keweixian.mtlyy.com',
                type:'post',
                async:true,
                data:{netname:'keweixian.mtlyy.com'},
                success:function(res){
                    resolve(res)
                }
            })
        })
    }

    refreshCode()
});