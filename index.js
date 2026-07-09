
const addTransactionBtn = document.querySelector("#addTransactionsBtn"); // button to open modal
const transactionModal = document.querySelector("#addTransactionsModal"); // modal to add transactions
const closeModalBtn = document.querySelector(".close-transaction-modal"); // button to close transactions

// transaction form selectors
const transactionForm = document.querySelector(".add-transaction-form"); // button to submit transactions

const transactionType = document.querySelector("#transaction-type") // (selecting income or expense)

const transactionDescription = document.querySelector("#transaction-description"); // (input for transaction description)

const transactionAmount = document.querySelector("#transaction-amount"); // (input for transaction amount)

const transactionDate = document.querySelector("#transaction-date"); // (input for transaction date)

const transactionCategory = document.querySelector("#transaction-category"); // (selecting transaction category)

const transactionTableBody = document.querySelector(".transactions-body"); // (table body to display transactions)


// dashboard selectors

const currentBalanceValue = document.querySelector("#current-balance"); // (display current balance)

const totalIncomeValue = document.querySelector("#total-income"); // (display total income)

const totalExpensesValue = document.querySelector("#total-expense"); // display total expenses

const totalTransactionsValue = document.querySelector("#total-transactions"); // display total transactions


const transactionFilter = document.querySelector(".transaction-filter");// transaction filter selector


const searchInput = document.querySelector("#searchbar"); // search input selector


const darkModeToggle = document.querySelector("#darkModeToggle"); // dark mode toggle selector

// navigation selectors
const dashboardPageBtn = document.querySelector(".dashboard-page");
const settingsPageBtn = document.querySelector(".settings-page");
const dashboardContent = document.querySelector(".dashboard-content");
const settingsContent = document.querySelector(".settings-content");

// navigation selectors
const loginPage = document.querySelector(".login-page"); // login page selector
const signupPage = document.querySelector(".signup-page"); // signup page selector
const mainSection = document.querySelector(".main-section");  // main section selector (dashboard and settings)
const registerLink = document.querySelector("#register-link"); // link to navigate to register page
const loginLink = document.querySelector("#login-link");
// login and signup form selectors


// authentication selectors
const loginForm = document.querySelector(".login-form");
const signupForm = document.querySelector(".signup-form");

const loginUsername = document.querySelector("#login-username");
const loginPassword = document.querySelector("#login-password");

const signupUsername = document.querySelector("#signup-username");
const signupPassword = document.querySelector("#signup-password");

// single source of truth variables
let allTransactions = []; // store all trans.
let users = [];  // store all users
let currentUser = null; // store currently logged in user
let currentlyEditingId = null; // store currently editing transaction id



// logout
const logoutBtn = document.querySelector(".logout");


// settings 
const navbarUsername = document.querySelector(".navbar span");
const settingsUsername = document.querySelector("#username");
const currencySelect = document.querySelector("#primary-currency");
const saveSettingsBtn = document.querySelector(".profile-details button");


// reset btn
const resetDataBtn = document.querySelector(".preference-section button");

// load user setting 
function loadUserSettings() {

    if (!currentUser) return;
    navbarUsername.textContent = currentUser.username;
    settingsUsername.value = currentUser.username;
    currencySelect.value = currentUser.currency;
    darkModeToggle.checked = currentUser.theme === "dark";
    document.body.classList.toggle(
        "dark",
        currentUser.theme === "dark"
    );
    applyChartTheme();
}

// save button listener       
saveSettingsBtn.addEventListener("click", () => {
    saveSettings();
});

function saveSettings() {
    currentUser.username = settingsUsername.value.trim();
    currentUser.currency = currencySelect.value;
    users = users.map((user) => {
        if (user.id === currentUser.id) {
            return currentUser;
        }
        return user;
    });
    saveUsers();
    saveCurrentUser();
    loadUserSettings();
    displayTransactions(getCurrentUserTransactions());
    updateDashboard();
    updateChart();

    Swal.fire({
        icon: "success",
        title: "Settings Updated Successfully",
        theme: "auto"
    });

}



// navigation event listeners
registerLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("signup");
});
// login link event listener
loginLink.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo("login");
});

