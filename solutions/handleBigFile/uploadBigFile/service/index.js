const Koa = require('koa')
const Router = require('koa-router')
const cors = require('@koa/cors')
const bodyParser = require('koa-bodyparser');
const { koaBody } = require('koa-body');
const serve = require('koa-static2')
const fs = require('fs')
const path = require('path')
const fse = require('fs-extra')

const app = new Koa()
const router = new Router()

const fileDist = path.resolve(__dirname, './files')


router.get('/fileInfo', (ctx, next) => {
  const { query } = ctx.request
  const dir = path.resolve(fileDist, getDirName(query))
  // 判断文件是否已经存在
  if (!fs.existsSync(dir)) {
    ctx.body = {
      chunks: [],
      exist: false
    }
  } else {
    const files = fs.readdirSync(dir)
    ctx.body = {
      // 返回文件分片的index
      chunks: files.map(file => Number(getLast(file.split('-')))),
      exist: true
    }
  }
})

router.post('/merge', (ctx, next) => {
  const { body } = ctx.request
  ctx.body = body
})

router.post('/uploadFile', (ctx, next) => {
  const formData = ctx.request.files
  const file = formData.file
  const body = ctx.request.body
  const dirname = getDirName(body)
  fse.move(file.filepath, path.join(fileDist, dirname, `${body.fileName}-${body.index}`))
  ctx.body = {status: 'success'}
})

app
.use(serve('static', path.resolve(__dirname, '../client')))
.use(koaBody({multipart: true}))
.use(bodyParser())
.use(cors({'Access-Control-Allow-Origin': '*'}))
.use(router.routes())
.use(router.allowedMethods())
.listen(3001, () => {
  console.log('service in port 3001');
})


function getDirName(data) {
  return `${data.fileName}-${data.md5}-${data.extName}`
}

function getLast(arr) {
  return arr[arr.length - 1]
}