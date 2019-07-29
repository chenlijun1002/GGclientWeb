$("#loginBox_li1").click(function() {
  _hmt.push(['_trackEvent', '登录弹框', '点击量', '手机号验证登录']);
  $(this).addClass('active');
  $('#loginBox_li2').removeClass('active');
  $('#loginBox_pone .btn_login').parent().addClass('submit_btn');
  $('#loginBox_over .btn_login').parent().removeClass('submit_btn');
  $('#loginBox_pone').css('display', 'block');
  $('#loginBox_over').css('display', 'none');
});
$("#loginBox_li2").click(function() {
  _hmt.push(['_trackEvent', '登录弹框', '点击量', '账号密码登录']);
  $(this).addClass('active');
  $('#loginBox_li1').removeClass('active');
  $('#loginBox_over .btn_login').parent().addClass('submit_btn');
  $('#loginBox_pone .btn_login').parent().removeClass('submit_btn');
  $('#loginBox_pone').css('display', 'none');
  $('#loginBox_over').css('display', 'block');
});

var loginimgVerificationCodeInfo={
  guidvalue:''
};

//获取验证码
function loginGetVerifyCode(obj) {
  if (countdown != 0) {
    return false;
  }
  var form = $(obj).parents("form").get(0);
  var reg = /^1[2|3|4|5|6|7|8|9][0-9]{9}$/;
  var inputPhone = $.trim(form["phone"].value);
  if (!inputPhone) {
    layer.msg("手机号不能为空");
    form["phone"].focus();
    return false;
  }
  if (!reg.test(inputPhone)) {
    layer.msg("手机号码输入格式不正确");
    form["phone"].focus();
    return false;
  }
  var loadIndex = layer.load(2);
  HttpGet("Login/IsSendPhoneSMS", {
    phone: inputPhone
  }).then(function(result) {
    console.log(result);
    layer.close(loadIndex);
    if (result.Code == "0") {
      countdown = 60;
      var btn = $(obj);
      btn.css("cursor", "not-allowed");
      btn.attr('disabled', true);
      btn.text("重新发送(60s)");
       window.timer1 = window.setInterval(function() {
        countdown--;
        if (countdown == 0) {
          window.clearInterval(timer1);
          btn.css("cursor", "pointer");
          btn.text("获取短信验证码");
          btn.removeAttr("disabled");
          return;
        }
        btn.text("重新发送(" + countdown + "s)");
      }, 1000);
    } else if (result.Code == '30000') {
      // layer.msg('手机号码不存在,正在跳转注册页面...', {
      //   time: 3000, //20s后自动关闭
      //   end: function() {
      //     ShowBox(1);
      //   }
      // });
      layer.confirm('<div style="font-size:18px;color:#333;text-align:center;">该手机号未注册</div><div style="font-size:18px;color:#333;text-align:center;"><span id="second_num">5</span>S后自动跳转</div>', {
        time: 5000, //20s后自动关闭
        closeBtn:0,
        skin: 'custom-class',
        // btn: ['确定', '取消'],
        yes: function(index, layero){
          //按钮【按钮一】的回调
          layer.close(index);
          ShowBox(1);
          $('#registerPhone').val(inputPhone);
        },
        btn2: function() {
          clearInterval(window.timer);
        },
        success: function(index, layero) {
          var num=5;
           window.timer=setInterval(function(){
            num--;
            $('#second_num').text(num);
            if(num==0){
              ShowBox(1);
              $('#registerPhone').val(inputPhone);
              clearInterval(timer);
              layer.close(index);             
            }
          },1000)
        }
      });
    } else {
      layer.msg(result.Message);
    }
  }).catch(function(result) {
    layer.close(loadIndex);
  });
}

//手机号码 验证码 登录
function Ponelogin() {
  var reg = /^1[2|3|4|5|6|7|8|9][0-9]{9}$/;
  var loginPhone = $.trim($("#loginPhone").val());
  var loginPhoneCode = $.trim($("#loginPhoneCode").val());
  if (!loginPhone) {
    layer.msg("手机号不能为空");
    return;
  }
  if (!reg.test(loginPhone)) {
    layer.msg("手机号码输入格式不正确");
    return;
  }
  if (loginPhoneCode == '') {
    layer.msg("验证码不能为空");
    return;
  }
  HttpGet("Login/LoginBySMS2", {
    phoneCode: loginPhoneCode,
    phone: loginPhone
  }).then(function(result) {
    console.log(result,999);
    if (result.Code == "0") {
      SetLoginUserCookie(result.UserInfo);
      GetLoginUser();
      $("#inputPhone").text('');
      $("#inputPass").text('');
      document.getElementById("sfa").contentWindow.location.reload();
      $("body>div.active").removeClass('active');
      _status = 1;
      StartOrStopSetInterval();
      if(document.getElementById("sfa").src.indexOf('/html/login/login_access.html')>-1){
        document.getElementById("sfa").contentWindow.location.href='/Html/usual/index.html';
      }
    } else {
      layer.msg(result.Message);
    }
  }).catch(function(result) {
    layer.msg("登录失败");
  });
}


