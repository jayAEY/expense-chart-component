let bars = document.querySelectorAll('.bar')
let labels = document.querySelectorAll('.label')
let tooltip = document.querySelector('#tooltip')

let balanceDisplay = document.querySelector("#balance")
balanceDisplay.innerText = localStorage.getItem("balance") || "0.00"
let balanceAdd = document.querySelector("#balance-add")
let balanceButton = document.querySelector("#balance-submit")

let expenseData = JSON.parse(localStorage.getItem("expenseData")) || []
let expenseDisplay = document.querySelector("#monthly-total")
expenseDisplay.innerText = localStorage.getItem("monthTotal") || "0.00"
let expenseAdd = document.querySelector("#expense-add")
let expenseDate = document.querySelector("#expense-date")
let expenseButton = document.querySelector("#expense-submit")

//HANDLE SPENDING DATE FOR LAST 7 DAYS
function lastWeekSpending() {
  let currentDate = new Date
  let lastWeek = []
  let lastWeekMerged = []
  
  // checks for expenses from last week and pushes them into lastWeek
  expenseData.forEach(expense => {
    for (let i = 0; i < 7; i++) {
      let compareDate = (new Date((new Date).setDate(currentDate.getDate() - i))).toLocaleDateString()
      if (expenseDate == currentDate || expense.date == compareDate) {
        lastWeek.push(expense)
      }
    }
  })

  // FIGURE OUT WHATS GOING ON WITH THIS PARSE STRINGIFY????? MIGHT BE THE += EXPENSE

  console.log(JSON.parse(JSON.stringify(lastWeek)))
  console.log(lastWeek)
  lastWeek = JSON.parse(JSON.stringify(lastWeek))

  // sorts and merges expenses according to days
  lastWeek.sort((a, b) => new Date(a.date) - new Date(b.date))
  lastWeek.forEach(expense => {
    if (lastWeekMerged.length > 0) {
      let findSameDate = lastWeekMerged.indexOf(lastWeekMerged.find((e) => e.date == expense.date))
      if (findSameDate != -1) {
        lastWeekMerged[findSameDate].expense += expense.expense
      } else {
        lastWeekMerged.push(expense)
      }
    } else if (lastWeekMerged.length == 0) {
      lastWeekMerged.push(expense)
    }
  });

  return lastWeekMerged
}


// ACCOUNT FOR MISSING DATES IN WEEK?
function getData() {
  let data = lastWeekSpending()
  let dayLabels = ["sun","mon", "tue", "wed", "thu", "fri", "sat"]
  let dayLabelsSorted = []

  // MIGHT HAVE TO ADD TIMEE OFFSET?
  // let currentDay = (new Date).getDay() - 1  
  let currentDay = (new Date).getDay()

  // changes order of day labels based on current day
  for (let i = currentDay + 1; i <= 7; i++) {
    if ( i < 7 ) {
      dayLabelsSorted.push(dayLabels[i])
    } else if ( i == 7 ) {
      for (let j = 0; j < currentDay + 1; j++) {
        dayLabelsSorted.push(dayLabels[j])
      }
    }
  }
  // changes order of day labels based on current day
  for (let i = 0; i < 7; i++) {
    labels[i].innerText = dayLabelsSorted[i]
  }
  //changes bars based on data
  console.log(data)
  bars[6].style.backgroundColor = "hsl(186, 34%, 60%)";
  for (let i = 0; i < bars.length; i++) {
    let bar = bars[i]
    let spentInDay = 0
    data[i] ? spentInDay = data[i].expense : null
    if (data[i]) {
      bar.style.dataSpent = spentInDay
      if (spentInDay > 55) {
        bar.style.height = "100%"
      } else if (spentInDay < 2) {
        bar.style.height = `3%`
      } else {
        bar.style.height = `${spentInDay * 1.8}%`
      }
    } else {
      bar.style.dataSpent = 0
      bar.style.height = `3%`
    }
  }
}

function handleTooltip(bar) {
  let barCoords = bar.getBoundingClientRect()
  tooltip.style.display = "block"
  tooltip.innerText = `$${bar.style.dataSpent}`
  tooltip.style.left = `${(barCoords.x - ((tooltip.getBoundingClientRect().width - barCoords.width) / 2))}px`
  tooltip.style.top = `${(barCoords.top) - 40}px`
}

window.onload = getData() 
bars.forEach(bar => bar.addEventListener("mouseover", () => handleTooltip(bar)))
bars.forEach(bar => bar.addEventListener("mouseout", () => tooltip.style.display = "none"))

function addBalance() {
  // checks for valid decimal
  let decimals = balanceAdd.value.toString().split(".")[1]
  let balance = balanceDisplay.innerText || 0
  if (decimals === undefined || decimals.length < 3) {
    let newBalance = (parseFloat(balance) + parseFloat(balanceAdd.value)).toFixed(2)
    balanceDisplay.innerText = newBalance
    balance = newBalance
    localStorage.setItem("balance", newBalance)
  }
}

balanceDisplay.addEventListener("change", () => balanceChange())
balanceButton.addEventListener("click", () => addBalance())

function addExpense() {
  let expense = Number(parseFloat(expenseAdd.value).toFixed(2))
  let date = new Date(expenseDate.value)
 
  // accounting for timezone offset
  date = new Date(date.setMinutes(date.getMinutes() + date.getTimezoneOffset())).toLocaleDateString()
 
  // checks for valid decimal
  let decimals = expenseAdd.value.toString().split(".")[1]
  if ((decimals === undefined || decimals.length < 3) && date) {
    if (expense) {
      // sets monthly total
      let monthTotal = (Number(localStorage.getItem("monthTotal")) + expense).toFixed(2)
      expenseDisplay.innerHTML = monthTotal
      localStorage.setItem("monthTotal", monthTotal)
      // handles expenses in localStorage
      if (expenseData == null) {
        localStorage.setItem("expenseData", JSON.stringify({ date, expense }))
      } else {
        localStorage.setItem("expenseData", JSON.stringify(([expenseData].concat({ date, expense }).flat())))
        // localStorage.setItem("expenseData", JSON.stringify([...expenseData].concat({date, expense})))
      }
    }
    // console.log(mergeSpend(lastWeek))
    // console.log(JSON.parse(localStorage.getItem("expenseData")))
    expenseData = JSON.parse(localStorage.getItem("expenseData"))
    // getData()
    // console.log(lastWeekSpending())
  }
}

expenseButton.addEventListener("click", () => addExpense())
expenseButton.addEventListener("click", () => getData())



