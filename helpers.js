//HELPER FUNCTIONS

// program to generate random strings for URLs and and User IDs.
const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const generateRandomString = () => {
  let result = '';
  let length = 6;
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
};

//Checks if an E-mail already exists in the user database
const getUserByEmail  = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

//Retrieves a list of urls assigned to a particular user
const urlsForUser = (id, database) => {
  let listURL = {};
  for (let user in database) {
    if (database[user].userID === id) {
      listURL[user] = database[user];
    }
  }
  return listURL;
};

module.exports = {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
};