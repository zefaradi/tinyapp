const express = require("express");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');

const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
} = require('./helpers');

const app = express();
const PORT = 8800; // default port 8800

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'tinyApp',
  keys: ['key']
  })
);

app.set("view engine", "ejs");

// URL database
const urlDatabase = {
  b6UTxQ: {
        longURL: "https://www.tsn.ca",
        userID: "userRandomID"
    },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "user2RandomID"
  }

};

//Gloabl Users data
const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "d@d.com", 
    password: "$2a$10$UZxhRDJEJjqdoA86bB/hl.r0w0DiaoUxL08LFjm5h3UnkjeupsNUS"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "a@a.com", 
    password: "$2a$10$UZxhRDJEJjqdoA86bB/hl.r0w0DiaoUxL08LFjm5h3UnkjeupsNUS"
  }
}

//HOMEPAGE
app.get("/", (req, res) => {
  res.send("Hello!");
});

//GET REQUEST FOR THE LIST OF URLS
app.get("/urls", (req, res) => {
  // if (req.cookies["user_id"]) {
    const templateVars = { 
      urls: urlsForUser(req.session.user_id, urlDatabase), 
      users: users[req.session.user_id]
      };
   
    res.render("urls_index", templateVars);
  // } 
  // else {
    // res.redirect('/login');
    // res.status(404);
    // res.send("Please login or register to see the shortURL")
  // }
  
  // if (!req.cookies["user_id"]) {
  //   res.status(404);
  //   res.send("Please login or register to see the shortURL")
  // }
})

//GET REQUEST TO CREATE A NEW URL
app.get("/urls/new", (req, res) => {
  // if (req.session.user_id) {
    const templateVars = { 
      users: users[req.session.user_id] };
  
    res.render("urls_new", templateVars);
  // } else {
    // res.redirect('/login');
  // }
});

//GET REQUEST TO GO TO THE SHORT URL
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.status(404);
    res.send("Please login to access the URLs");
  } else if (!urlDatabase[req.params.shortURL]) {
    res.status(404);
    res.send("This short URL does not exist");
  } else if (urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const templateVars = { 
      shortURL: req.params.shortURL, 
      longURL:urlDatabase[req.params.shortURL].longURL, 
      users: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  } else {
    res.status(404);
    res.send("You don't have access to this URL")
  }

});

//GET REQUEST TO GO TO THE LONG URL
app.get("/u/:shortURL", (req, res) => {
  
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL]) {
    res.redirect(urlDatabase[shortURL].longURL);
  } else {
    res.status(404);
    res.send("This shortURL does not exist!");
  }
  
});

// REGISTER PAGE
app.get("/register", (req, res) => {

  const templateVars = { 
    users: users[req.session.user_id] };

  if (req.session.user_id) {
   return res.redirect("/urls")
  }
    
  res.render("urls_registration", templateVars);
  
})

// POST code to register
app.post("/register", (req, res) => {
  
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);
  const id = generateRandomString()
  const hashedPassword = bcrypt.hashSync(password, 10);

  if(user) {
    res.status(403);
    res.send("An account with this email already exists");
  } else if (!email || !password) {
    res.status(403);
    res.send("Either the email or password are empty");
  } else {
    users[id] = {"id":id, "email":email, "password": hashedPassword };
  
    req.session.user_id = id;
    res.redirect("/urls/");
  }
  
})

//LOGIN PAGE
app.get("/login", (req, res) => {
  const templateVars = { 
    userID: req.session.user_id,
    users: users[req.session.user_id] };

  if (req.session.user_id) {
    res.redirect("/urls")
  } else {
    res.render("urls_login", templateVars);
  }
  
})

//POST code for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email, users);

  if(!email || !password) {
    return res.status(403).send('Email or Password cannot be blank.');
  }
  else if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } 
  else if (!user) {
    res.status(403);
    res.send("There is no account with this email.")
  } 
  else {
    res.status(403);
    res.send("Invalid login credentials.");
  }

})

 // POST REQUEST -----------------------------------------------------
 //code to take to the shortURL page
 app.post("/urls", (req, res) => {
  
  const shortURL = generateRandomString();
  const userID = req.session.user_id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = {longURL, userID};

  res.redirect(`/urls/${shortURL}`)
});

//code to delete shortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    if(urlDatabase[req.params.shortURL] && urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls/")
    } 
    else {
      res.status(404);
      res.send("You are not logged in with thr correct credentials to access this shortURL");
    }
  }

});

//code to edit the longURL assigned to a shortURL
app.post("/urls/:id", (req, res) => {
  if (req.session.user_id) {
  const longURL = req.body.longURL;
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
  }
  else {
    res.status(404);
    res.send("You are not logged in with thr correct credentials to access this shortURL");
  }
});

//code for loggin out
app.post("/logout", (req, res) => {
  
  req.session.user_id = null;
  res.redirect("/urls/");
  
})

// LISTEN TO THE PORT -----------------------------------------------------

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});