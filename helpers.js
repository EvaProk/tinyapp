
const generateRandomString = function () {   // Generates a 6 character string of Letters and numbers
  let text = "";

  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
};

const getUserByEmail = (email, database) => {  //Finds a user by a given email in our database
  for (const key in database) {
    const user = database[key];
    if (user.email === email) {
      return user;
    }
  }

  return null;
};


module.exports = { getUserByEmail, generateRandomString };