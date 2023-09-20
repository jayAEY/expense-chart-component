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
let currentDay = (new Date).getDay() 
// let currentDay = (new Date).getDay() - 1

let currentDate = new Date
let lastWeek = []
let lastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toLocaleDateString()

function daysInMonth(date) {
  return new Date(date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate()
}

expenseData.forEach(expense => {
  for (let i = 0; i < 7; i++) {
    let compareDate = (new Date((new Date).setDate(currentDate.getDate() - i))).toLocaleDateString()
    if (expenseDate == currentDate || expense.date == compareDate) {
      lastWeek.push(expense)
    }
  }
})

// COMBINES SPENDING FOR EACH DAY
function mergeSpend(arr) {
  let data = JSON.parse(JSON.stringify(arr))
  data.sort((a, b) => new Date(a.date) - new Date(b.date))
  let res = []
  data.forEach(expense => {
    if (res.length > 0) {
      let findSameDate = res.indexOf(res.find((e) => e.date == expense.date))
      if (findSameDate != -1) {
        res[findSameDate].expense += expense.expense
      } else {
        res.push(expense)
      }
    } else if (res.length == 0) {
      res.push(expense)
    }
  });
  return res
}

// HANDLE DAY LABELS
let newLastWeek = mergeSpend(lastWeek)
let dayLabels = ["sun","mon", "tue", "wed", "thu", "fri", "sat"]
let dayLabelsSorted = []
for (let i = currentDay + 1; i <= 7; i++) {
  if ( i < 7 ) {
    dayLabelsSorted.push(dayLabels[i])
  } else if ( i == 7 ) {
    for (let j = 0; j < currentDay + 1; j++) {
      dayLabelsSorted.push(dayLabels[j])
    }
  }
}
for (let i = 0; i < 7; i++) {
labels[i].innerText = dayLabelsSorted[i]
}

// figure out why i can only add expense after refresh!!!!!

// DISPLAY BARS ACCORDING TO DATA
function getData() {
  let data = mergeSpend(lastWeek) 
  bars[6].style.backgroundColor = "hsl(186, 34%, 60%)";
  console.log(data)
  for (let i = 0; i < bars.length; i++) {
    if (data[i]) {
      changeHeight(bars[i], data[i].expense)
    } else {
      changeHeight(bars[i],0)
    }
  }
  // bars[currentDay].style.backgroundColor = "hsl(186, 34%, 60%)";
}

function changeHeight(bar, spentInDay) {
  bar.style.dataSpent = spentInDay
  if (spentInDay > 55) {
    bar.style.height = "100%"
  } else if (spentInDay < 2){
    bar.style.height = `3%`
  } else {
    bar.style.height = `${spentInDay * 1.8}%`
  }
}

function handleTooltip(bar) {
  let barCoords = bar.getBoundingClientRect()
  tooltip.style.display = "block"
  tooltip.innerText = `$${bar.style.dataSpent}`
  tooltip.style.left = `${(barCoords.x - ((tooltip.getBoundingClientRect().width - barCoords.width) / 2))}px`
  tooltip.style.top = `${(barCoords.top) - 40}px`
}

window.onload = getData
bars.forEach(bar => bar.addEventListener("mouseover", () => handleTooltip(bar)))
bars.forEach(bar => bar.addEventListener("mouseout", () => tooltip.style.display = "none"))

// function balanceChange() {
//   let balance = Number(balanceDisplay.value).toFixed(2) || 0
//   localStorage.setItem("balance", balance)
//   balanceDisplay.value = balance
//   // console.log(balance)
//   // console.log(localStorage.getItem("balance"))
// }

function addBalance() {
  // checks for valid decimal
  let decimals = balanceAdd.value.toString().split(".")[1]
  let balance = balanceDisplay.innerText || 0
  // let balance = balanceDisplay.value || 0
  if (decimals === undefined || decimals.length < 3) {
    let newBalance = (parseFloat(balance) + parseFloat(balanceAdd.value)).toFixed(2)
    balanceDisplay.innerText = newBalance
    // balanceDisplay.value = newBalance
    balance = newBalance
    localStorage.setItem("balance", newBalance)
  }
  console.log(balance)
  console.log(localStorage.getItem("balance"))
}

balanceDisplay.addEventListener("change", () => balanceChange())
balanceButton.addEventListener("click", () => addBalance())

// not needed?????
// function expenseChange() {
//   // let monthTotal = Number(expenseDisplay.value).toFixed(2)
//   // expenseDisplay.value = monthTotal
//   // let monthTotal = Number(expenseDisplay.innerHTML).toFixed(2)
//   // expenseDisplay.innerHTML = monthTotal
//   localStorage.setItem("monthTotal", monthTotal)
//   // console.log(localStorage.getItem("monthTotal"))
// }

function addExpense() {
  // let expenseData = JSON.parse(localStorage.getItem("expenseData")) 
  let expense = Number(parseFloat(expenseAdd.value).toFixed(2))
  let date = new Date(expenseDate.value)
  //accounting for timezone offset
  date = new Date(date.setMinutes(date.getMinutes() + date.getTimezoneOffset())).toLocaleDateString()
  // checks for valid decimal
  let decimals = expenseAdd.value.toString().split(".")[1]

  if ((decimals === undefined || decimals.length < 3) && date) {
    //sets monthly total
    if (expense) {
      let monthTotal = (Number(localStorage.getItem("monthTotal")) + expense).toFixed(2)
      // expenseDisplay.value = monthTotal
      expenseDisplay.innerHTML = monthTotal
      localStorage.setItem("monthTotal", monthTotal)

      //handles expenses in localStorage
      if (expenseData == null) {
        localStorage.setItem("expenseData", JSON.stringify({ date, expense }))
      } else {
        localStorage.setItem("expenseData", JSON.stringify(([expenseData].concat({ date, expense }).flat())))
        // localStorage.setItem("expenseData", JSON.stringify([...expenseData].concat({date, expense})))
      }
      // console.log(date)
      // console.log(new Date(date.setMinutes(date.getMinutes() + date.getTimezoneOffset())).toLocaleDateString())
      // console.log(currentDate)
      console.log(monthTotal)
      // console.log(JSON.parse(localStorage.getItem("expenseData")))
    }
  }
}

// expenseDisplay.addEventListener("change", () => expenseChange())
expenseButton.addEventListener("click", () => addExpense())


