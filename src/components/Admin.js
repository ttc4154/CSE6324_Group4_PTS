const admin = require('firebase-admin');
const serviceAccount = require('../cse6324-6eb33-firebase-adminsdk-c9rhg-2effaede50.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;