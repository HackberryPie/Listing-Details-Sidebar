const getRandomId = (userContext, events, done) => {
  //   generate data
  const id = Math.floor(Math.random() * 10000000);
  userContext.vars.id = id;
  return done();
};

module.exports = { getRandomId };
