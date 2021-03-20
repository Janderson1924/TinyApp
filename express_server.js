const { getUserByEmail, generateRandomString, urlsForUser } = require("./helpers.js");
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const app = express();
const PORT = 8080;
const bcrypt = require('bcryptjs');
app.set("view engine", "ejs");


app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));


app.use(bodyParser.urlencoded({extended: true}));


const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};


app.get("/", (req, res) => {
  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  let loggedUser = req.session.user_id;
  let newUser = urlsForUser(loggedUser, urlDatabase);
  const templateVars = { urls: newUser, user_id: users[loggedUser] };
  res.render("urls_index", templateVars);
});


app.get("/register", (req, res) => {
  const templateVars = { urls: urlDatabase, users, user_id: req.session.user_id };
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  const id = generateRandomString(5);
  const email = req.body.email;
  const password = req.body.password;
  if (email === '' || password === '') {
    return res.status(400).send("Error Code 400: Please enter valid Email/Password");
  }
  for (let keys in users) {
    if (users[keys].email === req.body.email) {
      return res.status(400).send("Error Code 400: Email is already in use!");
    }
  };
  users[id] = {
    id: id,
    email: email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.user_id = id;
  res.redirect("/urls");
});


app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, users, user_id: req.session.user_id };
  const userID = req.session.user_id;
  if (userID) {
    res.redirect("/urls");
  } else {
    res.render("urls_login", templateVars);
  }
});


app.post("/login", (req, res) => {
  let userID = getUserByEmail(req.body.email, users);
  if (!userID) {
    return res.status(403).send(`${req.body.email} is not a registered user!`);
  } else if (bcrypt.compareSync(req.body.password, users[userID].password)) {
    req.session.user_id = userID;
    res.redirect("/urls");
    return;
  } else {
    return res.status(403).send("Incorrect Email/Password");
  }
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const newURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: newURL, userID: req.session.user_id };
  res.redirect(`/urls/${shortURL}`);
});


app.get("/urls/new", (req, res) => {
  let key = req.session.user_id;
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  const templateVars = { urls: urlDatabase, user_id: users[key] };
  res.render("urls_new", templateVars);
});


app.post("/urls/:id", (req, res) => {
  const nURL = req.body.longURL;
  const id = req.session.user_id;
  if (id === urlDatabase[req.params.id]["userID"]) {
    urlDatabase[req.params.id] = { longURL: nURL, userID: id };
    res.redirect("/urls");
  } else {
    res.status(403).send("Error 403: Forbidden");
  }
});


app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  if (userID && userID === urlDatabase[req.params.shortURL].userID) {
    let shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send("Only users can delete URLs!");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  let key = urlDatabase[req.params.shortURL]["userID"];
  let user = req.session.user_id;
  if (user !== key) {
    res.status(403).send("You must be logged in!");
  } else {
    const templateVars = { urls: urlDatabase, users, user_id: users[key], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL };
    res.render("urls_show", templateVars);
  }
});


app.get("/u/:shortURL", (req, res) => {
  const shortUrl = urlDatabase[req.params.shortURL]
  if (!shortUrl) {
    res.status(404).send('URL not found!')
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});