$(document).ready(function() {
  var opt = new ModelBox({
    "isShow": true
  });
});
var ModelBox = (function() {
  var ModelBox = function(option) {
    this.option = option || {};
    this.init();
  };
  ModelBox.prototype = {
    isShow: false,
    countdown: 60,
    init: function() {
      var _this = this;
      _this.isShow = this.option.isShow;
      var html =
        '<div id="message_box">' +
        '<div class="el-message-box__wrapper"><div class="el-message-box">' +
        '<div class="activity_close"></div>' +
        '<div class="activity_box">' +
        '<div class="row">' +
        '<input type="text" name="poneName" class="activity_box_input"  id="phoneValuebox" autocomplete="off" value="" placeholder="请输入手机号码">' +
        '</div>' +
        '<div class="row" style="margin-top: 5px;">' +
        '<label><input type="text" name="phoneCode" class="box-vali"  id="activityValue" placeholder="手机验证码"></label>' +
        '<button type="button" class="box-msg" id="phoneButtonbox" value="">获取验证码</button></div>' +
        '<div class="row" style="text-align: center;margin-top: 10px;"><button type="button" class="box-activity">立即领取</button></div>' +
        '<div class="row" style="text-align: center;margin-top: 10px;"><p class="activity_p">输入手机号领取红包</p><p class="activity_p">每个手机号只能领取一次哦</p></div>' +
        '</div>' +
        '</div></div>' +
        '<div class="v-modal" tabindex="0" style="z-index: 2003;"></div></div>';

      var ModelBoxCon = document.createElement("div");
      ModelBoxCon.setAttribute("class", "mask-layer");
      ModelBoxCon.innerHTML = html;
      document.getElementsByTagName("body")[0].appendChild(ModelBoxCon);
      if (!_this.isShow) {
        ModelBoxCon.style.display = "none";
      }
      // ModelBoxCon.querySelector(".activity_close").onclick = _this.eventsFn.bind("", this, ModelBoxCon);
      ModelBoxCon.querySelector(".activity_close").onclick = function() {
        document.getElementsByTagName("body")[0].removeChild(ModelBoxCon);
      };
      //获取验证码
      ModelBoxCon.querySelector(".box-msg").onclick = function() {
        var reg = /^1[2|3|4|5|6|7|8|9][0-9]{9}$/;
        var phone = document.getElementById("phoneValuebox").value;
        if (phone == '') {
          _this.layerAlert('请输入手机号码');
          return false;
        }else if (!reg.test(phone)) {
          _this.layerAlert('手机号码格式不正确');
          return false;
        } else {
          $.ajax({
            type: "GET",
            url: 'http://test.ggzuhao.com/Activity2/SendVerifyCode?phone=' + phone,
            dataType: 'json',
            success: function(result) {
              if (result.Result) {
                _this.settime();
              } else {
                _this.layerAlert(result.Msg);
              }
            },
            error: function(err) {
              console.log(err);
            },
          });
        }
      };
      //立即领取
      ModelBoxCon.querySelector(".box-activity").onclick = function() {
        var phone = document.getElementById("phoneValuebox").value;
        var code = document.getElementById("activityValue").value;
        $.ajax({
          type: "post",
          url: 'http://test.ggzuhao.com/Activity2/SavePhoneActivity',
          dataType: 'json',
          data: {
            phone: phone,
            code: code
          },
          success: function(result) {
            console.log(result);
            if (result.Result) {
              //去掉定时器的方法
              window.clearTimeout(window.t1);
              document.getElementsByTagName("body")[0].removeChild(ModelBoxCon);
              _this.Redinit(result.Content);
            } else {
              _this.layerAlert(result.Content);
            }
          },
          error: function(err) {
            console.log(err);
          },
        });
      };
    },
    //用户领取红包
    Redinit: function(ContentList) {
      _this = this;
      var Vhtml = '';
      Vhtml += '<div class="el-message-box__wrapper">';
      if (ContentList.length > 1) {
        Vhtml += '<div class="el-staeor-box">';
        Vhtml += '<div class="Redenvelopes_close closeBox"></div>';
        Vhtml += '<div class="Redenvelopes clearfix">';
        for (var i = 0; i < ContentList.length; i++) {
          Vhtml += '<div class = "Redenvelopes_li" >';
          Vhtml += '<div class = "Redenvelopes_li_top" >' + ContentList[i].Rules + '</div>';
          Vhtml += '<div class = "Redenvelopes_li_body" >' + ContentList[i].Money + '</div>';
          Vhtml += '</div>';
        }
        Vhtml += '</div>';
        Vhtml += '<div class="Redenvelopes_actire" id="Redenvelopes_actire"></div></div>';
      } else {
        Vhtml += '<div class="el-foure-box">';
        Vhtml += '<div class="Redenvelopesvip_close closeBox"></div>';
        Vhtml += '<div class="Redenvelopesvip clearfix">';
        Vhtml += '<div class = "Redenvelopesvip" >';
        Vhtml += '<div class = "Redenvelopesvip_li_top" >' + ContentList[0].Rules + '</div>';
        Vhtml += '<div class = "Redenvelopesvip_li_body">' + ContentList[0].Money + '</div>';
        Vhtml += '</div>';
        Vhtml += '</div>';
        Vhtml += '<div class="Redenvelopesvip_actire" id="Redenvelopesvip_actire"></div></div>';
      }
      Vhtml += '</div>';
      Vhtml += '<div class="v-modal" tabindex="0" style="z-index: 2003;"></div>';
      var RedinitBox = document.createElement("div");
      RedinitBox.setAttribute("class", "Redenvelopes-layer");
      RedinitBox.innerHTML = Vhtml;
      document.getElementsByTagName("body")[0].appendChild(RedinitBox);
      RedinitBox.querySelector(".closeBox").onclick = function() {
        document.getElementsByTagName("body")[0].removeChild(RedinitBox);
      }
      if (ContentList.length > 1) {
        RedinitBox.querySelector("#Redenvelopes_actire").onclick = function() {
          document.getElementsByTagName("body")[0].removeChild(RedinitBox);
          _this.uredinit();
        }
      }else {
        RedinitBox.querySelector("#Redenvelopesvip_actire").onclick = function() {
          document.getElementsByTagName("body")[0].removeChild(RedinitBox);
          _this.uredinit();
        }
      }
    },
    //用户扫描二维码
    uredinit: function() {
      var Vhtml = '';
      Vhtml += '<div class="el-message-box__wrapper">';
      Vhtml += '<div class="el-saoma-box"><div class="saoma_titei"> 扫码下载APP </div>';
      Vhtml += '<div class="saoma_img"><img src="../../Content/public/img/activity/saoma.jpg" alt=""></div>';
      Vhtml += '<div class="saoma_close">关闭</div></div>';
      Vhtml += '</div>';
      Vhtml += '<div class="v-modal" tabindex="0" style="z-index: 2003;"></div>';
      var UredinitBox = document.createElement("div");
      UredinitBox.setAttribute("class", "Redenvelopes-layer");
      UredinitBox.innerHTML = Vhtml;
      document.getElementsByTagName("body")[0].appendChild(UredinitBox);
      UredinitBox.querySelector(".saoma_close").onclick = function() {
        document.getElementsByTagName("body")[0].removeChild(UredinitBox);
      }
    },
    show: function() {
      document.querySelector(".mask-layer").style.display = "block";
      this.isShow = true;
    },
    hide: function() {
      document.querySelector(".mask-layer").style.display = "none";
      this.isShow = false;
    },
    //弹框
    layerAlert: function(text) {
      var Vhtml = '';
      Vhtml += '<div class="boxMureu_m">' + text + '</div>';
      var BoxMureu = document.createElement("div");
      BoxMureu.setAttribute("class", "boxMureu");
      BoxMureu.innerHTML = Vhtml;
      document.getElementsByTagName("body")[0].appendChild(BoxMureu);
      setTimeout(function() {
        document.getElementsByTagName("body")[0].removeChild(BoxMureu);
      }, 2000);
    },
    //倒计时
    settime: function() {
      var _generate_code = document.getElementById("phoneButtonbox");
      if (this.countdown == 0) {
        _generate_code.removeAttribute("disabled");
        _generate_code.innerHTML = "获取验证码";
        this.countdown = 60;
        return false;
      } else {
        _generate_code.setAttribute("disabled", "true");
        _generate_code.innerHTML = "重新发送(" + this.countdown + ")";
        this.countdown--;
      }
      var _this = this;
      window.t1 = window.setTimeout(function() {
        _this.settime();
      }, 1000);
    },

    eventsFn: function(e, doc, target) {
      var _thisEvent = target.target;
      if (_thisEvent.classList.contains("confirm")) {
        e.option.confirmCallBack();
      }
      doc.style.display = "none";
      e.isShow = false;
      return false;
    }

  } || {};
  return ModelBox;
})();
