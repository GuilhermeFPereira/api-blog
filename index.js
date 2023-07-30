const express = require('express')
const app = express()
const cors = require('cors')
const mongoose  = require('mongoose')
const User = require('./models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const secret = 'ajhsaldnsajkldalkjdhsjsadsad'
const salt = bcrypt.genSaltSync(10)

app.use(cors({credentials:true,origin:'http://localhost:3000'}))
app.use(express.json())
app.use(cookieParser())

mongoose.connect('mongodb+srv://personBLog:guill6250730@clustergui.lwjwohm.mongodb.net/?retryWrites=true&w=majority')

app.post('/register', async (req, res)=> {
    const { userName, password } = req.body
    try{
        const userDoc = await User.create({
            userName ,
             password:bcrypt.hashSync(password,salt) 
            })
        res.json(userDoc)
    }catch(e){
        res.status(400).json(e)
    }
 
    
})

app.post('/login', async (req, res) =>{
    const {userName, password} = req.body
    const userDoc = await User.findOne({userName})
   const passOk = bcrypt.compareSync(password, userDoc.password)
   
    if(passOk){
        // logado
        jwt.sign({userName,id:userDoc._id}, secret, {}, (err,token)=>{
            if(err) throw err
            res.cookie('token', token).json({
                id:userDoc._id,
                userName,
            })
        })
    //res.json()    

    }else{
        res.status(400).json('Usuario ou Senha Incorreta')
    }

})

app.get('/profile', (req,res) =>{
    const {token} = req.cookies
    jwt.verify(token, secret, {}, (err, info)=>{
        if(err) throw err
        res.json(info)
    })
})

app.post('/logout', (req,res) =>{
    res.cookie('token', '').json('ok')
})

app.listen(4000)

// mongodb+srv://personBLog:guill6250730@clustergui.lwjwohm.mongodb.net/?retryWrites=true&w=majority

// personBlog
// senha : guill6250730