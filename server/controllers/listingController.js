//const Listing = require('../../database/models/ListingSchema');

const client = require('../../PostgreSQL/postgreSqlConnect.js');
const { performance } = require('perf_hooks');

// const retrieveOne = (req, res, next) => {
//   const { id } = req.params;
//   Listing.find({ id: id }).exec((err, data) => {
//     if (err) {
//       res.send(err);
//     } else if (data) {
//       res.send(data);
//     }
//   });
// };

// const parseData = (data) => {
//   let removeParens = data.substring(1, data.length - 1);
//   let dataArr = removeParens.split(',');
//   let item = {};

//   item.price = dataArr[0];
//   item.squareFootage = dataArr[1];
//   item.pricePerSquareFoot = dataArr[2];
//   item.rooms = dataArr[3];
//   item.beds = dataArr[4];
//   item.baths = dataArr[5];
//   item.houseType = dataArr[6];
//   item.neighborhood = dataArr[7];
//   item.streetAddress = dataArr[8];
//   item.stars = dataArr[9];
//   item.realty = dataArr[10];
//   item.shortRealty = dataArr[11];
//   item.realtor = dataArr[12];

//   return [item];
// };

// const getFromPostgres = (req, res) => {
//   const { id } = req.params;
//   let time = performance.now();
//   client.query(
//     `SELECT (price, squareFootage, pricePerSquareFoot,
//     rooms, beds, baths, houseType, neighborhood, streetAddress, stars, realty,
//     shortRealty, realtor
//     ) FROM listings WHERE id = ${id};`,
//     (err, data) => {
//       if (err) {
//         res.send(500);
//       } else {
//         if (data.rows[0] !== undefined) {
//           res.send(parseData(data.rows[0].row));
//           console.log('query time: ', performance.now() - time);
//         } else {
//           res.send(500);
//         }
//       }
//     }
//   );
// };

module.exports.retrieveOne = getFromPostgres;
