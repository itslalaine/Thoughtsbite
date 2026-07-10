//add
document.addEventListener("DOMContentLoaded", () => {

    const sourceType = document.getElementById("source");

    const sourceLabel = document.getElementById("sourceTitleLabel");
    const sourceInput = document.querySelector('input[name="sourceTitle"]');

    if (sourceType && sourceLabel && sourceInput) {

        const labels = {
            Book: "Book Title",
            Video: "Video Title",
            Podcast: "Episode Title",
            Article: "Article Title",
            Course: "Course Name",
            Movie: "Movie Title",
            Conversation: "Who or what was it about?",
            "Social Media": "Post / Creator",
            Other: "Title / Name"
        };

        const placeholders = {
            Book: "e.g. Atomic Habits",
            Video: "e.g. How to Build Better Habits",
            Podcast: "e.g. The Diary of a CEO - Episode 302",
            Article: "e.g. The Power of Tiny Habits",
            Course: "e.g. CS50: Introduction to Computer Science",
            Movie: "e.g. The Pursuit of Happyness",
            Conversation: "e.g. Conversation with myself lol",
            "Social Media": "e.g. James Clear Instagram Post",
            Other: "Enter title"
        };

        sourceType.addEventListener("change", function () {

            sourceLabel.textContent =
                labels[this.value] || "Title / Episode / Name";

            sourceInput.placeholder =
                placeholders[this.value] || "Enter title";

        });

    }

    const form = document.getElementById("addThoughtForm");

    if (form) {

        form.addEventListener("submit", function () {

            document.getElementById("saveBtn").disabled = true;

            document.getElementById("saveText").classList.add("d-none");
            document.getElementById("saveLoading").classList.remove("d-none");

        });

    }


    
});

// edit
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("editThoughtForm");

    form.addEventListener("submit", function () {

        const button = document.getElementById("saveBtn");
        const saveText = document.getElementById("saveText");
        const saveLoading = document.getElementById("saveLoading");

        button.disabled = true;

        saveText.classList.add("d-none");
        saveLoading.classList.remove("d-none");

    });
});
