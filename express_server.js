const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({ extended: true })); // middleware to make POST requests readable
app.use(cookieParser());
app.set('view engine', 'ejs');// add the view engine to ejs

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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


const generateRandomString = function() {   // Generates a 6 character string of Letters and numbers
  let text = "";

  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
};

const findUser = (email) => {
  // if we find a user, return the user
  // if not, return null
  for (const key in users) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }

  return null;
};





app.get("/urls/new", (req, res) => {   // Handler for the new Urls
  const templateVars = { user: req.cookies["user_id"] };
  if (!req.cookies["user_id"]) {   // If the user is not logged in, he can't create a new url;
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  
  if (!req.cookies["user_id"]) {  //If the user is not logged in, he can't create a new url;
    return res.send("Please login first");
  }
  const shortID = generateRandomString();
  urlDatabase[shortID] = req.body.longURL;
  res.redirect("/urls/" + shortID);

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]; // Redirects to the website(originalUrl),when clicked on a short Url
  if (!longURL) {
    res.status(404).send('Not found');
    return;
  }
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => { // Handler(route) for short Urls
  if (!(req.params.shortURL in urlDatabase)) {
    return res.status(404).send('There is no such URL in our database'); // Returns error if there is no such short key
  }
   
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post('/urls/:shortURL/delete', (req, res) => {  // Addind a delete route for urls
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => { //  Editing the long Url in the inut field
  const shortUrl = req.params.shortURL;
  const longUrl = req.body.longURL;
  urlDatabase[shortUrl].longURL = longUrl;
  res.redirect('/urls');
});

app.post('/login', (req, res) => { // handler of the login request(saves user Id as cookie)
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('email and the cannot be blank');
  }

  const user = findUser(email);

  if (!user) {
    return res.status(400).send('no user with that email found');
  }

  if (user.password !== password) {
    return res.status(400).send('password does not match');
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.get("/login", (req, res) => {   // GET route for login page
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.post('/logout', (req, res) => { // handler of logout request(clears cookies)
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {   // GET route for registration page
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("registration", templateVars);
});

app.post('/register', (req, res) => {  //handler for POST route for registration page
  const email = req.body.email;
  const password = req.body.password;

  // check if passsword and email fields are not empty
  if (!email || !password) {
    return res.status(403).send('Please, fill in the email and password fields');
  }

  const user = findUser(email); //finding whether the user email already exists

  if (user) {
    return res.status(403).send('This email is already taken');
  }

  const id = generateRandomString();

  users[id] = {
    id,
    email,
    password
  };
  res.cookie('user_id', id);

  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});