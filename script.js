let bars = document.querySelectorAll('.bar')
let tooltip = document.querySelector('#tooltip')

let balanceDisplay = document.querySelector("#balance")
let balanceAdd = document.querySelector("#balance-add")
let balanceButton = document.querySelector("#balance-submit")

let expenseData = JSON.parse(localStorage.getItem("expenseData"))
let expenseDisplay = document.querySelector("#monthly-total")
expenseDisplay.innerText = localStorage.getItem("monthTotal") || "0.00"
let expenseAdd = document.querySelector("#expense-add")
let expenseDate = document.querySelector("#expense-date")
let expenseButton = document.querySelector("#expense-submit")

//handling spending data for last 7 days
let currentDay = (new Date).getDay() - 1
// let currentDate = (new Date).toLocaleDateString()
let currentDate = new Date
// console.log(new Date(currentDate).toLocaleDateString())
let lastWeek = []

let lastMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toLocaleDateString()

function daysInMonth(date) {
  return new Date(date.getFullYear(),
                  date.getMonth() + 1,
                  0
                 ).getDate()
}

// adds all expenses from last week into lastWeek
expenseData.forEach(expense => {
    for (let i = 0; i < 7; i++) {
      let compareDate = (new Date((new Date).setDate(currentDate.getDate() - i))).toLocaleDateString()
      if (expenseDate == currentDate || expense.date == compareDate) {
       lastWeek.push(expense)
      } 
    }
 }
)

// COMBINE SPENDING IN EACH DAY

let newLastWeek = []

const mergeSpend = (arr = []) => {
  const data = arr.slice();
  // const res = []
  data.sort((a,b) => new Date(a.date) - new Date(b.date))
  data.forEach(expense => {
    if(!this[expense.date]) {
      this[expense.date] = {
        date: expense.date,
        expense: expense.expense 
      } 
      newLastWeek.push(this[expense.date])
    } 
    // console.log(this[expense.date])
    // console.log(this[expense.expense])
    // console.log(expense.expense +2)
    // console.log(this[expense.date])
    if (this[expense.date]) {
      this[expense.expense] = this[expense.expense] + expense.expense
      // this[expense.date] = Object.assign(this[expense.date], expense) 
    }
      // console.log(Object.assign(this[expense.date], expense))
      this[expense.date] = Object.assign(this[expense.date], expense)
  });
  return newLastWeek
}

mergeSpend(lastWeek)
// console.log(mergeSpend(lastWeek))
console.log(newLastWeek)
console.log(lastWeek.sort((a,b) => new Date(a.date) - new Date(b.date)))
// console.log(lastWeek.length)
console.log(expenseData)

// figure out why i can only add expense after refresh!

function changeHeight(bar, spentInDay) {
  bar.style.dataSpent = spentInDay
  if (spentInDay > 55) {
    bar.style.height = "100%"
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

async function getData() {
  let response = await fetch("./data.json");
  let data = await response.json()
  for (let i = 0; i < bars.length; i++) {
    changeHeight(bars[i], data[i].amount)
  }
  bars[currentDay].style.backgroundColor = "hsl(186, 34%, 60%)";
}

window.onload = getData
bars.forEach(bar => bar.addEventListener("mouseover", () => handleTooltip(bar)))
bars.forEach(bar => bar.addEventListener("mouseout", () => tooltip.style.display = "none"))

function balanceChange(){
  let balance = Number(balanceDisplay.value).toFixed(2) || 0
  localStorage.setItem("balance", balance)
  balanceDisplay.value = balance
  // console.log(balance)
  // console.log(localStorage.getItem("balance"))
}

function addBalance() {  
  // checks for valid decimal
  let decimals = balanceAdd.value.toString().split(".")[1]
  let balance = balanceDisplay.value || 0
  if ( decimals === undefined || decimals.length < 3 ) { 
    let newBalance = (parseFloat(balance) + parseFloat(balanceAdd.value)).toFixed(2)
    balanceDisplay.value = newBalance
    balance = newBalance
    localStorage.setItem("balance", newBalance)
  }
  // console.log(balance)
  // console.log(localStorage.getItem("balance"))
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

  if ((decimals === undefined || decimals.length < 3) && date){
      //sets monthly total
      if (expense) {
        let monthTotal = (Number(localStorage.getItem("monthTotal")) + expense).toFixed(2)
        // expenseDisplay.value = monthTotal
        expenseDisplay.innerHTML = monthTotal
        localStorage.setItem("monthTotal", monthTotal)
      //handles expenses in localStorage
      if (expenseData == null ) {
        localStorage.setItem("expenseData", JSON.stringify({date, expense}))
      } else {
        localStorage.setItem("expenseData", JSON.stringify(([expenseData].concat({date, expense}).flat())))
        // localStorage.setItem("expenseData", JSON.stringify([...expenseData].concat({date, expense})))
      }

      // console.log(date)
      // console.log(new Date(date.setMinutes(date.getMinutes() + date.getTimezoneOffset())).toLocaleDateString())
    
      // console.log(currentDate)

      // console.log(monthTotal)
    console.log(expenseData)
      }
  } 
}

// expenseDisplay.addEventListener("change", () => expenseChange())
expenseButton.addEventListener("click", () => addExpense())


