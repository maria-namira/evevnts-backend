const combineRouters = require('koa-combine-routers');
 
const pingRouter = require('./ping');

const router = combineRouters(
  pingRouter
);
 
module.exports = router;