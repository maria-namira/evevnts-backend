const Router = require('koa-router');

const router = new Router();

router.get('/ping', async (ctx) => {
  ctx.response.body = { status: 'pong' };
});

module.exports = router;