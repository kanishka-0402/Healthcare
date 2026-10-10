const mongoose = require('mongoose')
const connect = mongoose.connect("mongodb://localhost:27017/Registration")
.then(()=>{
    console.log("connected")
})
.catch((error)=>{
    console.log(error)
})
module.exports = connect

