//load all the things we need
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser")
var cookieSession = require('cookie-session')
var bcrypt = require('bcrypt');
var _ = require('lodash');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
//app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080
var salt = bcrypt.genSaltSync(10);

var urlDatabase = [{shortURL:"b2xVn2", longURL: "http://www.lighthouselabs.ca", user:" " },
                    {shortURL:"9sm5xK", longURL: "http://www.google.com", user:" " }];

var userDatabase = [];

function generateRandomString()
{
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for(let i=0; i <= 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

//set the view engine to ejs
app.set('view engine', 'ejs');

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//Coding starts
//home page redirects to /urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/login", (req, res) => {
  userDatabase.forEach(function(user, i){
    if (user.email === req.body.email && bcrypt.compareSync(req.body.password, user.password)) {
      var email = req.body.email
      req.session.email = email;
      res.redirect("/");
    } else {
      res.redirect("/register");
    }
  })
})

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.redirect("/");
  } else {
    var userID = generateRandomString()
    var email = req.body.email
    var password = req.body.password
    var hashed_password = bcrypt.hashSync(password, salt);
    var newUser = {userID: userID, email: email, password: bcrypt.hashSync(req.body.password, salt)};
    userDatabase.push(newUser);
    req.session.username = userID;
    req.session.email = email;
    res.redirect("/");
  }
})

//render urls_new doc when url is reached
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, email: req.session.email};
  res.render("urls_new", templateVars);
});

//Create new URL, generate random string for shortURL
app.post("/urls/create", (req, res) => {
  urlDatabase.push({shortURL:generateRandomString(), longURL: req.body.longURL, user:req.session.email});
  let templateVars = { urls: urlDatabase, email: req.session.email};
  res.redirect("/urls");
});

//loads URL list
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, email: req.session.email};
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, email: req.session.email};
  res.render("urls_index", templateVars);
});

//Loads login page
app.get("/login", (req, res) => {
res.render("urls_login")
})

//Logout button function
app.post("/urls/logout", (req, res) => {
  var userID = userDatabase.userID
  var email = userDatabase.email
  req.session.username = null
  req.session.email = null
  res.redirect("/urls");
})

//find short URL in database, redirect to corresponding longURL
app.get("/u/:shortURL", (req, res) => {
  let input = req.params.shortURL;
  for(let i in urlDatabase) {
    if (input === urlDatabase[i].shortURL) {
      res.redirect("http://"+urlDatabase[i].longURL)
    }
  }
});

app.post('/urls/:shortURL/edit', (req, res) => {
  let shortURL = req.params.shortURL;
  let templateVars = { urls: urlDatabase, email: req.session.email, shortURL: shortURL};
  res.render("urls_edit", templateVars );
})

//update database to reflect edited URL
app.post("/urls/:shortURL", (req, res) => {
  let editedURL = req.body.editedURL;
  for(let i in urlDatabase) {
    if (req.params.shortURL === urlDatabase[i].shortURL) {
    urlDatabase[i].longURL = editedURL
    res.redirect("/urls");
    }
  }
})

//delete URL from database
app.post("/urls/:shortURL/delete", (req, res) => {
  let deleteURL = req.params.shortURL;
  delete urlDatabase[deleteURL];
  res.redirect("/urls");
})
