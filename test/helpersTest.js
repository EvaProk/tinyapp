const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
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

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers).id;
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return UNDEFINED if the email is not in our database', function() {
    const user = getUserByEmail("user@eple.com", testUsers);
    assert.equal(user, undefined);
  });
  it('should return UNDEFINED if the email is empty', function() {
    const user = getUserByEmail("", testUsers);

    assert.equal(user, undefined);
  });


});