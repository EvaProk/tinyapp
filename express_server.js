const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.use(bodyParser.urlencoded({ extended: true })); // middleware to make POST requests readable
app.use(cookieParser());
app.set('view engine', 'ejs');// add the view engine to ejs

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {   // Generates a 6 character string of Letters and numbers 
  var text = "";

  var charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
}





app.get("/urls/new", (req, res) => {   // Handler for the new Urls 
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {     // Handler(route) for short Urls 
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] };
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
})

app.post('/urls/:shortURL', (req, res) => { //  Editing the long Url in the inut field
  const shortUrl = req.params.shortURL;
  const longUrl = req.body.longURL;
  urlDatabase[shortUrl] = longUrl;
  res.redirect('/urls');
})

app.post('/login', (req, res) => { // handler of the login request(saves username as cookie)
  const user = req.body.username;
  res.cookie('username', user);
  res.redirect('/urls');
})

app.post('/logout', (req, res) => { // handler of logout request(clears cookie)
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/register", (req, res) => {   // GET route for registration page
  const templateVars = { username: req.cookies["username"] };
  res.render("registration", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});