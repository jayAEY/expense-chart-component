import {
  verify,
  saveDataToDB,
  openLoginAndRegister,
  closeLoginAndRegister,
  openForgot,
  forgotPassword,
  resetPassword,
  login,
  register,
  logout,
} from "./auth.js";

let bars = document.querySelectorAll(".bar");
let labels = document.querySelectorAll(".label");
let tooltip = document.querySelector("#tooltip");

let balanceDisplay = document.querySelector("#balance");
balanceDisplay.innerText = localStorage.getItem("balance") || "0.00";
let balanceAdd = document.querySelector("#balance-add");
let balanceButton = document.querySelector("#balance-submit");

let expenseData = JSON.parse(localStorage.getItem("expenseData")) || [];
let expenseDisplay = document.querySelector("#monthly-total");
expenseDisplay.innerText = localStorage.getItem("monthTotal") || "0.00";

let expenseChange = document.querySelector("#expense-change");
let expenseAdd = document.querySelector("#expense-add");
let expenseDate = document.querySelector("#expense-date");
let expenseButton = document.querySelector("#expense-submit");
let resetButton = document.querySelector("#reset");

let expenseSection = document.querySelector("#expense-section");
let tableBody = document.querySelector("tbody");

axios.defaults.withCredentials = true;
window.onload = verify();

// data handling
function getBarData() {
  // handle month totals and month to month change
  let thisMonth = new Date().getMonth();
  let lastMonth = thisMonth - 1;
  let monthTotal = getMonthSpending(thisMonth);
  let lastMonthTotal = getMonthSpending(lastMonth);
  expenseDisplay.innerText = monthTotal.toFixed(2);

  let monthToMonthChange = monthTotal - lastMonthTotal;
  monthToMonthChange = ((monthToMonthChange / lastMonthTotal) * 100).toFixed(2);

  if (!isNaN(monthToMonthChange)) {
    monthToMonthChange >= 0
      ? (monthToMonthChange = `+${monthToMonthChange}%`)
      : (monthToMonthChange = `${monthToMonthChange}%`);
    expenseChange.innerText = monthToMonthChange;
  } else {
    expenseChange.innerText = "0%";
  }

  // change order of day labels based on current day
  let data = lastWeekSpending();
  let dayLabels = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  let dayLabelsSorted = [];

  let currentDay = new Date().getDay();

  for (let i = currentDay + 1; i <= 7; i++) {
    if (i < 7) {
      dayLabelsSorted.push(dayLabels[i]);
    } else if (i == 7) {
      for (let j = 0; j < currentDay + 1; j++) {
        dayLabelsSorted.push(dayLabels[j]);
      }
    }
  }

  // change order of day labels based on current day
  for (let i = 0; i < 7; i++) {
    labels[i].innerText = dayLabelsSorted[i];
  }

  //change bars based on data
  bars[6].style.backgroundColor = "hsl(186, 34%, 60%)";
  for (let i = 0; i < bars.length; i++) {
    let bar = bars[i];
    let spentInDay = 0;
    data[i] ? (spentInDay = data[i].expense) : null;
    if (data[i]) {
      bar.style.dataSpent = spentInDay;
      if (spentInDay > 490) {
        bar.style.height = "100%";
      } else if (spentInDay < 2) {
        bar.style.height = `2%`;
      } else {
        bar.style.height = `${2 + spentInDay * 0.2}%`;
      }
    } else {
      bar.style.dataSpent = 0;
      bar.style.height = `2%`;
    }
  }
}

function lastWeekSpending() {
  let currentDate = new Date();
  let lastWeek = [];
  let lastWeekMerged = [];

  // adds blank expenses for each day in last week to display bars properly
  for (let i = 0; i < 7; i++) {
    let compareDate = new Date(
      new Date().setDate(currentDate.getDate() - i)
    ).toLocaleDateString();
    lastWeek.push({ date: compareDate, expense: 0 });
  }

  // check for expenses from last week and pushes them into lastWeek
  expenseData.forEach((expense) => {
    for (let i = 0; i < 7; i++) {
      let compareDate = new Date(
        new Date().setDate(currentDate.getDate() - i)
      ).toLocaleDateString();
      if (expenseDate == currentDate || expense.date == compareDate) {
        lastWeek.push(expense);
      }
    }
  });

  // create copy to add expenses properly
  lastWeek = JSON.parse(JSON.stringify(lastWeek));

  // sort and merge expenses according to days
  lastWeek.sort((a, b) => new Date(a.date) - new Date(b.date));
  lastWeek.forEach((expense) => {
    if (lastWeekMerged.length > 0) {
      let findSameDate = lastWeekMerged.indexOf(
        lastWeekMerged.find((e) => e.date == expense.date)
      );
      // if date in merged and unmerged last week match, combine expense and push into merged
      // push if there is no match
      if (findSameDate != -1) {
        lastWeekMerged[findSameDate].expense += expense.expense;
      } else {
        lastWeekMerged.push(expense);
      }
      //push if merged is empty
    } else if (lastWeekMerged.length == 0) {
      lastWeekMerged.push(expense);
    }
  });

  return lastWeekMerged;
}

