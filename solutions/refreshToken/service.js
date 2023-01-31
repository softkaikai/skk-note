const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
const cors = require('@koa/cors');

router.get('/', (ctx, next) => {
  ctx.body = 'kaikai'
})

router.get('/getBooks', (ctx, next) => {
  ctx.body = {
    books: ['222', '111', '333']
  }

})

app.use(cors({
  'Access-Control-Allow-Origin': '*'
}))

app.use(router.routes())
.use(router.allowedMethods())
.listen(3001, () => {
  console.log('service in port 3001');
})