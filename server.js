/*********************************************************************************
* WEB322 – Assignment 6
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Tomonobu Christian Fukuhara Tengan Student ID: 123475212 Date: August 04, 2022
*
* Online (Heroku) URL: https://guarded-inlet-93508.herokuapp.com/
*
********************************************************************************/
var blog = require('./blog-service')
const authData = require('./auth-service')
var express = require('express')
const exphbs = require('express-handlebars')
const stripJs = require('strip-js')
var app = express()
var path = require("path")
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const clientSessions = require("client-sessions")

// Setup client-sessions
app.use(clientSessions({
    cookieName: "session", // this is the object name that will be added to 'req'
    secret: "week10example_web322", // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60 // the session will be extended by this many ms each request (1 minute)
  }));

app.use(express.urlencoded({extended: true})); // to add categories

// define the template engine of our express application
app.engine('.hbs', exphbs.engine({
    extname: '.hbs' ,
    //helper functions
    helpers: {
        navLink: function(url, options){
            return '<li' + 
            ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
            '><a href="' + url + '">' + options.fn(this) + '</a></li>'
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this)
            }
        },
        safeHTML: function(context){
            return stripJs(context)
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
        }            
    }
}))
app.set('view engine', '.hbs')

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

// helper middleware function that checks if a user is logged in
function ensureLogin(req, res, next) {
    if (!req.session.user) {
      res.redirect("/login");
    } else {
      next();
    }
  }

// access to a session object
app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});


app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    app.locals.viewingCategory = req.query.category;
    next();
});   

app.get('/',(req, res) => { 
    //console.log(req)
    res.redirect("/blog")
})

app.get('/about',(req, res) => {
    res.render('about', {
        //options
    })
})

app.get('/blog', async (req, res) => {
    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }
        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;
    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
})

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};

    try{

        // declare empty array to hold "post" objects
        let posts = [];

        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blog.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blog.getPublishedPosts();
        }

        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;

    }catch(err){
        viewData.message = "no results";
    }

    try{
        // Obtain the post by "id"
        let arrayPost = await blog.getPostById(req.params.id)
        viewData.post = arrayPost[0]
    }catch(err){
        viewData.message = "no results"; 
    }

    try{
        // Obtain the full list of "categories"
        let categories = await blog.getCategories();

        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }

    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});


app.get('/posts', ensureLogin,(req, res) => {
    //console.log(req)
    var category = req.query.category;
    var minDateStr = req.query.minDate;

    if(category >= 0){
        blog.getPostsByCategory(category).then((data) => {
            res.render("posts",{
                posts: data
            })
        }).catch((err) => {
            res.render("posts",{
                message: "no results"
            })
        })
    }
    else if(minDateStr != null){
        blog.getPostsByMinDate(minDateStr).then((data) => {
            res.render("posts",{
                posts: data
            })
        }).catch((err) => {
            res.render("posts",{
                message: "no results"
            })
        })
    }
    else {
        blog.getAllPosts().then((data) => {
            if(data.length > 0){
                res.render("posts",{
                    posts: data
                })
            }
            else {
                res.render("posts",{
                    message: "no results"
                })
            }
        }).catch((err) => {
            res.render("posts",{
                message: "no results"
            })
        })
    }
})


app.get('/posts/add', ensureLogin, (req, res) => {
    blog.getCategories().then((data) => {
        res.render('addPost',{
            categories: data
        })
    }).catch(()=>{
        res.render("addPost", {
            categories: []
        })
    })
})

app.get('/categories/add', ensureLogin, (req, res) => {
    res.render('addCategory',{
        //options
    })
})

app.get('/categories/delete/:id', ensureLogin, (req, res) => {
    var id = req.params.id
    blog.deleteCategoryById(id).then(() => {
        res.redirect('/categories')
    }).catch((err) => {
        res.status(500).redirect("Unable to RemoveCategory / Category not found)")
    })
})

app.get('/posts/delete/:id', ensureLogin, (req, res) => {
    var id = req.params.id
    blog.deletePostById(id).then(() => {
        res.redirect('/posts')
    }).catch((err) => {
        res.status(500).redirect("Unable to RemovePost / Post not found)")
    })
})

app.get('/categories', ensureLogin, (req, res) => {
    blog.getCategories().then((data) => {
        if (data.length > 0){
            res.render("categories",{
                categories: data
            })
        }
        else {
            res.render("categories",{
                message: "no results"
            })
        }
    }).catch((err) => {
        res.render("categories",{
            message: "no results"
        })
    })
})

app.get('/error', (req, res) => {
    res.render("404",{
        //options
    }) 
}) 

app.post('/categories/add', ensureLogin, (req, res) => {
    blog.addCategory(req.body).then(() => {
        res.redirect('/categories')
    }).catch(()=>{
        console.log('No results returned');
    })
})

app.post('/posts/add', ensureLogin, upload.single('featureImage'), (req, res) => {
    if(req.file){
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
        //console.log(result);
        return result;
    }
    upload(req).then((uploaded)=> {
        req.body.featureImage = uploaded.url;
        blog.addPost(req.body).then(() => {
            res.redirect('/posts')
        }).catch(()=>{
            console.log('No results returned');
            res.redirect('/posts')
        })
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to/posts
    })
    }
    else {
        blog.addPost(req.body).then(() => {
            res.redirect('/posts')
        }).catch(()=>{
            console.log('No results returned');
            res.redirect('/posts')
        })
    }
})

app.use('/posts/:id', ensureLogin, (req, res, next) => {
    var id = req.params.id
    blog.getPostById(id).then((data) => {
        res.send(data)
    }).catch((err) => {
        res.send({message: err})
    })
})

app.get("/login", function(req, res) {
    res.render("login");
})

app.get("/register", function(req, res) {
    res.render("register");
})

app.post("/register", (req, res) => {
    authData.registerUser(req.body)
    .then(() => {res.render("register", { 
            successMessage: "User created",
        })
    }).catch((err) => {res.render("register", { 
            errorMessage: err, 
            userName: req.body.userName,
        })
    })
}) 

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent')
    authData.checkUser(req.body)
    .then((user) => {
        req.session.user = {
            userName: user.userName, // authenticated user's userName
            email: user.email,// authenticated user's email
            loginHistory: user.loginHistory // authenticated user's loginHistory
        }
        res.redirect('/posts')
    }).catch((err) => {res.render("login", { 
            errorMessage: err, 
            userName: req.body.userName,
        })
    })
});

app.get("/logout", function(req, res) {
    req.session.reset();
    res.redirect("/");
});

app.get("/userHistory", ensureLogin, function(req, res) {
    res.render("userHistory");
});

app.use((req, res) => {
    res.status(404).redirect('/error')
})


blog.intialize().then(authData.initialize)
.then(()=> {
    app.listen(PORT, () => {
        console.log(`App listening on port ${PORT}`)
    })
}).catch((err)=>{
    console.log("unable to start server: " + err)
})



