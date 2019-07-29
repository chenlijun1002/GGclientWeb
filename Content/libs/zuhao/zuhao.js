var _GID = "";
var _QID = "";
var _FID = "";
var _QJ = "";
var _Where = "";
var params = new Object();
var _pageCount = 0;

$(document).ready(function() {
  params.pageIndex = 1;
  params.pageSize = 20;
  params.attribute = "";
  params.sort = "";
  loadQuery();
  var GameType = GetQueryString("GameTypeId"); 
  params.GameType=GameType; 
  LoadProductList(0);
  //parent.window.AddRecord(window.location.href);  

  $("#btnPrev").click(function() {
    if (params.pageIndex <= 1)
      params.pageIndex = 1;
    else
      params.pageIndex--;
    $("#lableNumber").html(params.pageIndex + ' / ' + _pageCount);
    LoadProductList();
  });
  $("#btnNext").click(function() {
    if (params.pageIndex >= 1000)
      params.pageIndex = 100;
    else if (params.pageIndex < _pageCount)
      params.pageIndex++;
    $("#lableNumber").html(params.pageIndex + ' / ' + _pageCount);
    LoadProductList();
  });

  //显示更多游戏模态框。
  $('.game-line span').on('click', function(e) {
    $(this).parent().siblings().removeClass('hide');
  });
  $('.game-box').on('click', 'span', function(e) {
    $(this).parent().parent().parent().addClass('hide').next().addClass('hide');
    //$('.hall-up').addClass('hide').siblings('.filter').addClass('active');
    setHeight();
  });
  $('.more-game .game-content .tabs-items').on('click', 'span', function(e) {
    $(this).addClass("active").siblings().removeClass("active");
    $($(".more-game .game-content .tabs-content .game-box")[$(this).index()]).addClass("active").siblings().removeClass("active");
  });
  //游戏区服筛选
  $('.select-item .item-tag').on('click', function(e) {
    if ($(this).siblings().css("display") == "none") {
      $(this).siblings().addClass('active').parent().siblings().children('.item-content').removeClass('active');
      event.stopPropagation();
    }
  });
  //选择后隐藏
  $('#gqf .item-content').on('click', 'span', function(e) {
    e.stopPropagation();
    $(this).parent().siblings('.item-tag').children('span').html($(this).html());
    $(this).parent().removeClass('active');
  });
  //进入区服筛选
  $('.hall-up .list').on('click', 'a', function(e) {
    e.preventDefault();
    //$('.hall-up').addClass('hide').siblings('.filter').addClass('active');
    setHeight();
  });
  $('#attributeList').on('click', '.item-content span', function() {    
    $(this).parent().siblings().addClass('active');
    var type;
    if($(this).attr('data-type')){
      type=$(this).attr('data-type').split('_');
      if(type[0]==2){
        if(type[1]==1){
          $(this).parent().siblings().children('span').text("押金 有");
        }else{
          $(this).parent().siblings().children('span').text("押金 无");
        }
      }else{
        if(type[1]==1){
          $(this).parent().siblings().children('span').text("起租限制 全部");
        }else{
          $(this).parent().siblings().children('span').text("起租限制 无");
        }
      }
    }        
    for (var i = 0; i < attributeList.items.length; i++) {
      if ($(this).parent().siblings().children('span').attr("value") == attributeList.items[i].AttributeName) {
        attributeList.items[i].Value = $(this).parent().siblings().children('span').attr("value") + " " + $(this).text();
        $(this).parent().siblings().children('i').attr("value", $(this).parent().siblings().children('span').attr("value") + "_" + $(this).text());
      }
    }
  });
  $('#attributeList').on('click', '.close', function() {
    $(this).parent().removeClass('active');
    if ($(this).siblings().attr("value") == "起租限制") {      
      $(this).siblings().text('起租限制');
    }
    if ($(this).siblings().attr("value") == "押金") {
      params.attribute = params.attribute.replace("2_1;", "");
      params.attribute = params.attribute.replace("2_2;", "");
      $(this).siblings().text('押金');
    } else if ($(this).siblings().attr("value") == "价格范围") {
      _QJ = "";
    } else {
      for (var i = 0; i < attributeList.items.length; i++) {
        if ($(this).siblings().attr("value") == attributeList.items[i].AttributeName) {
          attributeList.items[i].Value = $(this).siblings().attr("value");
          if (params.attribute.indexOf($(this).attr("value")) != -1) {
            params.attribute = params.attribute.replace($(this).attr("value") + ";", "");
          }
        }
      }
    }
    delete params.GameType;
    LoadProductList(1);
  });

  $('.game-modal').on('click', function() {
    $('.game-content').addClass('hide');
    $(this).addClass('hide');
  });

  $(document).click(function() {
    if ($("#GameList").css("display") == "block")
      $("#GameList").removeClass("active");
    if ($("#QList").css("display") == "block")
      $("#QList").removeClass("active");
    if ($("#FList").css("display") == "block")
      $("#FList").removeClass("active");
  });


});