// logout event listener
logoutBtn.addEventListener("click", () => {
    logoutUser();
});


// logout function
function logoutUser() {
    currentUser = null;
    localStorage.removeItem("currentUser");
    loginForm.reset();
    Swal.fire({
        icon: "success",
        title: "Logged Out Successfully",
        theme: "auto"
    }).then(() => {
        navigateTo("login");
    });
}

// when single transaction submitted
transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const transactionData = {
        id: Date.now(),
        userId: currentUser.id,
        type: transactionType.value,
        description: transactionDescription.value.trim(),
        amount: Number(transactionAmount.value),
        date: transactionDate.value,
        category: transactionCategory.value
    }

    // edit transaction ke liye check karenge ki currentlyEditingId null hai ya nahi, agar null nahi hai to edit karenge, agar null hai to new transaction add karenge
    if (currentlyEditingId !== null) {
        allTransactions = allTransactions.map((transaction) => {
            if (transaction.id === currentlyEditingId) {
                return {
                    ...transactionData,
                    id: currentlyEditingId
                };
            }
            return transaction;
        });
        currentlyEditingId = null;
    } else {
        allTransactions.push(transactionData);
    }
    saveTransactions(); // save transactions to local storage
    console.log("all transactions:", allTransactions);
    displayTransactions(getCurrentUserTransactions());
    transactionForm.reset();
    updateDashboard();
    updateChart();
    closeModal();
});


// handle display transactions in table
function displayTransactions(transactionsToDisplay = allTransactions) {

    const transactionRows = transactionsToDisplay.map((transaction) => {

        return `
            <tr data-id="${transaction.id}">
                <td class="transaction-date">${transaction.date}</td>
                <td class="transaction-description">
                    ${transaction.description}
                </td>
                <td>
                    <span class="transaction-category">
                        ${transaction.category}
                    </span>
                </td>
                <td class="transaction-amount ${transaction.type === "income"
                ? "transaction-income"
                : "transaction-expense"}">
                   ${transaction.type === "income" ? "+" : "-"}${getCurrencySymbol()}${transaction.amount.toFixed(2)}
                </td>
                <td>
                    <div class="transaction-actions">
                        <i class="bxf bx-pencil edit-icon"></i>
                        <i class="bxf bx-trash trash-icon"></i>
                    </div>
                </td>
            </tr>
        `;
    });
    transactionTableBody.innerHTML = transactionRows.join("");
}

// updaate dashboard values
function updateDashboard() {
    const userTransactions = getCurrentUserTransactions();
    const totalIncome = userTransactions.filter((transaction) => transaction.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
    totalIncomeValue.textContent = `${getCurrencySymbol()}${totalIncome.toFixed(2)}`;

    const totalExpenses = userTransactions.filter((transaction) => transaction.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);
    totalExpensesValue.textContent = `${getCurrencySymbol()}${totalExpenses.toFixed(2)}`;

    const currentBalance = totalIncome - totalExpenses;
    currentBalanceValue.textContent = `${getCurrencySymbol()}${currentBalance.toFixed(2)}`;

    const totalTransactions = userTransactions.length;
    totalTransactionsValue.textContent = totalTransactions;
}


// delete & edit transaction functionality event delegation listener

transactionTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("trash-icon")) {
        const transactionRow = e.target.closest("tr");
        const transactionId = Number(transactionRow.dataset.id);
        deleteTransaction(transactionId);
    }

    if (e.target.classList.contains("edit-icon")) {
        const transactionRow = e.target.closest("tr");
        const transactionId = Number(transactionRow.dataset.id);
        editTransaction(transactionId);
    }
});


// delete transaction function
function deleteTransaction(transactionId) {
    allTransactions = allTransactions.filter((transaction) => transaction.id !== transactionId);
    saveTransactions();
    displayTransactions(getCurrentUserTransactions());
    updateDashboard();
    updateChart();
}

