const Thought = require("../models/Thought");
const mongoose = require("mongoose");

exports.dashboardPage = async (req, res) => {
  try {

    const userId = new mongoose.Types.ObjectId(req.session.user.id);

    /* ---------------- Greeting ---------------- */

    const hour = new Date().getHours();

    let greeting = "Hello";

    if (hour < 12) {
      greeting = "Good morning";
    } else if (hour < 18) {
      greeting = "Good afternoon";
    } else {
      greeting = "Good evening";
    }

    /* ---------------- Format Date ---------------- */

    const formatDateLabel = (date) => {

      const today = new Date();
      const d = new Date(date);

      today.setHours(0,0,0,0);
      d.setHours(0,0,0,0);

      const diff =
        (today.getTime() - d.getTime()) /
        (1000 * 60 * 60 * 24);

      if (diff === 0) return "Today";
      if (diff === 1) return "Yesterday";
      if (diff <= 7) return `${diff} days ago`;

      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      });

    };

    /* ---------------- Recent Thoughts ---------------- */

    const recentThoughtsRaw = await Thought.find({
      user: userId,
      isDeleted: false
    })
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    const recentThoughts = recentThoughtsRaw.map(thought => ({
      ...thought,
      displayDate: formatDateLabel(thought.createdAt)
    }));

    /* ---------------- Total Thoughts ---------------- */

    const totalThoughts = await Thought.countDocuments({
      user: userId,
      isDeleted: false
    });

    /* ---------------- Thoughts This Week ---------------- */

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const thoughtsThisWeek = await Thought.countDocuments({
      user: userId,
      isDeleted: false,
      createdAt: {
        $gte: last7Days
      }
    });

    /* ---------------- Most Used Theme ---------------- */

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
          count: {
            $sum: 1
          }
        }
      },
      {
        $sort: {
          count: -1
        }
      },
      {
        $limit: 1
      }
    ]);

    const mostUsedTheme =
      mostUsedThemeData.length > 0
        ? mostUsedThemeData[0]._id
        : "No theme yet";


    /* ---------------- Overall Reflection Streak ---------------- */

    const streakThoughts = await Thought.find({
      user: userId,
      isDeleted: false
    }).select("createdAt");

    const dateSet = new Set();

    streakThoughts.forEach(thought => {
      const date = new Date(thought.createdAt);
      date.setHours(0, 0, 0, 0);
      dateSet.add(date.getTime());
    });

    let streak = 0;

    if (dateSet.size > 0) {

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let current;

      // Start from today if there's a reflection today.
      if (dateSet.has(today.getTime())) {

        current = new Date(today);

      }
      // Otherwise allow the streak to continue from yesterday.
      else if (dateSet.has(yesterday.getTime())) {

        current = new Date(yesterday);

      }
      // Otherwise the streak is broken.
      else {

        current = null;

      }

      while (current && dateSet.has(current.getTime())) {

        streak++;

        current.setDate(current.getDate() - 1);

      }

    }
    /* ---------------- Render ---------------- */

    res.render("dashboard/index",{

      title:"Home",
      description:"Your private dashboard",

      greeting,

      streak,

      totalThoughts,

      thoughtsThisWeek,

      mostUsedTheme,

      recentThoughts

    });

  }

  catch(error){

    console.error(error);

    res.redirect("/");

  }

};