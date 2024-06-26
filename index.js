const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

// Path to your service account key file
const serviceAccount = require('./service-account.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://flux-6e299.firebaseio.com'
});

const app = express();
app.use(bodyParser.json());

// Route to send notification
app.post('/notification', async (req, res) => {
    const token = req.headers.authorization;

    const notification = req.body;
    const match = notification.triggerMatch;
    const parsed = JSON.parse(match);
    const firstMatch = parsed[0];
    const title = firstMatch?.Title;
    const body = firstMatch?.Description;

    console.log({ title, body, token });

    const message = {
        notification: {
            title: title,
            body: body
        },
        token: token
    };

    try {
        const response = await admin.messaging().send(message);
        res.status(200).send({ success: true, messageId: response });
    } catch (error) {
        res.status(500).send({ success: false, error: error.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
