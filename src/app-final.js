const express = require('express')
require('./db/mongoose')
const userRouter=require('./routers/user-final')
const postRouter=require('./routers/post')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(postRouter)

module.exports = app