/*********************************************************************************
* WEB322 – Assignment 3
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Tomonobu Christian Fukuhara Tengan Student ID: 123475212 Date: Jun 16, 2022
*
* Online (Heroku) URL: https://guarded-inlet-93508.herokuapp.com/
*
********************************************************************************/
var blog = require('./blog-service')
var express = require('express')
var app = express()
var path = require("path")
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')

cloudinary.config({
    cloud_name: 'dhvyi6zkx',
    api_key: '637167755885338',
    api_secret: 'tbbZuv_5mM3NDEW78YeafyZymlc',
    secure: true
});

const upload = multer()
const { getEnabledCategories } = require('trace_events');

var PORT = process.env.PORT || 8080
app.use(express.static('public'))

app.get('/',(req, res) => { 
    //console.log(req)
    res.redirect("/about")
})

app.get('/about',(req, res) => {
    //console.log(req)
    res.sendFile(path.join(__dirname,"/views/about.html"))
})

app.get('/blog',(req, res) => {
    //console.log(req)
    blog.getPublishedPosts().then((data) => {
        res.send(data)
    }).catch((err) => {
        res.send({message: err})
    })
})

app.get('/posts',(req, res) => {
    //console.log(req)
    var category = req.query.category;
    var minDateStr = req.query.minDate;

    if(category > 0 && category < 6){
        blog.getPostsByCategory(category).then((data) => {
            res.send(data)
        }).catch((err) => {
            res.send({message: err})
        })
    }
    else if(minDateStr != null){
        blog.getPostsByMinDate(minDateStr).then((data) => {
            res.send(data)
        }).catch((err) => {
            res.send({message: err})
        })
    }
    else {
        blog.getAllPosts().then((data) => {
            res.send(data)
        }).catch((err) => {
            res.send({message: err})
        })
    }
})


app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname,"/views/addPost.html"))
})

app.get('/categories',(req, res) => {
    blog.getCategories().then((data) => {
        res.send(data)
    }).catch((err) => {
        res.send({message: err})
    })
})

app.get('/error', (req, res) => {
    res.send('<h1>Page not found</h1><a href="/">Return Home Page</a>')    
}) 

app.post('/posts/add', upload.single('featureImage'), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(error);
                    }
                }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };
        
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    upload(req).then((uploaded)=> {
        req.body.featureImage = uploaded.url;
        blog.addPost(req.body).then(() => {
            res.redirect('/posts')
        }).catch(()=>{
            console.log('No results returned');
        })
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to/posts
    })
})

app.use('/posts/:id', (req, res, next) => {
    var id = req.params.id
    blog.getPostById(id).then((data) => {
        res.send(data)
    }).catch((err) => {
        res.send({message: err})
    })
})

app.use((req, res) => {
    res.status(404).redirect('/error')
})

blog.intialize().then(()=> {
    app.listen(PORT, () => {
        console.log(`Express http server listening on port ${PORT}`)
    })
}).catch(()=>{
    console.log('No results returned');
})



