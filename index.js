
const chartCanvas = document.getElementById("cashFlowChart");

new Chart(chartCanvas, {
    type: "bar",
    data: {
        labels: ["Income vs Expenses"],
        datasets: [
            {
                label: "Income",
                data: [54000],
                backgroundColor: "#166534",
                borderRadius: 10,
                barThickness: 120,
            },
            {
                label: "Expenses",
                data: [14000],
                backgroundColor: "#B91C1C",
                borderRadius: 10,
                barThickness: 120,
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: "top"
            }
        },
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});