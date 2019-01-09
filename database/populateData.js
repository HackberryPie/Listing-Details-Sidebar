//READ BEFORE RUNNING THIS SCRIPT:
//THIS FUNCTION IS FOR POPULATING THE DB WITH RANDOMLY GENERATED DATA

const mongoose = require('mongoose');
const Listing = require('./models/ListingSchema.js');
const faker = require('faker');
const { Writable } = require('stream');

let dataArray = [];

const end = 100;
const chunk = 10;
let count = 0;

console.log('going swimming ', chunk);
const createPool = () => {
  for (var i = 0; i <= chunk; i++) {
    if (i === chunk * 0.25) console.log('25%');
    if (i === chunk * 0.5) console.log('50%');
    if (i === chunk * 0.75) console.log('75%');
    const listing = new Listing({
      price: undefined,
      squareFootage: undefined,
      pricePerSquareFoot: undefined,
      rooms: undefined,
      beds: undefined,
      baths: undefined,
      houseType: undefined,
      neighborhood: undefined,
      streetAddress: undefined,
      stars: undefined,
      realty: undefined,
      shortRealty: undefined,
      realtor: undefined
    });
    dataArray.push(listing);
  }
};

createPool();
console.log('drying off...');

function generateData() {
  if (count >= end) return;
  if (count === end * 0.25) console.log('25%');
  if (count === end * 0.5) console.log('50%');
  if (count === end * 0.75) console.log('75%');
  for (let i = 0; i < dataArray.length; i++) {
    let item = {};
    item.id = i;

    if (i < 25) {
      item.price = faker.random.number({
        min: 250000,
        max: 500000
      });

      item.squareFootage = faker.random.number({
        min: 350,
        max: 600
      });

      item.pricePerSquareFoot = faker.random.number({
        min: 600,
        max: 2000
      });

      item.rooms = faker.random.number({
        min: 1,
        max: 2
      });

      item.beds = faker.random.number({
        min: 1,
        max: 2
      });

      item.baths = faker.random.number({
        min: 1,
        max: 2
      });
    }

    if (i >= 25 && i < 50) {
      item.price = faker.random.number({
        min: 500000,
        max: 1000000
      });

      item.squareFootage = faker.random.number({
        min: 450,
        max: 900
      });

      item.pricePerSquareFoot = faker.random.number({
        min: 850,
        max: 2000
      });

      item.rooms = faker.random.number({
        min: 2,
        max: 5
      });

      item.beds = faker.random.number({
        min: 1,
        max: 2
      });

      item.baths = faker.random.number({
        min: 1,
        max: 2
      });
    }

    if (i >= 50 && i < 75) {
      item.price = faker.random.number({
        min: 1000000,
        max: 3000000
      });

      item.squareFootage = faker.random.number({
        min: 1000,
        max: 2500
      });

      item.pricePerSquareFoot = faker.random.number({
        min: 850,
        max: 2500
      });

      item.rooms = faker.random.number({
        min: 5,
        max: 8
      });

      item.beds = faker.random.number({
        min: 2,
        max: 4
      });

      item.baths = faker.random.number({
        min: 2,
        max: 4
      });
    }

    if (i >= 75 && i < 100) {
      item.price = faker.random.number({
        min: 3000000,
        max: 20000000
      });

      item.squareFootage = faker.random.number({
        min: 2000,
        max: 6000
      });

      item.pricePerSquareFoot = faker.random.number({
        min: 1500,
        max: 2600
      });

      item.rooms = faker.random.number({
        min: 7,
        max: 12
      });

      item.beds = faker.random.number({
        min: 3,
        max: 6
      });

      item.baths = faker.random.number({
        min: 3,
        max: 5
      });
    }

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

    // const listing = new Listing({
    //   price: item.price,
    //   squareFootage: item.squareFootage,
    //   pricePerSquareFoot: item.pricePerSquareFoot,
    //   rooms: item.rooms,
    //   beds: item.beds,
    //   baths: item.baths,
    //   houseType: item.houseType,
    //   neighborhood: item.neighborhood,
    //   streetAddress: item.streetAddress,
    //   stars: item.stars,
    //   realty: item.realty,
    //   shortRealty: item.shortRealty,
    //   realtor: item.realtor
    // });

    const d = dataArray[i];

    d._id = new mongoose.Types.ObjectId();
    d.price = item.price;
    d.squareFootage = item.squareFootage;
    d.pricePerSquareFoot = item.pricePerSquareFoot;
    d.rooms = item.rooms;
    d.beds = item.beds;
    d.baths = item.baths;
    d.houseType = item.houseType;
    d.neighborhood = item.neighborhood;
    d.streetAddress = item.streetAddress;
    d.stars = item.stars;
    d.realty = item.realty;
    d.shortRealty = item.shortRealty;
    d.realtor = item.realtor;

    count++;
  }

  console.log('sending to mongo...');
  Listing.collection.insertMany(dataArray, (err, docs) => {
    if (err) {
      throw err;
    } else {
      console.log('done sending to mongo');
      console.log('so far: ', count);
      // generateData();
    }
  });
}

const writer = new Writable({
  write(dataArray, encoding, callback) {
    console.log();
    callback();
  }
});

function writeOneMillionTimes(writer, data, encoding, callback) {
  let i = 2;
  write();
  function write() {
    let ok = true;
    do {
      i--;
      if (i === 0) {
        // last time!
        Listing.collection.insertMany(dataArray, (err, docs) => {
          if (err) {
            throw err;
          } else {
            console.log('done sending to mongo');
            console.log('so far: ', count);
          }
        });
      } else {
        console.log('...generating stooge data');
        generateData();
        console.log('finished generation, storing');
        ok = writer.write(data, encoding);
      }
    } while (i > 0 && ok);
    if (i > 0) {
      // had to stop early!
      // write some more once it drains
      writer.once('drain', write);
    }
  }
}
writeOneMillionTimes(writer);

//generateData();

// Listing.collection.insert(dataArray, (err, docs) => {
//   if (err) {
//     throw err;
//   } else {
//     console.log('winner winner chicken dinnner', docs);
//   }
// });

// for (var i = 0; i < dataArray.length; i++) {
//   let data = dataArray[i];
//   const listing = new Listing({
//     id: data.id,
//     price: data.price,
//     squareFootage: data.squareFootage,
//     pricePerSquareFoot: data.pricePerSquareFoot,
//     rooms: data.rooms,
//     beds: data.beds,
//     baths: data.baths,
//     houseType: data.houseType,
//     neighborhood: data.neighborhood,
//     streetAddress: data.streetAddress,
//     stars: data.stars,
//     realty: data.realty,
//     shortRealty: data.shortRealty,
//     realtor: data.realtor
//   });

//   listing.save((err) => {
//     if (err) {
//       console.log(err);
//     }
//     if (i === amount * 0.25) console.log('25% saved', i);
//     if (i === amount * 0.5) console.log('50% saved', i);
//     if (i === amount * 0.75) console.log('75% saved', i);
//   });
// }
// console.log('complete');

//drop db before seed

// Listing.remove({}).exec((err, results) => {
//   if (err) {
//     console.log(err);
//   }
//   const myListing = new Listing;
//   myListing.generateData();
// });
