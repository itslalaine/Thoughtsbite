const Thought = require('../models/Thought');
const mongoose = require('mongoose');

exports.analyticsPage = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.session.user.id);

    const totalThoughts = await Thought.countDocuments({
      user: userId,
      isDeleted: false
    });

    // console.log("Total active thoughts:", totalThoughts);

    const now = new Date();

    const firstDayOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    const thoughtsThisMonth = await Thought.countDocuments({
      user: userId,
      isDeleted: false,
      createdAt: { $gte: firstDayOfMonth }
    });

    // console.log("This month:", thoughtsThisMonth);
    
    const mostUsedThemeData = await Thought.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false
        }
      },
      {
        $group: {
          _id: "$theme",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const mostUsedTheme =
      mostUsedThemeData.length > 0
        ? mostUsedThemeData[0]._id
        : "N/A";
    
    const topSourceData = await Thought.aggregate([
      {
        $match: {
          user: userId,
          isDeleted: false,
          source: { $ne: null }
        }
      },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    const topSource =
      topSourceData.length > 0
        ? topSourceData[0]._id
        : "N/A";

    // console.log("Top source:", topSource);

    const mostCommonMoodData = await Thought.aggregate([
        {
          $match: {
            user: userId,
            isDeleted: false
          }
        },
        {
          $group: {
            _id: "$mood",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 1 }
      ]);

      // console.log("Mood result:", mostCommonMoodData);

      const mostCommonMood =
        mostCommonMoodData.length > 0
          ? mostCommonMoodData[0]._id
          : "N/A";
    
    // Get all unique dates
    const thoughts = await Thought.find({
      user: userId,
      isDeleted: false
    }).select("createdAt");

    //Step 1: Extract unique dates (ignore time)
    const dateSet = new Set();

    thoughts.forEach(thought => {
      const date = new Date(thought.createdAt);
      date.setHours(0, 0, 0, 0); // Normalize to start of day
      dateSet.add(date.getTime());
    });

    let streak = 0;

    //Step 2: If no thoughts → streak = 0
    if (dateSet.size > 0) {
      // Convert set to array and sort descending (latest first)
      const sortedDates = Array.from(dateSet).sort((a, b) => b - a);

      streak = 1; // Start from most recent activity
      let currentDate = new Date(sortedDates[0]);

      //Step 3: Check consecutive previous days
      for (let i = 1; i < sortedDates.length; i++) {
        const previousDate = new Date(currentDate);
        previousDate.setDate(previousDate.getDate() - 1);

        if (sortedDates[i] === previousDate.getTime()) {
          streak++;
          currentDate = previousDate;
        } else {
          break;
        }
      }
    }

    // console.log("Flexible streak:", streak);

    res.render('analytics', {
      title: 'Analytics',
      description: 'Your writing insights',
      pageClass: 'analytics-page',
      totalThoughts,
      thoughtsThisMonth,
      mostUsedTheme,
      topSource,
      mostCommonMood,
      streak
    });

  } catch (error) {
    console.error("Analytics error:", error);
    res.send("Error happened. Check console.");
  }
};