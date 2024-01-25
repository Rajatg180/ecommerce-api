// import { MongoClient } from 'mongodb';
// import {
//   ObjectId
// } from 'mongodb';

// /*
//  * Requires the MongoDB Node.js Driver
//  * https://mongodb.github.io/node-mongodb-native
//  */

// const agg = [
//   {
//     '$match': {
//       'product': new ObjectId('65b14e3c57ed1885fe256b75')
//     }
//   }, {
//     '$group': {
//       '_id': null, 
//       'avergaeRating': {
//         '$avg': '$rating'
//       }, 
//       'numOfReviews': {
//         '$sum': 1
//       }
//     }
//   }
// ];

// const client = await MongoClient.connect(
//   '',
//   { useNewUrlParser: true, useUnifiedTopology: true }
// );
// const coll = client.db('eCommerceDB').collection('reviews');
// const cursor = coll.aggregate(agg);
// const result = await cursor.toArray();
// await client.close();




// example aggregation group by using rating

import { MongoClient } from 'mongodb';
import {
  ObjectId
} from 'mongodb';

/*
 * Requires the MongoDB Node.js Driver
 * https://mongodb.github.io/node-mongodb-native
 */

const agg = [
  {
    '$match': {
      'product': new ObjectId('65b14e3c57ed1885fe256b75')
    }
  }, {
    '$group': {
      '_id': '$rating', 
      'count': {
        '$sum': 1
      }
    }
  }
];

const client = await MongoClient.connect(
  '',
  { useNewUrlParser: true, useUnifiedTopology: true }
);
const coll = client.db('eCommerceDB').collection('reviews');
const cursor = coll.aggregate(agg);
const result = await cursor.toArray();
await client.close();