// admin.js
const admin = require('firebase-admin');
const serviceAccount = require('../../cse6324-6eb33-firebase-adminsdk-c9rhg-b6278046f8.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  //databaseURL: 'https://<your-database-name>.firebaseio.com' // Replace with database URL
});