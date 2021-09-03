const { getUserByEmail, generateRandomString } = require("./helpers.js");

const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');

app.use(bodyParser.urlencoded({ extended: true })); // middleware to make POST requests readable

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

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

//Checks which URLs belong to a psrticular user using user ID
const urlsForUser = (id) =>{
  let userUrls = {};
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

// Check whether these urls belong to the user
const isUserUrl = (key, id) =>{
  return urlDatabase[key].userID === id;
};


// GET Handler for the new Urls
app.get("/urls/new", (req, res) => {
  // If the user is not logged in, he can't create a new url;
  if (!req.session.user_id) {
    res.redirect("/login");
  }

  const templateVars = { user: users[req.session.user_id] };
  res.render("urls_new", templateVars);
});

// Redirects to the website(originalUrl),when clicked on a short Url
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL) {
    res.status(404).send('<html><body style ="text-align: center; margin-top:50px"><h1>Not found</h1></body></html>\n');
    return;
  }
  res.redirect(longURL);
});

// GET route for /urls page
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const templateVars = { urls: urlsForUser(userID), user: users[userID]};
  res.render("urls_index", templateVars);
});


// GET Handler(route) for short Urls
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (!(shortURL in urlDatabase)) {
    return res.status(404).send('<html><body style ="text-align: center; margin-top:50px"><h1>There is no such URL in our database</h1></body></html>\n'); // Returns error if there is no such short key
  }
  // youser can't use someone elses short URLS
  const userID  = req.session.user_id;
  if (!isUserUrl(shortURL, userID)) {
    return res.status(403).send('<html><body style ="text-align: center; margin-top:50px"><h1>You can\'t access this URL</h1></body></html>\n');
  }
  const templateVars = { shortURL: shortURL, longURL: urlDatabase[shortURL].longURL, user: users[userID] };
  res.render("urls_show", templateVars);
});

// GET handler for the main page
app.get("/", (req, res) => {
  //If the user is not logged in, he rgets redirected to login page;
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

// GET route for login page
app.get("/login", (req, res) => {
  const templateVars = { user: users[req.session.user_id], };
  res.render("login", templateVars);
});

// GET route for registration page
app.get("/register", (req, res) => {
  const templateVars = { user: users[req.session.user_id] };
  res.render("registration", templateVars);
});




//POST handler for "/urls" page
app.post("/urls", (req, res) => {
  //If the user is not logged in, he can't create a new url;
  const userID = req.session.user_id;
  if (!userID) {
    return res.send('<html><body style ="text-align: center; margin-top:50px"><h1>Please login first</h1></body></html>\n');
  }
  const shortID = generateRandomString();
  urlDatabase[shortID] = { longURL: req.body.longURL, userID: userID };
  res.redirect("/urls/" + shortID);
});

// POST handler - Adds  a delete route for urls
app.post('/urls/:shortURL/delete', (req, res) => {
  // A user can't delete someome elses short urls
  if (!isUserUrl(req.params.shortURL,req.session.user_id)) {
    return res.status(403).send('<html><body style ="text-align: center; margin-top:50px"><h1>You can\'t delete these urls</h1></body></html>\n');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

//  POST handler Editing the long Url in the inut field
app.post('/urls/:shortURL', (req, res) => {
  if (!isUserUrl(req.params.shortURL, req.session.user_id)) {
    return res.status(403).send('<html><body style ="text-align: center; margin-top:50px"><h1>These Urls belong to someone else</h1></body></html>\n');
  }
  const shortUrl = req.params.shortURL;
  const longUrl = req.body.longURL;
  urlDatabase[shortUrl].longURL = longUrl;
  res.redirect('/urls');
});

// POST handler of the login request(saves user Id as cookie)
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
 
  if (!email || !password) {
    return res.status(400).send('<html><body style ="text-align: center; margin-top:50px"><h1>Email and Password fields cannot be blank</h1></body></html>\n');
  }

  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(400).send('<html><body style ="text-align: center; margin-top:50px"><h1>No user with that email found</h1></body></html>\n');
  }
  // Compares the given password and the hashed password
  const result = bcrypt.compareSync(password, user.password);
  if (!result) {
    return res.status(403).send('<html><body style ="text-align: center; margin-top:50px"><h1>Wrong password</html>\n');
  }
  /* eslint-disable camelcase */
  req.session.user_id = user.id;
  
  res.redirect('/urls');
});

// POST handler of logout request (clears cookies)
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});




//handler for POST route for registration page
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  // check if passsword and email fields are not empty
  if (!email || !password) {
    return res.status(403).send('<html><body style ="text-align: center; margin-top:50px"><h1>Please fill in the email and password</h1></body></html>\n');
  }

  //finding whether the user email already exists
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(403).send('<html><body style ="text-align: center; margin-top:50px"><h1>This email is already taken</h1></body></html>\n');
  }

  const id = generateRandomString();

  // creates a hashed password, saves as a value of password in users[id] object
  const hashedPassword = bcrypt.hashSync(password, 10);
  users[id] = {
    id,
    email,
    password: hashedPassword
  };

  /* eslint-disable camelcase */
  req.session.user_id = id;

  res.redirect('/urls');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});