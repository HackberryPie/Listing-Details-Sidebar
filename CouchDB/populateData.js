const nano = require('nano')('http://localhost:5985');
const db = nano.db.use('listing-details');
const faker = require('faker');
const { performance } = require('perf_hooks');

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

let batch = { docs: [] };

const max = 10000000;
const limit = 2500;
let count = 0;

const time = performance.now();

const createBatch = () => {
  for (var i = 0; i < limit; i++) {
    let item = {};
    item.price = undefined;
    item.squareFootage = undefined;
    item.pricePerSquareFoot = undefined;
    item.rooms = undefined;
    item.beds = undefined;
    item.baths = undefined;
    item.houseType = undefined;
    item.neighborhood = undefined;
    item.streetAddress = undefined;
    item.stars = undefined;
    item.realty = undefined;
    item.shortRealty = undefined;
    item.realtor = undefined;
    batch.docs.push(item);
  }
};

console.log('creating batch');
createBatch();

const fillInBatch = () => {
  for (var i = 0; i < limit; i++) {
    let item = batch.docs[i];
    let range = 'high';
    if (i < limit * 0.75) range = 'mid';
    if (i < limit * 0.5) range = 'lowMid';
    if (i < limit * 0.25) range = 'low';
    //price
    item.price = faker.random.number({
      min: ranges[range].price[0],
      max: ranges[range].price[1]
    });

    //sqft
    item.pricePerSquareFoot = faker.random.number({
      min: ranges[range].squareFootage[0],
      max: ranges[range].squareFootage[1]
    });

    //ppsqft
    item.pricePerSquareFoot = faker.random.number({
      min: ranges[range].pricePerSquareFoot[0],
      max: ranges[range].pricePerSquareFoot[1]
    });

    //rooms
    item.rooms = faker.random.number({
      min: ranges[range].rooms[0],
      max: ranges[range].rooms[1]
    });

    //beds
    item.beds = faker.random.number({
      min: ranges[range].beds[0],
      max: ranges[range].beds[1]
    });

    //baths
    item.baths = faker.random.number({
      min: ranges[range].baths[0],
      max: ranges[range].baths[1]
    });

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

    item.houseType = houseType[num1];
    item.neighborhood = neighborhood[num2];
    item.streetAddress = faker.address.streetAddress();
    item.stars = faker.random.number({
      min: 0,
      max: 30
    });

    item.realty = faker.company.companyName();
    item.shortRealty = faker.company.companySuffix();
    item.realtor = faker.name.findName();
    item._id = `${count}`;
    count++;

    if (i === limit - 1 && count < max) {
      db.bulk(batch, 'listings')
        .then(() => {
          if (count === max * 0.1) {
            console.log(
              'it took ' + (performance.now() - time) + ' to save ' + count
            );
          }
          if (count === max * 0.2) {
            console.log(
              'it took ' + (performance.now() - time) + ' to save ' + count
            );
          }
          if (count === max * 0.3) {
            console.log(
              'it took ' + (performance.now() - time) + ' to save ' + count
            );
          }
          if (count === max * 0.4) {
            console.log(
              'it took ' + (performance.now() - time) + ' to save ' + count
            );
          }
          if (count === max * 0.5) {
            console.log(
              'it took ' + (performance.now() - time) + ' to save ' + count
            );
          }
          if (count === max * 0.6) {
            console.log(
              'it took ' + (performance.now() - time) + ' to save ' + count
            );
          }
          if (count === max * 0.7) {
            console.log(
              'it took ' + (performance.now() - time) + ' to save ' + count
            );
          }
          if (count === max * 0.8) {
            console.log(
              'it took ' + (performance.now() - time) + ' to save ' + count
            );
          }
          if (count === max * 0.9) {
            console.log(
              'it took ' + (performance.now() - time) + ' to save ' + count
            );
          }

          fillInBatch();
        })
        .catch((err) => {
          console.log(err);
        });
    } else if (i === limit - 1 && count >= max) {
      db.bulk(batch, 'listings')
        .then(() => {
          console.log(
            'it took ' + (performance.now() - time) + ' to save ' + count
          );
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }
};

fillInBatch();

// db.get(`1`).then((body) => {
//   console.log(body);
// });
