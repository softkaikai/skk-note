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
      completed: false,
      exist: false
    }
  } else {
    const files = fs.readdirSync(dir)
    const completedFileName = `${query.fileName}.${query.extName}`
    ctx.body = {
      // 返回文件分片的index
      chunks: files.map(file => Number(getLast(file.split('-')))),
      completed: files.includes(completedFileName),
      exist: true
    }
  }
})

router.post('/merge', async (ctx, next) => {
  return new Promise(resolve => {
    const { body } = ctx.request
    const dirname = getDirName(body)
    const files = fs.readdirSync(path.join(fileDist, dirname))
    const saveName = `${body.fileName}.${body.extName}`

    const ws = fs.createWriteStream(path.join(fileDist, dirname, saveName))

    mergeFile()
  

    function mergeFile() {
      if (files.length) {
        const file = files.shift()
        const readPath = path.join(fileDist, dirname, file)
        const rs = fs.createReadStream(readPath)
        rs.pipe(ws, {end: files.length === 0})
        rs.on('end', () => {
          fs.unlinkSync(readPath)
          mergeFile()
        })
      } else {
        ctx.body = {
          status: 'success'
        }
        resolve()
      }
    }
  })
})

router.post('/uploadFile', async (ctx, next) => {
  const formData = ctx.request.files
  const file = formData.file
  const body = ctx.request.body
  const dirname = getDirName(body)
  await fse.move(file.filepath, path.join(fileDist, dirname, `${body.fileName}-${body.index}`))
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