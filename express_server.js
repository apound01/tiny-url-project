//load all the things we need
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser")

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser())
//app.set("view engine", "ejs");
var PORT = process.env.PORT || 8080; // default port 8080

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

//render urls_new doc when url is reached
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = req.body.longURL
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

app.post("/urls/login", (req, res) => {
  var username = req.body.username
  res.cookie("username", username);
  res.redirect("/urls")
})

app.post("/urls/logout", (req, res) => {
  var username = req.body.username
  res.clearCookie("username", username);
  res.redirect("/urls");
})

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get('/urls/:shortURL/edit', (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_edit", templateVars );
});

app.post("/urls/:shortURL", (req, res) => {
  let editedURL = req.body.editedURL;
  urlDatabase[req.params.shortURL] = editedURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  let deleteURL = req.params.shortURL;
  delete urlDatabase[deleteURL];
  res.redirect("/urls");
})


// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/urls/:id", (req, res) => {
//   let templateVars = { shortURL: req.params.id };
//   res.render("urls_index", templateVars);
// });
