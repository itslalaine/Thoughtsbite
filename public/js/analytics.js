document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("thoughtChart");

    // If we're not on the Analytics page, stop.
    if (!canvas) return;

    const weeklyData = JSON.parse(canvas.dataset.weekly);

    const maxValue = Math.max(...weeklyData);

    new Chart(canvas, {

        type: "line",

        data: {

            labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],

            datasets: [{

                data: weeklyData,

                borderColor: "#16A085",

                backgroundColor: "rgba(67,160,71,0.12)",

                fill: true,

                borderWidth: 3,

                tension: 0.4,

                pointRadius: 5,

                pointHoverRadius: 7,

                pointBackgroundColor: "#21b099",

                pointBorderColor: "#fff",

                pointBorderWidth: 2

            }]

        },

        options: {

            interaction: {

                mode: "index",

                intersect: false

            },

            plugins: {

                legend: {

                    display: false

                },

                tooltip: {

                    displayColors: false,

                    callbacks: {

                        label(context) {

                            const value = context.raw;

                            return value === 1
                                ? "1 reflection"
                                : `${value} reflections`;

                        }

                    }

                }

            },

            scales: {

                x: {

                    grid: {

                        display: false

                    },

                    ticks: {

                        color: "#5c5c60"

                    }

                },

                y: {

                    beginAtZero: true,

                    suggestedMax: Math.max(10, maxValue + 2),

                    grid: {

                        color: "#F2F2F2"

                    },

                    ticks: {

                        color: "#5c5c60",

                        stepSize: 2

                    }

                }

            }

        }

    });

});