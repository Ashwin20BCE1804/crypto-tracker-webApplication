
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const axios = require('axios');
const cron = require('node-cron');

const app = express();
app.use(cors());
app.use(express.json());


const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account key
const serviceAccount = require('./firebaseadmin/cryptoapp-b6517-firebase-adminsdk-es3q0-670dd10c9a.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


// Function to send notification to a user
const sendNotification = (userId, coinId, price, type) => {
    const payload = {
      notification: {
        title: 'Price Alert',
        body: `The price of ${coinId} has crossed the ${type} limit. Current price: $${price.toFixed(2)}`,
      },
    };
  
    admin
      .messaging()
      .sendToDevice(userId, payload)
      .then((response) => {
        console.log('Notification sent successfully:', response);
      })
      .catch((error) => {
        console.error('Error sending notification:', error);
      });
  };

// Function to check price triggers for a user's watchlist
const checkPriceTriggers = async (user) => {
  const { coins } = user;
  for (const coin of coins) {
    try {
      const response = await axios.get(`https://api.example.com/coin-price/${coin.coinId}`);
      const currentPrice = response.data.price;
      if (coin.lowerLimit && currentPrice < coin.lowerLimit) {
        sendNotification(user.userId, coin.coinId, currentPrice, 'lower');
      }
      if (coin.upperLimit && currentPrice > coin.upperLimit) {
        sendNotification(user.userId, coin.coinId, currentPrice, 'upper');
      }
    } catch (error) {
      console.error('Error fetching coin price:', error.message);
    }
  }
};

// Schedule price checking cron job (runs every 5 minutes in this example)
cron.schedule('*/5 * * * *', async () => {
  const usersSnapshot = await db.collection('watchlist').get();
  usersSnapshot.forEach((doc) => {
    const user = doc.data();
    checkPriceTriggers(user);
  });
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
