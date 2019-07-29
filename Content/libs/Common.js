//正式环境
// var apiUrl = "https://tclientwebapi.ggzuhao.com/api/";
var apiUrl = "https://tclientwebapi.ggzuhao.com/api/";
//apiUrl = "http://192.168.1.200:9092/api/";

window.userInfo = undefined;
function CommonGetTicket() {
    var _ticketInfo = '';
    //_ticketInfo = parent.window.GetTicket();
    return _ticketInfo;
}


function GetLoginUser() {
    return GetLoginUserCookie();
}


function HttpPost(_url, _params) {
    axios.defaults.baseURL = apiUrl;
    //axios.defaults.headers.common['Authorization'] = CommonGetTicket();
    axios.defaults.headers.post['Content-Type'] = 'application/json';
    return axios.post(_url, { params: _params })
       .then(function (response) {
           //console.log(response.data);
           return ResultDecrypt.AES_Decrypt(response.data);
       })
       .catch(function (response) {
           //console.log(response.data);
           return ResultDecrypt.AES_Decrypt(response.data);
       });
}
function HttpGet(_url, _params) {
    axios.defaults.baseURL = apiUrl;
    //axios.defaults.headers.common['Authorization'] = CommonGetTicket();
    return axios.get(_url, { params: _params,timeout: 10000, })
       .then(function (response) {
           // console.log(response.data);
           return ResultDecrypt.AES_Decrypt(response.data);
       })
       .catch(function (response) {
           //console.log(response.data);
           return ResultDecrypt.AES_Decrypt(response.data);
       });
}


var ResultDecrypt = {
    AES_Decrypt: function (result) {
        var key = "62B1A91267B39EEC50E7DCECE575E19D"     //秘钥必须为：8/16/32位
        //解密
        var decrypt = CryptoJS.AES.decrypt(result, CryptoJS.enc.Utf8.parse(key), {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7
        });
        //console.log("解密value: " + decrypt.toString(CryptoJS.enc.Utf8));
        var resultText = eval('(' + decrypt.toString(CryptoJS.enc.Utf8) + ')');
        return resultText;
    }
}
var BaseAPIUrl = {
    url: function () {
        return apiUrl;
    }
}
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]); return null;
}
function GetQueryString_decodeURIComponent(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) return decodeURIComponent(r[2]); return null;
}

function ShowLoading() {
    $("#divLoading").addClass("active");
}
function CloseLoading() {
    $("#divLoading").removeClass("active");
}

function SetLoginUserCookie(_userInfo) {
    var _cookie = escape(_userInfo);
    $.cookie("LoginUser", _cookie, { path: '/' });
}
function GetLoginUserCookie() {

    //return { "UserID": "32ce46c4-833f-432b-a3bc-6c37225832f9" };
    var _cookie = $.cookie('LoginUser');
    if (_cookie != null && _cookie !=""&& _cookie != undefined) {
        var _userInfo = unescape(_cookie);
        var _userObj = eval('(' + _userInfo + ')');
        return _userObj;
    }
    return null;


}
//获取登录用户信息
function GetUserInfo() {
    if (userInfo) {
        return userInfo
    } else {
        if (layer) {
            layer.alert(result.Message, { title: '提示', icon: 5 });
        } else {
            alert("您还未登录，请先登录！");
        }
    }
}

//设置登录用户
function SetLoginUser(user) {
    userInfo = eval("(" + user + ")");
    //设置用户头像、名称、余额
    $('#logState').html(userInfo.NickName);
    $('#HeadImage').attr("src", userInfo.HeadImg);
    $('#HeadImage,#userName').unbind("click");
}
function LoginOutAccount() {
    layer.confirm("确认注销登录吗？", { title: '提示', icon: 3 }, function (index) {
        layer.close(index);
        $.cookie("LoginUser", '', { path: '/' });
        $("#HeadImage").attr("src", "../../Content/public/img/vendor_default.png");
        $("#userName").html('');
        $("#logState").show();
        $("#li_chognzhi_userbalance").addClass("hide");
    });
}

function GetSellerId() {
    var sellerId = '';
    sellerId = parent.window.GetSellerId();
    return sellerId;
}

Date.prototype.format = function (fmt) {
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}
