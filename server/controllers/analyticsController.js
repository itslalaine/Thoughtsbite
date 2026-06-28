const Thought = require('../models/Thought');
const mongoose = require('mongoose');

exports.analyticsPage = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user.id);

    const now = new Date();

    // ==========================================
    // DATE RANGES
    // ==========================================

    // Start of current week (Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    // End of current week (Saturday)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Start of month
    const firstDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    
    const dateOptions = {
      month: 'short',
      day: 'numeric'
    };

    const formattedStartOfWeek =
      startOfWeek.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

    const formattedEndOfWeek =
      endOfWeek.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

    // ==========================================
    // THOUGHTS THIS MONTH
    // ==========================================

    const thoughtsThisMonth = await Thought.countDocuments({
      user: userId,
      isDeleted: false,
      createdAt: {
        $gte: firstDayOfMonth
      }
    });

    // //thoughts this week
    // const thoughtsThisWeek = await Thought.countDocuments({
    //   user: userId,
    //   isDeleted: false,
    //   createdAt: {
    //     $gte: startOfWeek,
    //     $lte: endOfWeek
    //   }
    // });

    // ==========================================
    // MOST USED THEME THIS WEEK
    // ==========================================

    const topThemesData = await Thought.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
          createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek
          }
        }
      },
      {
        $group: {
          _id: "$theme",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 2 }
    ]);

    const topThemes = topThemesData.map(item => item._id);

    // ==========================================
    // TOP SOURCE THIS WEEK
    // ==========================================

    const topSourceData = await Thought.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
          createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek
          }
        }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 1
      }
    ]);

    const topSource =
      topSourceData.length > 0
        ? topSourceData[0]._id
        : 'N/A';

    // ==========================================
    // MOODS THIS WEEK
    // ==========================================

    const moodData = await Thought.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
          createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek
          }
        }
      },
      {
        $group: {
          _id: '$mood',
          count: { $sum: 1 }
        }
      }
    ]);

    const moodsThisWeek = {
      Motivated: 0,
      Neutral: 0,
      Confused: 0,
      Inspired: 0,
      Overwhelmed: 0
    };

    moodData.forEach(item => {
      const moodKey =
        item._id.charAt(0).toUpperCase() +
        item._id.slice(1).toLowerCase();

      moodsThisWeek[moodKey] = item.count;
    });

    const dominantMood = Object.keys(moodsThisWeek).reduce((a, b) =>
      moodsThisWeek[a] > moodsThisWeek[b] ? a : b
    );

    // const maxMoodCount = Math.max(...Object.values(moodsThisWeek), 1);

    // const moodBars = {};

    // Object.keys(moodsThisWeek).forEach(mood => {
    //   moodBars[mood] = Math.round(
    //     (moodsThisWeek[mood] / maxMoodCount) * 100
    //   );
    // });

    const totalMoodCount = Object.values(moodsThisWeek).reduce((a, b) => a + b, 0);

    const maxMoodCount = Math.max(...Object.values(moodsThisWeek), 1);

    const moodBars = {};

    Object.keys(moodsThisWeek).forEach(mood => {

        if (totalMoodCount === 0) {
            moodBars[mood] = 0;
        } 
        else {

            const percentage =
                (moodsThisWeek[mood] / maxMoodCount) * 100;

            moodBars[mood] =
                moodsThisWeek[mood] === 0
                    ? 0.5          // minimum width
                    : Math.round(percentage);

        }

    });

    const moodColors = {
    Motivated: "#4CAF50",
    Inspired: "#2E8B57",
    Neutral: "#FBC02D",
    Confused: "#FF7043",
    Overwhelmed: "#EF5350"
    };

    // ==========================================
    // WEEKLY LINE CHART
    // ==========================================

    const weeklyThoughts = await Thought.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
          createdAt: {
            $gte: startOfWeek,
            $lte: endOfWeek
          }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: '$createdAt' },
          count: { $sum: 1 }
        }
      }
    ]);

    const weeklyData = [0, 0, 0, 0, 0, 0, 0];

    weeklyThoughts.forEach(day => {
      weeklyData[day._id - 1] = day.count;
    });

    const thoughtsThisWeek = weeklyData.reduce((sum, day) => sum + day, 0);

    //Dominant mood for the week
    let weeklyReflectionMessage = "";

    if (thoughtsThisWeek === 0) {

      weeklyReflectionMessage =
        "No reflections were captured this week. Every new week is a fresh opportunity to begin again.";

    } else if (thoughtsThisWeek <= 2) {

      switch (dominantMood) {

        case "Inspired":
          weeklyReflectionMessage =
            "You took time to reflect this week. Even a few inspired moments can spark meaningful growth.";
          break;

        case "Motivated":
          weeklyReflectionMessage =
            "Your reflections show you're building momentum. Keep showing up.";
          break;

        case "Confused":
          weeklyReflectionMessage =
            "You explored some uncertainty this week. Reflection is often where clarity begins.";
          break;

        case "Overwhelmed":
          weeklyReflectionMessage =
            "You still made space to reflect despite a busy week. That's something to be proud of.";
          break;

        default:
          weeklyReflectionMessage =
            "Every reflection matters. Keep building your habit.";

      }

    } else if (thoughtsThisWeek <= 4) {

      switch (dominantMood) {

        case "Inspired":
          weeklyReflectionMessage =
            "You stayed engaged this week. Your reflections carried a positive mindset.";
          break;

        case "Motivated":
          weeklyReflectionMessage =
            "You remained motivated throughout the week. Keep that momentum going.";
          break;

        case "Confused":
          weeklyReflectionMessage =
            "You asked yourself important questions this week. Keep exploring your thoughts.";
          break;

        case "Overwhelmed":
          weeklyReflectionMessage =
            "Even during overwhelming moments, you continued reflecting. Keep taking one day at a time.";
          break;

        default:
          weeklyReflectionMessage =
            "You stayed consistent this week. Keep showing up.";

      }

    } else {

      switch (dominantMood) {

        case "Inspired":
          weeklyReflectionMessage =
            "You had a strong week of reflection. Your inspired mindset is becoming a habit.";
          break;

        case "Motivated":
          weeklyReflectionMessage =
            "Your consistency and motivation stood out this week. Keep building on that momentum.";
          break;

        case "Confused":
          weeklyReflectionMessage =
            "You reflected often despite uncertainty. That's how growth begins.";
          break;

        case "Overwhelmed":
          weeklyReflectionMessage =
            "Even with an overwhelming week, you continued showing up for yourself. That's real progress.";
          break;

        default:
          weeklyReflectionMessage =
            "You had a consistent week of reflection. Keep growing one thought at a time.";

      }

    }

    // ==========================================
    // CURRENT STREAK (ALL TIME)
    // ==========================================

    // Get all thought dates from the start of this week until today
    const streakThoughts = await Thought.find({
      user: userId,
      isDeleted: false,
      createdAt: {
        $gte: startOfWeek,
        $lte: now
      }
    }).select("createdAt");

    // Store unique dates only (ignore multiple thoughts on the same day)
    const dateSet = new Set();

    streakThoughts.forEach(thought => {
      const date = new Date(thought.createdAt);
      date.setHours(0, 0, 0, 0);
      dateSet.add(date.getTime());
    });

    // Calculate current streak (today backwards)
    let streak = 0;

    let currentDate = new Date(now);
    currentDate.setHours(0, 0, 0, 0);

    // Stop once we reach before the start of this week
    while (currentDate >= startOfWeek) {
      if (dateSet.has(currentDate.getTime())) {
        streak++;
      } else {
        break;
      }

      currentDate.setDate(currentDate.getDate() - 1);
    }

    let streakMessage = "";

    if (streak === 0) {
      streakMessage = "Start your streak today! 🌱";
    } else if (streak === 1) {
      streakMessage = "Great start! Keep it going 🔥";
    } else if (streak <= 3) {
      streakMessage = "You're building momentum 🚀";
    } else if (streak <= 6) {
      streakMessage = "Amazing consistency! 🌟";
    } else {
      streakMessage = "Perfect week! 🎉";
    }

    const streakLabel = streak === 1 ? "day" : "days";
    // ==========================================
    // RENDER
    // ==========================================

    res.render('analytics', {
      title: 'Growth',
      description: 'Your reflection insights',
      pageClass: 'analytics-page',

      thoughtsThisMonth,

      streak,
      streakMessage,
      streakLabel,

      weeklyData,

      moodsThisWeek,
      moodBars,
      moodColors,

      thoughtsThisWeek,
      dominantMood,
      weeklyReflectionMessage,
      
      topThemes,
      topSource,

      startOfWeek: formattedStartOfWeek,
      endOfWeek: formattedEndOfWeek
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.send('Error happened. Check console.');
  }
};