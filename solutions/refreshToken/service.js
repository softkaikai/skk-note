const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
const cors = require('@koa/cors');
const jwt = require('koa-jwt')

const { SECRET, getToken } = require('./tokenUtils')



router.get('/', (ctx, next) => {
  ctx.body = 'test page'
})

router.get('/public/refreshToken', (ctx, next) => {
  const query = ctx.query
  ctx.body = getToken(query, Number(query.expiresIn))
})

router.get('/getBooks', (ctx, next) => {
  ctx.body = '红楼梦, 西游记，水浒传，三国演义'
})

router.get('/getFoods', (ctx, next) => {
  ctx.body = '土豆, 玉米, 红薯'
})


app.use(cors({
  'Access-Control-Allow-Origin': '*'
}))

app.use(jwt({ secret: SECRET }).unless({ path: [/^\/public/] }));

app.use(router.routes())
.use(router.allowedMethods())
.listen(3001, () => {
  console.log('service in port 3001');
})