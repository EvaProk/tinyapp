const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); // middleware to make POST requests readable



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
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/:shortURL", (req, res) => {     // Handler(route) for short Urls 
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});