/*********************************************************************************
* WEB322 – Assignment 2
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Tomonobu Christian Fukuhara Tengan Student ID: 123475212 Date: Jun 03, 2022
*
* Online (Heroku) URL: https://guarded-inlet-93508.herokuapp.com/
*
********************************************************************************/
var blog = require('./blog-service')
var express = require('express')
var app = express()
var path = require("path");
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
    blog.getAllPosts().then((data) => {
        res.send(data)
    }).catch((err) => {
        res.send({message: err})
    })
})

app.get('/categories',(req, res) => {
    //console.log(req)
    blog.getCategories().then((data) => {
        res.send(data)
    }).catch((err) => {
        res.send({message: err})
    })
})

app.get('/error', (req, res) => {
    res.send('<h1>Page not found</h1><a href="/">Return Home Page</a>')    
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