// edit transaction function
function editTransaction(transactionId) {
    const transactionToEdit = allTransactions.find((transaction) => transaction.id === transactionId);
    currentlyEditingId = transactionId;
    openModal();
    transactionType.value = transactionToEdit.type;
    transactionDescription.value = transactionToEdit.description;
    transactionAmount.value = transactionToEdit.amount;
    transactionDate.value = transactionToEdit.date;
    transactionCategory.value = transactionToEdit.category;

}

// filter transactions based on type
transactionFilter.addEventListener("change", (e) => {
    const selectedType = e.target.value;
    // console.log("selected type:", selectedType);
    filterTransactions(selectedType);
});

// function to filter transactions based on type
function filterTransactions(type) {
    if (type === "all") {
        displayTransactions(getCurrentUserTransactions());
    } else {
        const filteredTransactions = getCurrentUserTransactions().filter(
            (transaction) => transaction.type === type
        );
        displayTransactions(filteredTransactions);
    }
}
// search transactions based on description
searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filteredTransactions = getCurrentUserTransactions().filter(
        (transaction) =>
            transaction.description
                .toLowerCase()
                .includes(searchTerm)
    );
    displayTransactions(filteredTransactions);
});

// dark mode toggle functionality
darkModeToggle.addEventListener("change", () => {
    if (darkModeToggle.checked) {
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
    currentUser.theme = darkModeToggle.checked ? "dark" : "light";
    applyChartTheme();
    users = users.map((user) => {
        if (user.id === currentUser.id) {
            return currentUser;
        }
        return user;
    });

    saveUsers();
    saveCurrentUser();
});

// apply chart colors based on current theme
function applyChartTheme() {
    const isDark = document.body.classList.contains("dark");
    const textColor = isDark ? "#CBD5E1" : "#666";
    const gridColor = isDark ? "#475569" : "rgba(0,0,0,0.1)";
    const legendColor = isDark ? "#F8FAFC" : "#666";

    cashFlowChart.options.scales.x.ticks = { color: textColor };
    cashFlowChart.options.scales.x.grid = { color: gridColor };
    cashFlowChart.options.scales.y.ticks = { color: textColor };
    cashFlowChart.options.scales.y.grid = { color: gridColor };
    cashFlowChart.options.plugins.legend.labels = { color: legendColor };
    cashFlowChart.update();
}

// navigation event listeners
dashboardPageBtn.addEventListener("click", () => {
    dashboardPageBtn.classList.add("active");
    settingsPageBtn.classList.remove("active");
    dashboardContent.style.display = "grid";
    settingsContent.style.display = "none";
});

settingsPageBtn.addEventListener("click", () => {
    settingsPageBtn.classList.add("active");
    dashboardPageBtn.classList.remove("active");
    dashboardContent.style.display = "none";
    settingsContent.style.display = "block";
});

// popup transaction modal
addTransactionBtn.addEventListener("click", (e) => {
    openModal();
});
// function to open modal (transaction popup)
function openModal() {
    transactionModal.style.display = "flex";
}

// function to close modal (transaction popup)
closeModalBtn.addEventListener("click", (e) => {
    closeModal();
});
function closeModal() {
    transactionModal.style.display = "none";
}


//get current user transactions
function getCurrentUserTransactions() {
    if (!currentUser) {
        return [];
    }
    return allTransactions.filter((transaction) => {
        return transaction.userId === currentUser.id;
    });

}

// function to save all transacrtions to local storage
function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(allTransactions));
}

