const CronJob = require("cron").CronJob;
var Queue = require("bull");

const alerts = require("../alerts");

const config = require("../config");
const currentPrice = require("../helpers/currentPrice");
const sendEmailNotification = require("../helpers/sendEmailNotification");


app.post('/add-coin', async (req, res) => {
  const { userId, coinId, lowerLimit, upperLimit } = req.body;
  try {
    const userRef = db.collection('watchlist').doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) {
      // User not found, create a new document for the user's watchlist
      await userRef.set({ coins: [] });
    }

    // Add the coin with its limits to the user's watchlist
    await userRef.update({
      coins: admin.firestore.FieldValue.arrayUnion({ coinId, lowerLimit, upperLimit }),
    });

    res.status(200).json({ message: 'Coin added to watchlist successfully' });
  } catch (error) {
    console.error('Error adding coin to watchlist:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Update the limits for a specific coin in a user's watchlist
app.patch('/update-limits', async (req, res) => {
  const { userId, coinId, lowerLimit, upperLimit } = req.body;
  try {
    const userRef = db.collection('watchlist').doc(userId);
    await userRef.update({
      coins: admin.firestore.FieldValue.arrayRemove({ coinId }),
    });
    await userRef.update({
      coins: admin.firestore.FieldValue.arrayUnion({ coinId, lowerLimit, upperLimit }),
    });
    res.status(200).json({ message: 'Limits updated successfully' });
  } catch (error) {
    console.error('Error updating limits:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

// Remove a coin from a user's watchlist
app.delete('/remove-coin', async (req, res) => {
  const { userId, coinId } = req.body;
  try {
    const userRef = db.collection('watchlist').doc(userId);
    await userRef.update({
      coins: admin.firestore.FieldValue.arrayRemove({ coinId }),
    });
    res.status(200).json({ message: 'Coin removed from watchlist successfully' });
  } catch (error) {
    console.error('Error removing coin from watchlist:', error.message);
    res.status(500).json({ error: 'Something went wrong' });
  }
});