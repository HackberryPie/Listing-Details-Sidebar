const UserSchema = require('./models/listingSchema.js');

UserSchema.sync({ force: true }).then(() => {
  return UserSchema.create({
    firstName: 'John',
    lastName: 'Hancock'
  });
});
