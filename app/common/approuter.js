require('can-control');
require('framework7');

var can = require('can-util/namespace'),
  $ = require('can-jquery'),
  Route = require('route-parser'),
  pagebaseTemplate = can.stache(require('raw-loader!./pagebase.html'));

var AppRouter = can.Control.extend({
  defaults : {
    routes : {}
  }
},{
  init : function(el,ev){
    this.initRoutes();
    this.initFM7();
  },

  initFM7 : function(){
    this.FM7App = new Framework7({
      ajaxLinks : '.link',
      swipeBackPage : false,
      debug : true,
      sortable:false,
      smartSelectOpen : false,
      modalTitle : ' '
    });

    this.mainView = this.FM7App.addView('.view-main', {
      dynamicNavbar: true,
      domCache : true
    });
  },
  initRoutes : function(){
    initRoutesByPages(this);
    initRoutes(this);
  },
  openPage : function(Page, params){
    var self = this;

    var pageConfig = {
      content : pagebaseTemplate({})
    }
    self.mainView.allowPageChange = true;
    var $page = $(pageConfig.content).find('.page-content');

    var controller = new Page($page, params);
    return controller._preRenderPhase().then(function(){
      return controller._postRenderPhase();      
    }).then(function(){
      self.mainView.url = "";
      self.mainView.router.loadPage( pageConfig);
    });
  },

  '.page pageBeforeInit' : function(el,ev){
    console.log('pageBeforeInit')
    var page = ev.detail.page;
  },

  openPageByHash : function(hash){
    hash = hash || window.location.hash;
    hash = hash.replace(LEADING_HASH_REGEX, '');

    var pageHit = findPageHitByHash(this, hash);
    if(pageHit){
      return this.openPage(pageHit.page, pageHit.params);
    }
    if(hash === "" && this.options.defaultPage){
      return this.openPage(this.options.defaultPage);
    }
    return false;
  },

  '{window} hashchange' : function(el,ev){
    if(!this.openPageByHash()){
      console.error('page could not be found for hash ' + window.location.hash);
    }
  }
})

var LEADING_HASH_REGEX = /^#!|#/gm;

function initRoutesByPages(router){
  var pages = router.options.pages;
  if(pages){
    pages.forEach(function(page){
      if(page.route){
        router.options.routes[page.route] = page;
      }
    })
  }
}

function initRoutes(router){
  router.compiledRoutes = [];
  for(var route in router.options.routes){
    router.compiledRoutes.push({
      route : new Route(route),
      page : router.options.routes[route]
    })
  }
}


function findPageHitByHash(router, hash){

  for(var i=0;i<router.compiledRoutes.length; i++){
    var compiledRoute = router.compiledRoutes[i];
    var match = compiledRoute.route.match(hash);
    if(match){
      return {
        page : compiledRoute.page,
        params : match
      }
    }
  }
}

module.exports = AppRouter;
