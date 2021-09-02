const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');



app.use(bodyParser.urlencoded({ extended: true })); // middleware to make POST requests readable
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
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


const urlsForUser = (id) =>{
  let userUrls = {};
  
  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === id) {
      userUrls[key] = urlDatabase[key];
    }
  }
  return userUrls;
};

const isUserUrl = (key, id) =>{  // Checkd whether these urls belong to the user
  return urlDatabase[key].userID === id;
};



const generateRandomString = function() {   // Generates a 6 character string of Letters and numbers
  let text = "";

  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
};

const getUserByEmail = (email, database) => {
  // if we find a user, return the user
  // if not, return null
  for (const key in database) {
    const user = database[key];
    if (user.email === email) {
      return user;
    }
  }

  return null;
};



app.get("/urls/new", (req, res) => {   // Handler for the new Urls
  const templateVars = { user: req.session.user_id };
  if (!req.session.user_id) {   // If the user is not logged in, he can't create a new url;
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  
  if (!req.session.user_id) {  //If the user is not logged in, he can't create a new url;
    return res.send("Please login first");
  }

  const shortID = generateRandomString();
  urlDatabase[shortID] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect("/urls/" + shortID);

});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL; // Redirects to the website(originalUrl),when clicked on a short Url
  if (!longURL) {
    res.status(404).send('Not found');
    return;
  }
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {

  const templateVars = { urls: urlsForUser(req.session.user_id), user: users[req.session.user_id] };
  console.log(users);
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => { // Handler(route) for short Urls
  if (!(req.params.shortURL in urlDatabase)) {
    return res.status(404).send('There is no such URL in our database'); // Returns error if there is no such short key
  }

  if (!isUserUrl(req.params.shortURL, req.session.user_id)) {  // youser can't use someone elses short URLS
    return res.status(403).send('You cant access this URL');
  }
   
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post('/urls/:shortURL/delete', (req, res) => {  // Addind a delete route for urls
  if (!isUserUrl(req.params.shortURL,req.session.user_id)) {  // A user can't delete someome elses short urls
    return res.status(403).send('You cant delete these urls');
  }
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.post('/urls/:shortURL', (req, res) => { //  Editing the long Url in the inut field
  if (!isUserUrl(req.params.shortURL, req.session.user_id)) {
    return res.status(403).send('You cant delete these urls');
  }
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

  const user = getUserByEmail(email, users);

  if (!user) {
    return res.status(400).send('no user with that email found');
  }

  const result = bcrypt.compareSync(password, user.password); // Compares the given password and the hashed password
  if(!result){
    return res.status(403).send('Wrong password')
  }
  req.session.user_id = user.id;
  
  res.redirect('/urls');
});

app.get("/login", (req, res) => {   // GET route for login page
  const templateVars = { user: users[req.session.user_id], };
  res.render("login", templateVars);
});

app.post('/logout', (req, res) => { // handler of logout request (clears cookies)
  // res.clearCookie('user_id');

  req.session = null;
  res.redirect('/urls');
});

app.get("/register", (req, res) => {   // GET route for registration page
  const password = req.body.password;

  const templateVars = { user: users[req.session.user_id] };
  res.render("registration", templateVars);
});

app.post('/register', (req, res) => {  //handler for POST route for registration page
  const email = req.body.email;
  const password = req.body.password;

  

  // check if passsword and email fields are not empty
  if (!email || !password) {
    return res.status(403).send('Please, fill in the email and password fields');
  }

  const user = getUserByEmail(email, users); //finding whether the user email already exists

  if (user) {
    return res.status(403).send('This email is already taken');
  }

  const id = generateRandomString();

  const hashedPassword = bcrypt.hashSync(password, 10); // creates a hashed password, saves as a value of password in users[id] object

  users[id] = {
    id,
    email,
    password: hashedPassword
  };

  req.session.user_id = id;

  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});