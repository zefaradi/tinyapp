const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080; // default port 8080

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");

//E-mail look up helper function
const emailLookup = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Gloabl Users data
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

// program to generate random strings
// declare all characters
const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateString() {
    let result = ' ';
    let length = 6;
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result.trim();
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    users: users[req.cookies["user_id"]]
    };
 
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    users: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL:urlDatabase[req.params.shortURL], 
    users: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });

 app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
});

// REGISTER PAGE
app.get("/register", (req, res) => {

  const templateVars = { 
    users: users[req.cookies["user_id"]] };
  res.render("urls_registration", templateVars);
})

//LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = { 
    userID: req.cookies['user_id'],
    users: users[req.cookies["user_id"]] };

  res.render("urls_login", templateVars);
})

 // POST REQUEST -----------------------------------------------------
 //code to take to the shortURL page
 app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
 
  const shortURL = generateString();
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`)
});

//code to delete shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls/")

});

//code to edit the longURL assigned to a shortURL
app.post("/urls/:id", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);

});

// code for logging in
app.post("/login", (req, res) => {
  const email = req.body.email;
  const user = emailLookup(email);

  if (user) {
    res.cookie("user_id", user.id);
    res.redirect("/urls/");
  } else {
    res.status(400);
    res.send("No account has been registered with this account");
  }
  
})

//code for loggin out
app.post("/logout", (req, res) => {
  
  res.clearCookie("user_id");
  res.redirect("/urls/");
  
})

//POST code for registration
app.post("/register", (req, res) => {
  
  const email = req.body.email;
  const password = req.body.password;
  const id = generateString()

  if(emailLookup(email)) {
    res.status(400);
    res.send("An account with this email already exists");
  } else if (email === "" || password === "") {
    res.status(400);
    res.send("Either the email or password are empty");
  } else {
    users[id] = {"id":id, "email":email, "password": password };

    console.log(users);
  
    res.cookie("user_id", id);
    res.redirect("/urls/");
  }
  
})

// LISTEN TO THE PORT -----------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});