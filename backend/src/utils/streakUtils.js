const User = require('../models/User');

const getLocalUserDateString = (timezone) => {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone || 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(new Date()); // Returns "YYYY-MM-DD"
  } catch (error) {
    // Fallback if timezone is invalid
    return new Date().toISOString().split('T')[0];
  }
};

const diffInDays = (date1Str, date2Str) => {
  const d1 = new Date(date1Str);
  const d2 = new Date(date2Str);
  const diffTime = d2.getTime() - d1.getTime();
  return diffTime / (1000 * 3600 * 24);
};

// Validates if the user missed a day. If they did, reset to 0. This is called on profile load.
const evaluateStreakMiss = async (user) => {
  if (!user.lastStreakUpdateStr || user.streak === 0) return user;

  const todayStr = getLocalUserDateString(user.timezone);
  const daysDiff = diffInDays(user.lastStreakUpdateStr, todayStr);

  if (daysDiff > 1) {
    user.streak = 0;
    // Don't modify lastStreakUpdateStr, keep it as their last active day until they act again
    user = await user.save();
  }
  return user;
};

// Increments streak on activity
const updateUserStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const todayStr = getLocalUserDateString(user.timezone);

  if (!user.lastStreakUpdateStr) {
    user.streak = 1;
    user.lastStreakUpdateStr = todayStr;
    if (user.streak > (user.longestStreak || 0)) user.longestStreak = user.streak;
    return await user.save();
  }

  const daysDiff = diffInDays(user.lastStreakUpdateStr, todayStr);

  if (daysDiff === 1) {
    // Next day, increment
    user.streak += 1;
    user.lastStreakUpdateStr = todayStr;
    if (user.streak > (user.longestStreak || 0)) user.longestStreak = user.streak;
    return await user.save();
  } else if (daysDiff > 1) {
    // Missed a day, restart at 1 since they just completed an activity
    user.streak = 1;
    user.lastStreakUpdateStr = todayStr;
    // Don't update longestStreak since streak reset
    return await user.save();
  } else if (daysDiff === 0 && user.streak === 0) {
    // Missed a day but did an activity today, or first activity today
    user.streak = 1;
    user.lastStreakUpdateStr = todayStr;
    if (user.streak > (user.longestStreak || 0)) user.longestStreak = user.streak;
    return await user.save();
  }
  
  // If daysDiff === 0 and streak is > 0, they already incremented today
  return user;
};

module.exports = {
  updateUserStreak,
  evaluateStreakMiss,
};