// function to load transactions from local storage
function loadTransactions() {
    const loadedTransactions = JSON.parse(localStorage.getItem('transactions'));
    allTransactions = loadedTransactions || [];
    displayTransactions(getCurrentUserTransactions());
    updateDashboard();
    updateChart();
}
// when register form submitted
signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    registerUser();
});
// function to register new auser
function registerUser() {

    const user = {
        id: Date.now(),
        username: signupUsername.value.trim(),
        password: signupPassword.value.trim(),
        currency: "USD",
        theme: "light"

    };
    const existingUser = users.find((u) => u.username === user.username);
    if (existingUser) {
        // SweetAlert
        Swal.fire({
            icon: "error",
            title: "Oops...",
            theme: 'auto',
            text: "Username already exists. Please choose a different username.",
        });
        return;
    }
    users.push(user);
    saveUsers();
    signupForm.reset();
    // SweetAlert Success
    Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "Please login with your credentials.",
        theme: 'auto'
    }).then(() => {
        navigateTo("login");
    });
}
//  when login form submitted
loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    loginUser();
});
// function to login user
function loginUser() {
    // check if user exists
    const user = users.find((u) => u.username === loginUsername.value.trim() && u.password === loginPassword.value.trim());
    if (user) {
        currentUser = user;
        saveCurrentUser();
        loadUserSettings();
        displayTransactions(getCurrentUserTransactions());
        updateDashboard();
        updateChart();
        loginForm.reset();
        Swal.fire({
            icon: "success",
            title: "Login Successful!",
            theme: 'auto'
        }).then(() => {
            navigateTo("dashboard");
        });

    } else {
        // SweetAlert
        Swal.fire({
            icon: "error",
            title: "Oops...",
            theme: 'auto',
            text: "Invalid username or password. Please try again.",
        });
    }
}


// function to save users to local storage
function saveUsers() {
    localStorage.setItem('users', JSON.stringify(users));
}

// function to load users from local storage
function loadUsers() {
    const loadedUsers = JSON.parse(localStorage.getItem('users'));
    users = loadedUsers || [];
}

// function to save current user to local storage
function saveCurrentUser() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
}

// function to load current user from local storage
function loadCurrentUser() {
    const loadedUser = JSON.parse(localStorage.getItem('currentUser'));
    currentUser = loadedUser || null;
}



//  navigation function to navigate between login, signup and dashboard pages
function navigateTo(page) {

    loginPage.style.display = "none";
    signupPage.style.display = "none";
    mainSection.style.display = "none";

    if (page === "login") {
        loginPage.style.display = "flex";
    }

    else if (page === "signup") {
        signupPage.style.display = "flex";
    }

    else if (page === "dashboard") {
        mainSection.style.display = "grid";
    }

}

// get currency symbol based on user settings
function getCurrencySymbol() {

    if (!currentUser) {
        return "$";
    }
    switch (currentUser.currency) {
        case "INR":
            return "₹";
        case "USD":
            return "$";
        case "EUR":
            return "€";
        case "GBP":
            return "£";
        case "JPY":
            return "¥";
        default:
            return "$";
    }
}


// reset event listner
resetDataBtn.addEventListener("click", () => {
    resetAllData();
});

// reset all data function
function resetAllData() {
    Swal.fire({
        title: "Are you sure?",
        text: "This will permanently delete all your transactions.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        theme: "auto"
    }).then((result) => {

        if (!result.isConfirmed) return;
        allTransactions = allTransactions.filter(
            (transaction) => transaction.userId !== currentUser.id
        );
        saveTransactions();
        displayTransactions(getCurrentUserTransactions());
        updateDashboard();
        updateChart();
        Swal.fire({
            icon: "success",
            title: "Data Reset Successfully",
            text: "All your transactions have been deleted.",
            theme: "auto"
        });
    });
}



//  chart implementation
const chartCanvas = document.getElementById("cashFlowChart");

const cashFlowChart = new Chart(chartCanvas, {
    type: "bar",
    data: {
        labels: ["Income vs Expenses"],
        datasets: [
            {
                label: "Income",
                data: [0],
                backgroundColor: "#166534",
                borderRadius: 10,
                barThickness: 120,
            },
            {
                label: "Expenses",
                data: [0],
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



// function to update chart data
function updateChart() {
    const userTransactions = getCurrentUserTransactions();
    const totalIncome = userTransactions.filter((transaction) => transaction.type === "income").reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = userTransactions.filter((transaction) => transaction.type === "expense").reduce((acc, curr) => acc + curr.amount, 0);

    cashFlowChart.data.datasets[0].data = [totalIncome];
    cashFlowChart.data.datasets[1].data = [totalExpenses];
    cashFlowChart.update();
}


// master function
function initApp() {
    loadUsers();
    loadCurrentUser();
    loadTransactions();

    if (currentUser) {
        navigateTo("dashboard");
        loadUserSettings();
    } else {
        navigateTo("login");
    }
}
initApp();

