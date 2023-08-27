let currentDay = (new Date).getDay() - 1
let bars = document.querySelectorAll('.bar')
let tooltip = document.querySelector('#tooltip')

let balanceDisplay = document.querySelector("#balance")
let balanceAdd = document.querySelector("#balance-add")
let balanceButton = document.querySelector("#balance-submit")

let expenseDisplay = document.querySelector("#monthly-total")
let expenseAdd = document.querySelector("#expense-add")
let expenseDate = document.querySelector("#expense-date")
let expenseButton = document.querySelector("#expense-submit")


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

function expenseChange() {
  let monthTotal = Number(expenseDisplay.value).toFixed(2)
  expenseDisplay.value = monthTotal
  localStorage.setItem("monthTotal", monthTotal)
  // console.log(localStorage.getItem("monthTotal"))
}

function addExpense() {
  let expenseData = JSON.parse(localStorage.getItem("expenseData")) 
  let expense = Number(parseFloat(expenseAdd.value).toFixed(2))
  let date = expenseDate.value
  // checks for valid decimal
  let decimals = expenseAdd.value.toString().split(".")[1]

  if ((decimals === undefined || decimals.length < 3) && date){
    //sets monthly total
    let monthTotal = (Number(localStorage.getItem("monthTotal")) + expense).toFixed(2)
    expenseDisplay.value = monthTotal
    localStorage.setItem("monthTotal", monthTotal)
    //handles expenses in localStorage
    if (expenseData == null ) {
      localStorage.setItem("expenseData", JSON.stringify({date, expense}))
    } else {
      // console.log([expenseData])
      localStorage.setItem("expenseData", JSON.stringify([...expenseData].concat({date, expense})))
    }

    // console.log()
    // console.log(monthTotal)
    console.log(expenseData)
  } 
}

expenseDisplay.addEventListener("change", () => expenseChange())
expenseButton.addEventListener("click", () => addExpense())

