//CHECK ALL FEATURES
// - adding to balance 
// - adding expenses 
// - subtracting expenses from balance
// - displaying last week data properly (check for timezone offset?)
// - speding increase month to month
// - ensure all displayed data matches localStorage

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

function getBarData() {
  let data = lastWeekSpending()
  let dayLabels = ["sun","mon", "tue", "wed", "thu", "fri", "sat"]
  let dayLabelsSorted = []

  // MIGHT HAVE TO ADD TIMEE OFFSET?
  // let currentDay = (new Date).getDay() - 1  
  let currentDay = (new Date).getDay()

  // change order of day labels based on current day
  for (let i = currentDay + 1; i <= 7; i++) {
    if ( i < 7 ) {
      dayLabelsSorted.push(dayLabels[i])
    } else if ( i == 7 ) {
      for (let j = 0; j < currentDay + 1; j++) {
        dayLabelsSorted.push(dayLabels[j])
      }
    }
  }
  // change order of day labels based on current day
  for (let i = 0; i < 7; i++) {
    labels[i].innerText = dayLabelsSorted[i]
  }
  //change bars based on data
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

function lastWeekSpending() {
  let currentDate = new Date
  let lastWeek = []
  let lastWeekMerged = []

  // adds blank expenses for each day in last week to display bars properly
  for (let i = 0; i < 7; i++) {
    let compareDate = (new Date((new Date).setDate(currentDate.getDate() - i))).toLocaleDateString()
    lastWeek.push({ date : compareDate, expense : 0 })
  }

  // check for expenses from last week and pushes them into lastWeek
  expenseData.forEach(expense => {
    for (let i = 0; i < 7; i++) {
      let compareDate = (new Date((new Date).setDate(currentDate.getDate() - i))).toLocaleDateString()
      if (expenseDate == currentDate || expense.date == compareDate) {
        lastWeek.push(expense)
      }
    }
  })

  // FIGURE OUT WHATS GOING ON WITH THIS PARSE STRINGIFY????? MIGHT BE THE += EXPENSE
  lastWeek = JSON.parse(JSON.stringify(lastWeek))

  // sort and merge expenses according to days
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

function handleTooltip(bar) {
  let barCoords = bar.getBoundingClientRect()
  tooltip.style.display = "block"
  tooltip.innerText = `$${bar.style.dataSpent}`
  tooltip.style.left = `${(barCoords.x - ((tooltip.getBoundingClientRect().width - barCoords.width) / 2))}px`
  tooltip.style.top = `${(barCoords.top) - 40}px`
}

function monthToMonth() {
  
}

function addBalance() {
  // check for valid decimal
  let decimals = balanceAdd.value.toString().split(".")[1]
  let balance = balanceDisplay.innerText
  // let balance = balanceDisplay.innerText || 0
  if (decimals === undefined || decimals.length < 3) {
    let newBalance = (parseFloat(balance) + parseFloat(balanceAdd.value)).toFixed(2)
    balanceDisplay.innerText = newBalance
    balance = newBalance
    localStorage.setItem("balance", newBalance)
  }
}

function addExpense() {
  let expense = Number(parseFloat(expenseAdd.value).toFixed(2))
  let date = new Date(expenseDate.value)
 
  // account for timezone offset
  date = new Date(date.setMinutes(date.getMinutes() + date.getTimezoneOffset())).toLocaleDateString()
 
  // check for valid decimal
  let decimals = expenseAdd.value.toString().split(".")[1]
  if ((decimals === undefined || decimals.length < 3) && date) {
    if (expense) {
      // set monthly total
      let monthTotal = (Number(localStorage.getItem("monthTotal")) + expense).toFixed(2)
      expenseDisplay.innerHTML = monthTotal
      localStorage.setItem("monthTotal", monthTotal)
      // handle expenses in localStorage
      if (expenseData == null) {
        localStorage.setItem("expenseData", JSON.stringify({ date, expense }))
      } else {
        localStorage.setItem("expenseData", JSON.stringify(([expenseData].concat({ date, expense }).flat())))
      }
      // subtract expense from balance
      let newBalance = (parseFloat(balanceDisplay.innerText) - expense).toFixed(2)
      localStorage.setItem("balance", newBalance )
      balanceDisplay.innerText = newBalance
    }
    expenseData = JSON.parse(localStorage.getItem("expenseData"))
  }
}

window.onload = getBarData() 
bars.forEach(bar => bar.addEventListener("mouseover", () => handleTooltip(bar)))
bars.forEach(bar => bar.addEventListener("mouseout", () => tooltip.style.display = "none"))
balanceDisplay.addEventListener("change", () => balanceChange())
balanceButton.addEventListener("click", () => addBalance())
expenseButton.addEventListener("click", () => addExpense())
expenseButton.addEventListener("click", () => getBarData())