var gameList = new Vue({
  el: '#GameList',
  data: {
    items: [],
    selectId:''
  },
  methods: {
    sltGame: function(gid, n) {
      sltGame(gid, n);   
    }
  }
});
var gameListTop = new Vue({
  el: '#gameListTop',
  data: {
    AllGameList:[],
    GameList: [],
    TV: [],
  },
  methods: {
    sltGame: function(gid, n) {
      sltGame(gid, n,1);
    },
    sltGQF: function(gid, qid, fid, n) {
      sltGQF(gid, qid, fid, n);
    }
  }
});
var qList = new Vue({
  el: '#QList',
  data: {
    items: []
  },
  methods: {
    sltQ: function(qid) {
      sltQ(qid);
    }
  }
});
var fList = new Vue({
  el: '#FList',
  data: {
    items: []
  },
  methods: {
    sltF: function(fid) {
      sltF(fid);
    }
  }
});
var attributeList = new Vue({
  el: '#attributeList',
  data: {
    items: []
  },
  methods: {
    sltAttribute: function(k, v) {
      sltAttribute(k, v);
    }
  }
});
var productList = new Vue({
  el: '#ProductList',
  data: {
    items: []
  },
  methods: {
    a: function(t) {
      var ja = JSON.parse(t);
      var song = "";
      $.each(ja, function(k, v) {
        if (song == "") {
          song = "租" + v.split(':')[0] + "送" + v.split(':')[1];
        } else {
          song = song + "/租" + v.split(':')[0] + "送" + v.split(':')[1];
        }
      })
      return song;
    },
    linkTo:function(ProductNumber){
      window.location.href='hall_detail.html?id='+ProductNumber;
    }
  }
});
var productListCount = new Vue({
  el: '#lableNumber',
  data: function() {
    return {
      items: [],
      pageCount: 0
    }

  }
});
var productListCount1 = new Vue({
  el: '#lableNumber1',
  data: function() {
    return {
      items: [],
      Count: 0
    }

  }
});

function loadQuery() {
  var id = GetQueryString('id');
  var name = GetQueryString_decodeURIComponent('name');
  var qid = GetQueryString('qid');
  var fid = GetQueryString('fid');
  var fname = GetQueryString_decodeURIComponent('fname');
  if (id != "" && name != "" && id != null && name != null) {
    setHeight();
    _GID = id;
    $("#spanItemG").text(name);


    if (qid != "" && qid != null && fname != null && fname != "" && fid != "" && fid != null && qid != "00000000-0000-0000-0000-000000000000" && fid != "00000000-0000-0000-0000-000000000000") {
      $("#spanItemF").text(fname);
      $("#spanItemQ").text(fname);
      _QID = qid;
      _FID = fid;
    }
  }
  var w = GetQueryString_decodeURIComponent('where');
  if (w != "" && w != null) {
    setHeight();
    $("#where").val(w);
    _Where = w;
  }

}

function LoadProductList(type,GameType) {
  params.json = JSON.stringify({
    "ID": _GID,
    "IDQ": _QID,
    "IDF": _FID,
    "QJ": _QJ,
    "where": _Where
  });
  var _index = layer.msg('查询中，请稍候', {
    icon: 16,
    time: false,
    shade: 0.1
  });
  //var GameTypeId = GetQueryString("GameTypeId");
  // if(GameTypeId==1){    
  //   var params2={};
  //   params2.pageIndex = 1;
  //   params2.pageSize = 20;
  //   params2.attribute = "";
  //   params2.sort = "";
  //   params2.GameType = GameTypeId;
  //   params2.json = JSON.stringify({
  //     "ID": _GID,
  //     "IDQ": _QID,
  //     "IDF": _FID,
  //     "QJ": _QJ,
  //     "where": _Where
  //   });
  // }
  // if(GameType){
  //   params.GameType=GameType;
  // }else{
  //   delete params.GameType;
  // }
  HttpGet("/product/GetZuHaoDaTing", params).then(function(result) {    
    if (result.Code == "0") {      
      gameList.items = result.game;        
      gameListTop.AllGameList = result.game;
      gameListTop.HotGameList = result.game.filter(function(v){ return v.GameTypeID==1});
      gameListTop.GameList = result.game.filter(function(v){ return v.GameTypeID==1});
      gameListTop.TV = result.tv;
      productList.items = result.list;
      productListCount.pageCount = Math.ceil(result.count / params.pageSize);
      _pageCount = Math.ceil(result.count / params.pageSize);
      productListCount1.Count = result.count;
      if (result.gameClassQ != null)
        qList.items = result.gameClassQ;
      if (result.gameClassF != null)
        fList.items = result.gameClassF;
      if (result.attribute != null && type == 0)
        attributeList.items = result.attribute;

      //console.log(result.page);
      $(".pages").html(result.page);
      $('.pages').show();
      scrollTop();
      $("#lableNumber").html(params.pageIndex + ' / ' + _pageCount);
    } else {
      console.log(result);
    } 
    if(productList.items.length){
      $('.pages').show();
    } else{
      $('.pages').hide();
    } 
    layer.close(_index);
  }).catch(function(result) {
    if(productList.items.length){
      $('.pages').show();
    } else{
      $('.pages').hide();
    }
    layer.close(_index);
    layer.msg('服务器异常')
  });

  return true;
}

