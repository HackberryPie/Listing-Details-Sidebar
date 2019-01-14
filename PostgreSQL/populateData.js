const faker = require('faker');
const format = require('pg-format');
const { performance } = require('perf_hooks');
//const client = require('./postgreSqlConnect.js');

console.log('starting process...' + performance.now());

//CREATE SOME DATA
let batch = [];
const limit = 100000;
let count = 0;

const ranges = {
  low: {
    price: [250000, 500000],
    squareFootage: [350, 600],
    pricePerSquareFoot: [600, 2000],
    rooms: [1, 2],
    beds: [1, 2],
    baths: [1, 2]
  },
  lowMid: {
    price: [500000, 1000000],
    squareFootage: [450, 900],
    pricePerSquareFoot: [850, 2000],
    rooms: [2, 5],
    beds: [1, 2],
    baths: [1, 2]
  },
  mid: {
    price: [1000000, 3000000],
    squareFootage: [1000, 2500],
    pricePerSquareFoot: [850, 2500],
    rooms: [5, 8],
    beds: [2, 4],
    baths: [2, 4]
  },
  high: {
    price: [3000000, 20000000],
    squareFootage: [2000, 6000],
    pricePerSquareFoot: [1500, 2600],
    rooms: [7, 12],
    beds: [3, 6],
    baths: [3, 5]
  }
};

const fillInBatch = () => {
  console.log('generating batch...');
  for (var i = 0; i < limit; i++) {
    let range = 'high';
    if (i < limit * 0.75) range = 'mid';
    if (i < limit * 0.5) range = 'lowMid';
    if (i < limit * 0.25) range = 'low';
    const cookie = [];
    //price
    cookie.push(
      faker.random.number({
        min: ranges[range].price[0],
        max: ranges[range].price[1]
      })
    );
    //sqft
    cookie.push(
      faker.random.number({
        min: ranges[range].squareFootage[0],
        max: ranges[range].squareFootage[1]
      })
    );
    //ppsqft
    cookie.push(
      faker.random.number({
        min: ranges[range].pricePerSquareFoot[0],
        max: ranges[range].pricePerSquareFoot[1]
      })
    );
    //rooms
    cookie.push(
      faker.random.number({
        min: ranges[range].rooms[0],
        max: ranges[range].rooms[1]
      })
    );
    //beds
    cookie.push(
      faker.random.number({
        min: ranges[range].beds[0],
        max: ranges[range].beds[1]
      })
    );
    //baths
    cookie.push(
      faker.random.number({
        min: ranges[range].baths[0],
        max: ranges[range].baths[1]
      })
    );
    let num1 = faker.random.number({
      max: 3
    });

    let num2 = faker.random.number({
      max: 4
    });

    const houseType = ['Condo', 'Co-op', 'House', 'Townhouse'];

    const neighborhood = [
      'Brooklyn',
      'Manhattan',
      'Queens',
      'Staten Island',
      'Bronx'
    ];

    cookie.push(houseType[num1]);
    cookie.push(neighborhood[num2]);
    cookie.push(faker.address.streetAddress());
    cookie.push(
      faker.random.number({
        min: 0,
        max: 30
      })
    );
    cookie.push(faker.company.companyName());
    cookie.push(faker.company.companySuffix());
    cookie.push(faker.name.findName());
    batch.push(cookie);
    count++;
  }
  if (count < 2000000) {
    let sqlQuery = format(
      `INSERT INTO listings (price, squareFootage, pricePerSquareFoot,
              rooms, beds, baths, houseType, neighborhood, streetAddress, stars, realty,
              shortRealty, realtor
              ) VALUES %L`,
      batch
    );
    console.log('inserting into database');
    client.query(sqlQuery, (err, res) => {
      if (err) console.log(err);
      console.log('It took ' + performance.now() + ' to make ' + count);
      batch = [];
      fillInBatch();
    });
  }
};

fillInBatch();
