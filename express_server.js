const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
};
const emailAlreadyExists = function(key, variable) {
  for (let user in users) {
    if (users[user][key] === variable) {
      return true;
    }
  }
  return false;
};
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}


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
}


app.get("/", (req, res) => {
  res.send('Hello There!');
});


app.get('/login', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users
  }
  res.render('urls_login', templateVars)
})


app.get('/urls', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user_id: req.cookies['user_id'],
    users
  };
  res.render('urls_index', templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users
  }
  res.render('urls_new', templateVars);
});


app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user_id: req.cookies['user_id'],
    users
  };
  res.render('urls_show', templateVars);
});


app.get('/register', (req, res) => {
  const templateVars = {
    user_id: req.cookies['user_id'],
    users
  }
  res.render('urls_register', templateVars)
})


app.post('/register', (req, res) => {
  if (emailAlreadyExists('email', req.body.email)) {
    res.status(400);
    res.send(`Error Code: ${res.statusCode}. This Email is already being used!`);
    return;
  }
  if (req.body.email.length === '' || req.body.password.length === '') {
    res.status(400);
    res.send(`Error Code: ${res.statusCode} Please enter a valid Email/Password...`);
    return;
  }
  const newID = generateRandomString();
  users[newID] = {
    id: newID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', users[newID].id);
  console.log(users);
  res.redirect('/urls');
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});


app.post('/urls/:shortURL', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.updateURL;
  res.redirect(`/urls/${req.params.shortURL}`);
})


app.get('/u/:shortURL', (req, res) => {
  const longURl = urlDatabase[req.params.shortURL];
  res.redirect(longURl);
});


app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});


app.post('/login', (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  for (let user in users) {
    if (users[user].email === userEmail && users[user].password === userPassword) {
      res.cookie('user_id', users[user].id);
      res.redirect('/urls');
    }
  }
  res.status(403)
  res.send(`Status Code: ${res.statusCode} Incorrect Email or Password`);
  return;
});


app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
})


app.listen(PORT, () => {
  console.log(`App is listening on: Port ${PORT}!`);
});