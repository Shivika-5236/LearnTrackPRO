const nodemailer = require('nodemailer');
const { Expo } = require('expo-server-sdk');

// Create a new Expo SDK client
const expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN }); // accessToken is optional

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends an email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Email body
 */
const sendEmail = async (to, subject, text) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('[Mock Email] Missing EMAIL_PASS. Would have sent to:', to, 'Subject:', subject);
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"LearnTrackPRO Alerts" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log('Email sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

/**
 * Sends an Expo Push Notification
 * @param {string} pushToken - Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Extra data payload
 */
const sendPushNotification = async (pushToken, title, body, data = {}) => {
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`);
    return;
  }

  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const receipts = await expo.sendPushNotificationsAsync([message]);
    console.log('Push sent. Receipt:', receipts);
  } catch (error) {
    console.error('Error sending push notification:', error);
  }
};

module.exports = {
  sendEmail,
  sendPushNotification,
};
