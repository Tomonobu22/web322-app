const Sequelize = require('sequelize')

// Set up sequelize to point to our postgres database
var sequelize = new Sequelize('d2efls1nahkoeu','hecndqvvshiwgy','8eb841fcc85d8cb6acff367ac9396a1b4eadebff2a586babb776a9602ad6e161',{
    host: 'ec2-34-200-35-222.compute-1.amazonaws.com',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
})

var Post = sequelize.define('Post', {
    body: Sequelize.TEXT,
    title: Sequelize.STRING,
    postDate: Sequelize.DATE,
    featureImage: Sequelize.STRING,
    published: Sequelize.BOOLEAN
})

var Category = sequelize.define('Category', {
    category: Sequelize.STRING
})

Post.belongsTo(Category, {foreignKey: 'category'})

function intialize() {   
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function() {resolve()})
        .catch(function() {reject("Unable to sync the database")})
    })
}

function getAllPosts() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function() {
            Post.findAll().then(function(data) {
                resolve(data)
            })
            .catch(function() {reject("No results returned")})
        }).catch(function() {reject("Unable to sync the database")})
    })
}

function getPublishedPosts() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function() {
            Post.findAll({
                where: {
                    published: true
                } 
            }).then(function(data) {resolve(data)})
            .catch(function() {reject("No results returned")})
        }).catch(function() {reject("Unable to sync the database")})
    })
}

function getPublishedPostsByCategory(category){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function() {
            Post.findAll({
                where: {
                    category: category
                } 
            }).then(function(data) {resolve(data)})
            .catch(function() {reject("No results returned")})
        }).catch(function() {reject("Unable to sync the database")})
    })
}

function getCategories() {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            Category.findAll().then(function(data) {
                resolve(data)
            }).catch(function() {
                reject("No results returned")
            })
        }).catch(function() {
            reject("Unable to sync the database")
        })
    })
}

function addPost(postData) {
    return new Promise((resolve, reject) => {
        for (const property in postData) {
            if(postData[property] == "")
            postData[property] = null
        }
        postData.published = (postData.published) ? true : false;
        postData.postDate = new Date();
        console.log(postData);
        sequelize.sync().then(function() {
            Post.create(postData)
                .then(function() { resolve("Success")})
                .catch(function() { reject("Unable to create post") })
        }).catch(function() {reject("Unable to sync the database")})
    })
}

function getPostsByCategory(category){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function() {
            Post.findAll({
                where: {
                    category: category
                } 
            })
            .then(function(data) {resolve(data)})
            .catch(function() {reject("No results returned")})
        }).catch(function() {reject("Unable to sync the database")})
    })
}

function getPostsByMinDate(minDateStr){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function() {
            const { gte } = Sequelize.Op;
            Post.findAll({
                where: {
                    postDate: {
                        [gte]: new Date(minDateStr)
                    }
                }
            }).then(function(data) {resolve(data)}
            .catch(function() {reject("No results returned")}))
        }).catch(function() {reject("Unable to sync the database")})
    })
}

function getPostById(id){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function() {
            const { gte } = Sequelize.Op;
            Post.findAll({
                where: {
                    id: id
                }
            }).then(function(data) {resolve(data)})
            .catch(function() {reject("No results returned")})
        }).catch(function() {reject("Unable to sync the database")})
    })
}

function addCategory(categoryData){
    return new Promise((resolve, reject) => {
        for (const property in categoryData) {
            if(categoryData[property] == "")
                categoryData[property] = "null"
        }
        sequelize.sync().then(function () {
            Category.create(categoryData)
                .then(function() { resolve("Success")})
                .catch(function() { reject("Unable to create category") })
        }).catch(function() {reject("Unable to sync the database")})
    })
}

function deleteCategoryById(id){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            Category.destroy({
                where: {
                    id: id
                }
            })
            .then(function() { resolve("Success")})
            .catch(function() { reject("Unable to create category") })
        }).catch(function() {reject("Unable to sync the database")})
    })
}

function deletePostById(id){
    return new Promise((resolve, reject) => {
        sequelize.sync().then(function () {
            Post.destroy({
                where: {
                    id: id
                }
            })
            .then(function() { resolve("Success")})
            .catch(function() { reject("Unable to create category") })
        }).catch(function() {reject("Unable to sync the database")})
    }) 
}

module.exports = {intialize,getAllPosts,getPublishedPosts,getCategories, addPost, getPostsByCategory, getPostsByMinDate, getPostById, getPublishedPostsByCategory, addCategory, deleteCategoryById, deletePostById}