//账号密码 登录
function loginOver() {
  var reg = /^1[2|3|4|5|6|7|8|9][0-9]{9}$/;
  var loginPhoneOver = $.trim($("#loginPhoneOver").val());
  var loginpasswordOver = $.trim($("#loginpasswordOver").val());
  var imgVerificationCode = $.trim($("#loginVerificationCodeOver").val());  
  if (!loginPhoneOver) {
    layer.msg("手机号不能为空");
    return;
  }
  if (!reg.test(loginPhoneOver)) {
    layer.msg("手机号码输入格式不正确");
    return;
  }

  if (loginpasswordOver == '') {
    layer.msg("密码不能为空");
    return;
  }

  if(loginpasswordOver.length<6||loginpasswordOver.length>18){
    layer.msg("密码的长度为6~18位");
    return;
  }

  var display =$('#imgVerificationCodeBox').css('display');
  if(display != 'none'){
    if(!imgVerificationCode){
      layer.msg("图形验证码不能为空");
      return;
    }
  }

  var hasError = $.cookie('hasError');     
  if(hasError){
    console.log($.cookie('errorObj'))
    var errorObj=JSON.parse($.cookie('errorObj')); 
    if(errorObj.phone !==loginPhoneOver){
      $.removeCookie('errorObj');
      $.removeCookie('hasError');
    }else{
      var num=  errorObj.errorNum-0+1;      
      if(num>=5){
        layer.confirm('<div style="font-size:18px;color:#333;text-align:center;">操作频繁，30分钟后请再尝试登录！</div><div style="font-size:18px;color:#333;text-align:center;">可进行手机号验证登录！</div>', {
         // time: 5000, //20s后自动关闭
          closeBtn:0,
          skin: 'custom-class',
           btn: ['手机号验证登录', '取消'],
          yes: function(index, layero){
            //按钮【按钮一】的回调
            layer.close(index);
            $('#loginBox_li1').addClass('active');
            $('#loginBox_li2').removeClass('active');
            $('#loginBox_pone').css('display', 'block');
            $('#loginBox_over').css('display', 'none');
            $('#registerPhone').val(loginPhoneOver);
          },
          btn2: function(index, layero) {
            layer.close(index);
          }
        });
        return;        
      }
      if(num>=3){
        if(!loginimgVerificationCodeInfo.guidvalue) getImgVerifyCode();
        $("#loginVerificationCodeOver").parent().parent().show();                     
      }
    }
  } 
  var params={
    phone: loginPhoneOver,
    password: loginpasswordOver,
    verifyCode:imgVerificationCode,
    guidvalue:loginimgVerificationCodeInfo.guidvalue  
  };  
  HttpGet("Login/Login", params).then(function(result) {
    console.log(result,777);
    if (result.Code == "0") {
      SetLoginUserCookie(result.UserInfo);
      GetLoginUser();
      $("#inputPhone").text('');
      $("#inputPass").text('');
      document.getElementById("sfa").contentWindow.location.reload();
      $("body>div.active").removeClass('active');
      _status = 1;
      StartOrStopSetInterval();
      $.removeCookie('errorObj');
      $.removeCookie('hasError');
      if(document.getElementById("sfa").src.indexOf('/html/login/login_access.html')>-1){
        document.getElementById("sfa").contentWindow.location.href='/Html/usual/index.html';
      }
    } else {      
      if(result.Code=='30000'){
        layer.confirm('<div style="font-size:18px;color:#333;text-align:center;">该手机号未注册</div><div style="font-size:18px;color:#333;text-align:center;"><span id="second_num">5</span>S后自动跳转</div>', {
          time: 5000, //20s后自动关闭
          closeBtn:0,
          skin: 'custom-class',
          // btn: ['确定', '取消'],
          yes: function(index, layero){
            //按钮【按钮一】的回调
            layer.close(index);
            ShowBox(1);
            $('#registerPhone').val(loginPhoneOver);
          },
          btn2: function() {
            clearInterval(window.timer);
          },
          success: function(index, layero) {
            var num=5;
             window.timer=setInterval(function(){
              num--;
              $('#second_num').text(num);
              if(num==0){
                ShowBox(1);
                $('#registerPhone').val(loginPhoneOver);
                clearInterval(timer);
                layer.close(index);             
              }
            },1000)
          }
        });
      }else{
        layer.msg(result.Message);
        getImgVerifyCode();       
      }
      var hasError = $.cookie('hasError');            
      if(hasError){    
        var num=  errorObj.errorNum-0+1;  
        $.cookie('errorObj',JSON.stringify({errorNum:num,phone:loginPhoneOver}));       
        return;
      }
      $.cookie('hasError',true,{expires:1/24});
      $.cookie('errorObj',JSON.stringify({errorNum:1,phone:loginPhoneOver}));      
    }
  }).catch(function(result) {
    layer.msg("登录失败");
  });
}

//获取图片验证码
function getImgVerifyCode(){ 
  axios.get(apiUrl+'login/VerifyCode')
       .then(function (response) {           
            var arr=response.data.split(';');
            var result=arr[arr.length-2].split('|$')[0];          
            loginimgVerificationCodeInfo.guidvalue=result.substr(1);
            var imgurl='data:image/png;'+arr[arr.length-1];
            imgurl=imgurl.substr(0,imgurl.length-1);           
            $('#imgVerificationCode').attr('src',imgurl);        
       })
       .catch(function (response) {
           console.log(response.data);         
       });
  // HttpGet("login/VerifyCode").then(function(result) {
  //   console.log(result,7777);
  //  // loginimgVerificationCodeInfo.guidvalue=result;
  // }).catch(function(result) {
  //   console.log(result,222);
  //   //layer.msg(result);
  // });    
}