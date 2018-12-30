const express = require('express');
const router = require('./routes.js');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// process.env.PORT |

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname + '/../client/dist')));

// app.get('/', (req, res) => {
//   // res.redirect('/items/1');
//   console.log('hello');
// });

app.use('/', router);

let port = 3012
app.listen(port, () => {
  console.log(`server running at: http://localhost:${port}`);
}) 