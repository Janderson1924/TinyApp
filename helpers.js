const generateRandomString = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  while (randomString.length < 6) {
    randomString += chars[Math.floor(Math.random() * chars.length)];
  }
  return randomString;
};


const getUserByEmail = function(email, users) {
  for (const userID in users) {
    if (email === users[userID].email) {
      return userID;
    }
  }
  return undefined;
}

module.exports = { generateRandomString, getUserByEmail };