function getMonthSpending(month) {
  let monthData = [];
  let date = new Date(new Date().setMonth(month));
  let dateDay = date.getDate();
  let dateYear = date.getFullYear();
  let monthLastDay = new Date(dateYear, month + 1, 0);
  let monthDays = monthLastDay.getDate();

  // add all expense data from month into array
  expenseData.forEach((expense) => {
    for (let i = 0; i < monthDays; i++) {
      let compareDate = new Date(
        monthLastDay.setDate(monthDays - i)
      ).toLocaleDateString();
      if (expense.date == monthLastDay || expense.date == compareDate) {
        monthData.push(expense);
      }
    }
  });

  // sum up monthly expenses
  let total = 0;
  monthData.forEach((expense) => (total += expense.expense));
  expenseDisplay.innerHTML = total;
  return total;
}

function handleTooltip(bar) {
  let barCoords = bar.getBoundingClientRect();
  tooltip.style.display = "block";
  tooltip.innerText = `$${bar.style.dataSpent}`;
  tooltip.style.left = `${
    barCoords.x - (tooltip.getBoundingClientRect().width - barCoords.width) / 2
  }px`;
  tooltip.style.top = `${barCoords.top - 40}px`;
}

function addBalance() {
  // limits balance to length of 17 including decimal and minus sign
  let balance = balanceDisplay.innerText;
  if (balance.length < 17) {
    // check for valid decimal and number
    let decimals = balanceAdd.value.toString().split(".")[1];
    if (
      (decimals === undefined || decimals.length < 3) &&
      balanceAdd.value !== ""
    ) {
      let newBalance = (
        parseFloat(balance) + parseFloat(balanceAdd.value)
      ).toFixed(2);
      balanceDisplay.innerText = newBalance;
      localStorage.setItem("balance", newBalance);
      saveDataToDB();
    }
  }
}

function addExpense() {
  // limits spending total and the expense add input limit to 10 digits
  if (expenseDisplay.innerText.length < 11 && expenseAdd.value.length < 11) {
    let expense = Number(parseFloat(expenseAdd.value).toFixed(2));
    let date = new Date(expenseDate.value);

    // account for timezone offset in locale string
    date = new Date(
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
    ).toLocaleDateString();

    // check for valid decimal, number and date
    let decimals = expenseAdd.value.toString().split(".")[1];
    if (
      (decimals === undefined || decimals.length < 3) &&
      expenseAdd.value > 0 &&
      date != "Invalid Date"
    ) {
      if (expense) {
        // handle expenses in localStorage
        if (expenseData == null) {
          localStorage.setItem(
            "expenseData",
            JSON.stringify({ date, expense })
          );
          saveDataToDB();
        } else {
          localStorage.setItem(
            "expenseData",
            JSON.stringify([expenseData].concat({ date, expense }).flat())
          );
          saveDataToDB();
        }
        // subtract expense from balance
        let newBalance = (
          parseFloat(balanceDisplay.innerText) - expense
        ).toFixed(2);
        localStorage.setItem("balance", newBalance);
        balanceDisplay.innerText = newBalance;
        saveDataToDB();
      }
      expenseData = JSON.parse(localStorage.getItem("expenseData"));
    }
  }
  // update bars
  getBarData();
  generateTable();
}

function reset() {
  let warningOverlay = document.querySelector("#warning-overlay");
  let warning = document.querySelector("#warning-message");
  let yes = document.querySelector("#yes");
  let no = document.querySelector("#no");

  warningOverlay.style.display = "flex";
  warning.style.display = "flex";

  // handles clicking on yes and no buttons
  yes.addEventListener("click", async () => {
    localStorage.setItem("balance", "0.00");
    localStorage.setItem("expenseData", "[]");
    saveDataToDB();
    warningOverlay.style.display = "none";
    warning.style.display = "none";
    setTimeout(() => location.reload(), 1000);
  });
  no.addEventListener("click", () => {
    warningOverlay.style.display = "none";
    warning.style.display = "none";
  });
}

function generateTable() {
  let newHtml = "";
  expenseData.length > 0 &&
    (expenseData.forEach((expenseItem) => {
      newHtml += `<tr><td>$ ${expenseItem.expense}</td> <td>${expenseItem.date}</td></tr>`;
    }),
    (tableBody.innerHTML = newHtml),
    (expenseSection.style.display = "block"));
}

window.onload = getBarData();
window.onload = generateTable();
bars.forEach((bar) =>
  bar.addEventListener("mouseover", () => handleTooltip(bar))
);
bars.forEach((bar) =>
  bar.addEventListener("mouseout", () => (tooltip.style.display = "none"))
);

balanceButton.addEventListener("click", () => addBalance());
expenseButton.addEventListener("click", () => addExpense());
resetButton.addEventListener("click", () => reset());
