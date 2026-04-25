const Thought = require('../models/Thought');
const mongoose = require('mongoose');

exports.dashboardPage = async (req, res) => {
  try {

    const userId = new mongoose.Types.ObjectId(req.session.user.id);

    //RECENT THOUGHTS (limit 6 for carousel)
    const recentThoughtsRaw = await Thought.find({
      user: userId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(6);


    //FORMAT DATE LABEL (Today, Yesterday, etc.)
    const formatDateLabel = (date) => {
      const now = new Date();
      const d = new Date(date);

      // remove time so comparison is accurate
      now.setHours(0,0,0,0);
      d.setHours(0,0,0,0);

      const diffTime = now - d;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays <= 7) return `${diffDays} days ago`;

      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };


    //ADD DATE LABEL TO EACH THOUGHT
    const recentThoughts = recentThoughtsRaw.map(thought => ({
      ...thought.toObject(),
      dateLabel: formatDateLabel(thought.createdAt)
    }));


    //THOUGHTS THIS WEEK
    const now = new Date();
    const last7Days = new Date();
    last7Days.setDate(now.getDate() - 7);

    const thoughtsThisWeek = await Thought.countDocuments({
      user: userId,
      isDeleted: false,
      createdAt: { $gte: last7Days }
    });


    //MOST USED THEME
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
        : "No data";


    //STREAK (same logic as analytics)
    const thoughts = await Thought.find({
      user: userId,
      isDeleted: false
    }).select("createdAt");

    const dateSet = new Set();

    thoughts.forEach(thought => {
      const date = new Date(thought.createdAt);
      date.setHours(0, 0, 0, 0);
      dateSet.add(date.getTime());
    });

    let streak = 0;

    if (dateSet.size > 0) {

      const sortedDates = Array.from(dateSet).sort((a, b) => b - a);

      streak = 1;
      let currentDate = new Date(sortedDates[0]);

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


    //GROUP FOR CAROUSEL (3 cards per slide)
    const chunkArray = (array, size) => {

      const result = [];

      for (let i = 0; i < array.length; i += size) {
        result.push(array.slice(i, i + size));
      }

      return result;
    };


    const thoughtChunks = chunkArray(recentThoughts, 3);


    res.render('dashboard/index', {
      title: 'Overview',
      description: 'Your private dashboard',
      streak,
      mostUsedTheme,
      thoughtsThisWeek,
      thoughtChunks
    });

  }

  catch (error) {

    console.error("Dashboard error:", error);
    res.send("Dashboard error");

  }
};