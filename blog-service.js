const fs = require("fs"); // required at the top of your module
let posts = []
let categories = []
let published = []

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
            posts = []
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

module.exports = {intialize,getAllPosts,getPublishedPosts,getCategories}

// intialize().then(data => {
//     console.log(data)
// })
// .catch(err => {
//     console.log('Error:', error.message, ' error status code', err.status)
// })