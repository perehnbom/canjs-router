var AppRouter = require('./approuter');
var FM7Router = AppRouter.extend({
  init : function(){
    AppRouter.prototype.init.call(this);
  }
})

module.exports = FM7Router;
