const { Pool, Client } = require('pg');

const client = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'listing-details',
  password: '',
  port: 5432
});

client.connect().catch((err) => {
  console.log(err);
});

client.query(
  `CREATE TABLE IF NOT EXISTS listings (
    id  SERIAL PRIMARY KEY,
    price integer,
    squareFootage integer,
    pricePerSquareFoot integer,
    rooms integer,
    beds integer,
    baths integer,
    houseType varchar(120),
    neighborhood varchar(120),
    streetAddress varchar(120),
    stars varchar(120),
    realty varchar(120),
    shortRealty varchar(120),
    realtor varchar(120)
);`,
  (err, res) => {
    if (err) console.log(err);
  }
);

module.exports = client;
