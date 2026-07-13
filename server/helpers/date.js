exports.formatThoughtDate = function(date) {

    const today = new Date();
    today.setHours(0,0,0,0);

    const thoughtDate = new Date(date);
    thoughtDate.setHours(0,0,0,0);

    const diff = Math.floor(
        (today - thoughtDate) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) return "Today";

    if (diff === 1) return "Yesterday";

    if (diff < 7) return `${diff} days ago`;

    return thoughtDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};