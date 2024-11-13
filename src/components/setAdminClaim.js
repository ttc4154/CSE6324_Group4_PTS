// setAdminClaim.js (or any name you prefer)
const admin = require('./Admin'); // Import the initialized Firebase Admin SDK

const setAdminClaim = async (uid) => {
  try {
    // Set the custom claim isAdmin to true for the user
    await admin.auth().setCustomUserClaims(uid, { isAdmin: true });
    console.log(`Custom claim "isAdmin" set for user: ${uid}`);
  } catch (error) {
    console.error('Error setting custom claim:', error);
  }
};

// Example usage: Set the claim for a user with UID 'FhfAkMMZWLOe3r8eYXh0fi7xDP83'
setAdminClaim('FhfAkMMZWLOe3r8eYXh0fi7xDP83');
