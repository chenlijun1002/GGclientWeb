var createBy = '';
var loginUserInfo = GetLoginUserCookie();
if (loginUserInfo != null) {
  createBy = loginUserInfo.UserID;
  $("input[name='userid']").val(loginUserInfo.UserID);
}
var urlParams = window.location.search;
if (urlParams.startsWith("?", 0))
  urlParams = urlParams.replace("?", "");
$("input[name='pOrderNo']").val(urlParams);
var file_index = 1;
var orderStatus = 0;
var params = new Object(); //创建params对象
params.orderno = urlParams;
params.createby = createBy;
var orderInfo = new Vue({
  el: '#OrderInfo',
  data: {
    items: [],
    order: '',
    intoLogs: [],
    complainHandleResult: '',
    //订单售后中...
    complainInfo: [],
    Images: [],
    RefundPrices: [],
    RealRefundPrices: [],
    OrderStatus: -1,
    //售后完成
    complete: 1,
  },
  computed: {
    aa: function() {
      if (this.order.States == 11) {
        return 1;
      } else if (this.order.States == 6 && this.order.FrozenOrder > 0) {
        return 2;
      }
    },
  },
  methods: {
    //复制
    copyToClipboard: function(value) {
      console.log(value);
      var aux = document.createElement("input");
      aux.setAttribute("value", value);
      document.body.appendChild(aux);
      aux.select();
      document.execCommand("copy");
      document.body.removeChild(aux);
      layer.msg("复制成功!");
    },
    //登录游戏
    GoToStartGame: function(shCode, gameName) {    
      parent.window.StartGame(shCode, gameName, 2);
    },
    //续租
    XuZu: function(orderNo, gameName, qName, fName, _price) {
      parent.window.Open("续租商品", "/html/mine/my_xuzu.html?orderno=" + orderNo + ",1", '380px', '450px');
    },
    //再租一次
    GoToProductInfo: function(GameID) {      
      window.location = '/html/hall/hall_detail.html?id=' + GameID;
      //window.parent.GoToUrl('/html/hall/hall_detail.html?id=' + GameID)
    },
    //申请售后
    ApplyForafterSale: function(orderNo, gameName, qName, fName, _price) {
      parent.window.Open("申请售后", "/html/mine/ApplyForafterSale.html?orderno=" + orderNo, '600px', '580px');
    },
  },
});
parent.mosutLoadOrderInfo = function() {
    LoadOrderInfo(params);
  },
  //订单售后中
  LoadOrderInfo(params);

function LoadOrderInfo(_params) {
  var url = 'order/getorder'; //url地址
  HttpGet(url, _params)
    .then(function(result) {
      console.log(result,'订单详情');
      //这里处理成功回调
      if (result.Code == 0) {
        orderInfo.order = result;
        orderStatus = result.States;
        if(result.Source){
          orderInfo.order.TotalRMB=result.RealRMBAdd;
        }else{
          orderInfo.order.TotalRMB=result.RealRMB;
        }
        $("#productImage").attr("src", "http://img.ggzuhao.com/img/ImgProc/ProcImg/" + orderInfo.order.GameID + ".jpg");
        LoadComplainInfo(result.RealRMB, result.Bail);
        orderInfo.OrderStatus = result.States;
        if (result.States == 3) {} else if (result.States == 8) //订单状态是投诉中就不能投诉
        {
          GetOrderComplainInfo();
        } else {
          $("#SubmitComplain").addClass("hide");
          if (result.States == 6 && result.FrozenOrder > 0)
            LoadIntoLogInfo();
          else if (result.States == 9)
            GetOrderComplainInfo();
          //GetComplainHandleResult();
        }
      } else
        layer.alert(result.Message, {
          title: '提示',
          icon: 5
        });
    })
    .catch(function(result) {
      //这里处理失败回调
      layer.alert("解析订单数据异常", {
        title: '提示',
        icon: 5
      });
    });
}
//获取订单售后中信息
function GetOrderComplainInfo() {
  //debugger
  var complainParams = new Object();
  complainParams.OrderNo = urlParams;
  var url = 'complain/getcomplain'; //url地址
  HttpGet(url, complainParams)
    .then(function(result) {
      console.log(result,'订单售后');
      //这里处理成功回调
      if (result.Code == "0") {              
        //result.ComplainTime=result.ComplainTime.replace('T','');
        result.ComplainDescribe=result.ComplainDescribe.replace('&lt;','');
        result.ComplainDescribe=result.ComplainDescribe.replace('&&gt;','');
        orderInfo.complainInfo = result;  
        if(orderStatus==8){
          var startTime=new Date(result.ComplainTimeStr).getTime();  
          var ts =parseInt(result.TotalSeconds);//计算剩余的毫秒数                  
          var daojishiTimer=setInterval(function(){                     
            var dd = parseInt(ts  / 60 / 60 / 24, 10);//计算剩余的天数
            var hh = parseInt(ts  / 60 / 60 % 24, 10);//计算剩余的小时数
            var mm = parseInt(ts  / 60 % 60, 10);//计算剩余的分钟数
            var ss = parseInt(ts  % 60, 10);//计算剩余的秒数
            dd = checkTime(dd);
            hh = checkTime(hh);
            mm = checkTime(mm);
            ss = checkTime(ss);
            if(ts>0){
              $("#ShengYuTimeLabel").text(dd + "天" + hh + "时" + mm + "分" + ss + "秒") ; 
              console.log(dd + "天" + hh + "时" + mm + "分" + ss + "秒",$("#ShengYuTimeLabel"))               
              ts--;
            }else if(ts<0){
              $("#ShengYuTimeLabel").text("00天00时00分00秒");
              clearInterval(daojishiTimer);
        　　　//location.reload();
            }
          },1000); 
        }                              
        GetComplainImages(orderInfo.complainInfo.ComplainDetailID);
        GetComplainRefunds(orderInfo.complainInfo.ComplainDetailID);
        GetComplainRealRefundPrices(orderInfo.complainInfo.ComplainDetailID);
      } else
        layer.alert(result.Message, {
          title: '提示',
          icon: 5
        });
    })
    .catch(function(result) {
      //这里处理失败回调
      layer.alert("解析投诉订单数据异常", {
        title: '提示',
        icon: 5
      });
    });
}
function checkTime(i){
    if (i < 10) {
        i = "0" + i;
    }
    return i;
}
//获取订单售后中信息  申请退还租号押金  申请退还交易金额
function GetComplainRealRefundPrices(complainDetailId) {
  var complainParams = new Object();
  complainParams.complainDetailID = complainDetailId;
  var url = 'complain/GetComplainRealRefundPrices'; //url地址
  HttpGet(url, complainParams)
    .then(function(result) {
      console.log(result,'订单售后信息');
      //这里处理成功回调
      if (result.Code == "0") {
        orderInfo.RealRefundPrices = result.Content;
        console.log(result.Content);
      } else
        layer.alert(result.Message, {
          title: '提示',
          icon: 5
        });
    })
    .catch(function(result) {
      //这里处理失败回调
      layer.alert("解析投诉实际退还金额数据异常", {
        title: '提示',
        icon: 5
      });
    });
}