function sltGQF(gid, qid, fid, n) {
  $("#spanItemG").text("影视专区");
  $("#spanItemF").text(n);
  $("#spanItemQ").text(n);
  params.pageIndex = 1;
  _GID = gid;
  _QID = qid;
  _FID = fid;
  delete params.GameType;
  LoadProductList(0);
}

function sltGame(gid, n,type) {
  if (gid == _GID) return;
  _GID = gid;
  _QID = _FID = _QJ = _Where = "";
  params.attribute = "";
  params.pageIndex = 1;
  $("#spanItemG").text(n);
  $("#spanItemQ").text("游戏区");
  $("#spanItemF").text("游戏服");
  $("#where").val("");
  $("#attributeList .item-content span").parent().siblings().removeClass('active');
  $("#QList").addClass('active');  
  $("#inputHidden").val(gid+','+n); 
  delete params.GameType;
  LoadProductList(0); 
  if(type){
    gameList.selectId=gid;
  }
}

function sltQ(qid) {
  if (qid == _QID) return;
  _QID = qid;
  params.pageIndex = 1;
  $("#spanItemF").text("游戏服");
  $("#FList").addClass('active');
  delete params.GameType;
  LoadProductList(1);
}

function sltF(fid) {
  if (fid == _FID) return;
  _FID = fid;
  params.pageIndex = 1;
  delete params.GameType;
  LoadProductList(1);
}

function onclick() {
  //location.reload();
  _QJ = _Where = params.attribute = "";
  params.pageIndex = 1;
  params.sort = -1;
  $("#where").val("");
  $("#attributeList .item-content span").parent().siblings().removeClass('active');
  delete params.GameType;
  LoadProductList(0);
}

function sltQJ(v) {
  _QJ = v;
  delete params.GameType;
  LoadProductList(1);
};

function sltAttribute(key, value) {  
  var attr = key + "_" + value;
  if (params.attribute.indexOf(attr) == -1) {
    var attrs = params.attribute.split(";");
    $.each(attrs, function(k, v) {
      if (v.length > 0) {
        if (v.substr(0, v.indexOf('_')) == key) {
          if (attrs.length > 1) {
            params.attribute = params.attribute.replace(v + ";", "");
          } else {
            params.attribute = params.attribute.replace(v, "");
          }
        }
      }
    });
    params.attribute = params.attribute + attr + ";";
  }
  delete params.GameType;
  LoadProductList(1);
};

function sequence(t, type) {
  delete params.GameType;
  if (type == "1") {
    params.sort = -1;
    $(t).siblings().removeClass("active");
  } else {
    if ($(t).attr("class") == "s-tag") {
      params.sort = 5;
      $(t).addClass("active").siblings().removeClass("active");
    } else {
      params.sort = 4;
      $(t).removeClass("active");
    }
  }
  delete params.GameType;
  LoadProductList(1);
};

function search() {
  _Where = $("#where").val();
  delete params.GameType;
  LoadProductList(1);
}

function setHeight() {
  // $('.hall-down .list').css('height', '472px');
  $('.hall-up').addClass('hide').siblings('.filter').addClass('active');
}

function scrollTop() {
  $('.list').scrollTop(0, 0);
}

function GoTo(t) {
  params.pageIndex = t;
  $("#lableNumber").html(params.pageIndex + ' / ' + _pageCount);
  LoadProductList();
}
