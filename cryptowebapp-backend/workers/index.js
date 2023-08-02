const express = require('express');
const admin = require('firebase-admin');

const app = express();

// Initialize Firebase Admin SDK with the correct path to your service account key file
const serviceAccount = require('./firebaseadmin/cryptoapp-b6517-firebase-adminsdk-es3q0-670dd10c9a.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// ... other server configurations and middleware ...

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
