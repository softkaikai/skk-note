const Koa = require('koa')
const Router = require('koa-router')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser');
const { koaBody } = require('koa-body');
const fs = require('fs')
const path = require('path')

const app = new Koa()
const router = new Router()

const fileDist = path.resolve(__dirname, './files')

router.get('/', (ctx, next) => {
  ctx.body = 'test'
})

router.post('/merge', (ctx, next) => {
  const { body } = ctx.request
  console.log('body', body);
  ctx.body = body
})

router.post('/uploadFile', (ctx, next) => {
  const formData = ctx.request.files
  const file = formData.file
  const body = ctx.request.body
  console.log('body', ctx.request.body);
  // console.log('files', formData);
  moveFile(file.filepath, path.join(fileDist, body.fileName))
  ctx.body = {status: 'success'}
})

app
.use(koaBody({multipart: true}))
.use(bodyParser())
.use(cors({'Access-Control-Allow-Origin': '*'}))
.use(router.routes())
.use(router.allowedMethods())
.listen(3001, () => {
  console.log('service in port 3001');
})

function moveFile(oldPath, newPath) {
  const rs = fs.createReadStream(oldPath)
  const ws = fs.createWriteStream(newPath)
  rs.pipe(ws)
  rs.on('end', () => {
    fs.unlinkSync(oldPath)
  })
}