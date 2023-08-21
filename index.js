const express = require('express')
const app = express()
const cors = require('cors')
// const mongoose  = require('mongoose')
const User = require('./models/User')
const Post = require('./models/Post')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const multer  = require('multer')
const uploadMiddleware = multer({ dest: 'uploads/' })
const fs = require('fs')
const connectDB = require('./connectMongo')
require('dotenv').config()

connectDB()
const salt = bcrypt.genSaltSync(10)
const secret = 'ajhsaldnsajkldalkjdhsjsadsad'
const port = process.env.port || 4000



// app.use(cors({credentials:true,origin: '*'}))
app.use(express.json())
app.use(cookieParser())
app.use('/uploads', express.static(__dirname + '/uploads'))

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  app.use(cors({credentials:true,origin: '*'}));
  next();
});




app.get("/", (req,res) => {
    return res.json("Hello world")
})

app.post('/register', async (req, res)=> {
    const { userName, password } = req.body
  //   res.header('Access-Control-Allow-Credentials', true)
  // res.header('Access-Control-Allow-Origin', 'https://blogpessoal-devgui.vercel.app')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  // res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  // res.header(
  //   'Access-Control-Allow-Headers',
  //   'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  // )
    try{
        const userDoc = await User.create({
            userName ,
             password:bcrypt.hashSync(password,salt) 
            })
           
        res.json(userDoc)
    }catch(e){
        console.log(e);
        res.status(400).json(e)
    }
 
    
})

app.post('/login', async (req, res) =>{
    const {userName, password} = req.body
    const userDoc = await User.findOne({userName})
   const passOk = bcrypt.compareSync(password, userDoc.password)
   res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', 'https://blogpessoal-devgui.vercel.app')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  // res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  // res.header(
  //   'Access-Control-Allow-Headers',
  //   'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  // )
   
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
  res.header('Access-Control-Allow-Credentials', true)
   res.header('Access-Control-Allow-Origin', 'https://blogpessoal-devgui.vercel.app')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  // res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  // res.header(
  //   'Access-Control-Allow-Headers',
  //   'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  // )
    jwt.verify(token, secret, {}, (err, info)=>{
        if(err) throw err
        res.json(info)
    })
})

app.post('/logout', (req,res) =>{

    res.cookie('token', '').json('ok')
    res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', 'https://blogpessoal-devgui.vercel.app')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  // res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  // res.header(
  //   'Access-Control-Allow-Headers',
  //   'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  // )
})

app.post('/post', uploadMiddleware.single('file'), async (req,res)=>{
    res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', 'https://blogpessoal-devgui.vercel.app')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  // res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  // res.header(
  //   'Access-Control-Allow-Headers',
  //   'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  // )
    const {originalname, path} = req.file
    const parts = originalname.split('.')
    const ext = parts[parts.length - 1]
    const newPath = path+'.'+ext
    fs.renameSync(path, newPath)

    const {token} = req.cookies
    jwt.verify(token, secret, {}, async (err, info)=>{
        if(err) throw err
        const {title, summary, content} = req.body
        const postDoc = await Post.create({
            title,
            summary,
            content,
            cover:newPath,
            author:info.id,
    
        })
        
        res.json(postDoc)
        
    })

    

    
})

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
    res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', 'https://blogpessoal-devgui.vercel.app')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  // res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  // res.header(
  //   'Access-Control-Allow-Headers',
  //   'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  // )
    let newPath = null; 
    if (req.file) {
      const {originalname,path} = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path+'.'+ext;
      fs.renameSync(path, newPath);
    }
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {id,title,summary,content} = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json('you are not the author');
      }
     await postDoc.update({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });
  
      
      res.json(postDoc);
    });
  
  });

app.get('/post', async (req, res) => {
    res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', 'https://blogpessoal-devgui.vercel.app')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  // res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  // res.header(
  //   'Access-Control-Allow-Headers',
  //   'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  // )
    res.json(
        await Post.find()
        .populate('author', ['userName'])
        .sort({createdAt: -1})
        .limit(20)
        )
})

app.get('/post/:id', async (req, res) =>{
    res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', 'https://blogpessoal-devgui.vercel.app')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  // res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  // res.header(
  //   'Access-Control-Allow-Headers',
  //   'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  // )
    const {id} = req.params
   const postDoc = await Post.findById(id).populate('author', ['userName'])
   res.json(postDoc)
   
})

app.listen(port)
