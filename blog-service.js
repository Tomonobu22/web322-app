const fs = require("fs"); // required at the top of your module
let posts = []
let categories = []
let published = []
let posts_cat = []
let posts_dt = []

function intialize() {   
    return new Promise((resolve, reject) => {
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) reject("unable to read file")
            else {
                //console.log(data)
                posts = JSON.parse(data)
            }
        })
        fs.readFile('./data/categories.json', 'utf8', (err, data) => {
            if (err) reject("unable to read file")
            else{
                //console.log(data)
                categories = JSON.parse(data)
            }
        })
        resolve("Reading process - SUCCESS!")
    })
}

function getAllPosts() {
    return new Promise((resolve, reject) => {
        if(posts.length > 0) resolve(posts)
        else reject('No results returned')
    })
}

function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        if(posts.length > 0) {
            published = []
            for(let i = 0; i < posts.length; i++){
                if(posts[i].published)
                published.push(posts[i])
            }
            resolve(published)
        }
        else reject('No results returned')
    })  
}

function getCategories() {
    return new Promise((resolve, reject) => {
        if(categories.length > 0) resolve(categories)
        else reject('No results returned')
    })  
}

function addPost(postData) {
    return new Promise((resolve, reject) => {
        if(postData.published != false && postData.published != true) {
            postData.published = false;
        } else postData.published = true;
        postData.id = posts.length + 1;
        posts[posts.length] = postData;
        resolve(postData)
    }) 
}

function getPostsByCategory(category){
    return new Promise((resolve, reject) => {
        if(posts.length > 0) {
            posts_cat = []
            for(let i = 0; i < posts.length; i++){
                if(posts[i].category == category)
                posts_cat.push(posts[i])
            }
        }
        if(posts_cat.length > 0) resolve(posts_cat)
        else reject('No results returned')
    })  
}

function getPostsByMinDate(minDateStr){
    return new Promise((resolve, reject) => {
        if(posts.length > 0) {
            posts_dt = []
            for(let i = 0; i < posts.length; i++){
                if(new Date(posts[i].postDate) >= new Date(minDateStr))
                posts_dt.push(posts[i])
            }
        }
        if(posts_dt.length > 0) resolve(posts_dt)
        else reject('No results returned')
    })  
}

function getPostById(id){
    return new Promise((resolve, reject) => {
        var flag = 0
        let post_id
        if(posts.length > 0) {
            flag = 0
            for(let i = 0; i < posts.length; i++){
                if(posts[i].id == id){
                    post_id = posts[i]
                    flag = 1
                }
            }
        }
        if(flag = 1) resolve(post_id)
        else reject('No results returned')
    })  
}

module.exports = {intialize,getAllPosts,getPublishedPosts,getCategories, addPost, getPostsByCategory, getPostsByMinDate, getPostById}

// intialize().then(data => {
//     console.log(data)
// })
// .catch(err => {
//     console.log('Error:', error.message, ' error status code', err.status)
// })