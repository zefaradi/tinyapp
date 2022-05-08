const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8800; // default port 8800

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

app.set("view engine", "ejs");


// URL data
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Gloabl Users data
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "d@d.com", 
    password: "crazy"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

//HELPER FUNCTIONS
//E-mail look up helper function
const emailLookup = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

// program to generate random strings
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

//HOMEPAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});

//GET REQUEST FOR A LIST OF URLS
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    users: users[req.cookies["user_id"]]
    };
 
  res.render("urls_index", templateVars);
})

//GET REQUEST TO CREATE A NEW URL
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    users: users[req.cookies["user_id"]] };

  res.render("urls_new", templateVars);
});

//GET REQUEST TO GO TO THE SHORT URL
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL:urlDatabase[req.params.shortURL], 
    users: users[req.cookies["user_id"]] };
  res.render("urls_show", templateVars);
});

//GET REQUEST TO GO TO THE LONG URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  res.redirect(urlDatabase[shortURL]);
});

// REGISTER PAGE
app.get("/register", (req, res) => {

  const templateVars = { 
    users: users[req.cookies["user_id"]] };

  if (req.cookies['user_id']) {
    res.redirect("/urls")
  }
    
  res.render("urls_registration", templateVars);
  
})

// POST code to register
app.post("/register", (req, res) => {
  
  const { email, password } = req.body;
  const user = emailLookup(email, users);
  const id = generateString()

  if(user) {
    res.status(403);
    res.send("An account with this email already exists");
  } else if (email === "" || password === "") {
    res.status(403);
    res.send("Either the email or password are empty");
  } else {
    users[id] = {"id":id, "email":email, "password": password };

    console.log(users);
  
    res.cookie("user_id", id);
    res.redirect("/urls/");
  }
  
})

//LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = { 
    userID: req.cookies['user_id'],
    users: users[req.cookies["user_id"]] };

  if (req.cookies['user_id']) {
    res.redirect("/urls")
  }
    res.render("urls_login", templateVars);
})

//POST code for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = emailLookup(email, users);

  if (user && user.password === password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else if (!user) {
    res.status(403);
    res.send("There is no account with this email.")
  } else {
    res.status(403);
    res.send("Invalid login credentials.");
  }

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

//code for loggin out
app.post("/logout", (req, res) => {
  
  res.clearCookie("user_id");
  res.redirect("/urls/");
  
})

// LISTEN TO THE PORT -----------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});