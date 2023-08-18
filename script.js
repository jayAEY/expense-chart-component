let currentDay = (new Date).getDay() - 1
let bars = document.querySelectorAll('.bar')
let tooltip = document.querySelector('#tooltip')

let balanceDisplay = document.querySelector("#balance")
let balance = balanceDisplay.value || 0
let balanceAdd = document.querySelector("#balance-add")
let balanceButton = document.querySelector("#balance-submit")

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



// let expense

// localStorage.setItem("expense", expense)

function balanceChange(){
  balance = balanceDisplay.value
  localStorage.setItem("balance", balance)
  // console.log(balance)
  // console.log(localStorage.getItem("balance"))
}

function addbalance() {
  let newBalance = (parseFloat(balance)+parseFloat(balanceAdd.value)).toFixed(2)
  balanceDisplay.value = newBalance
  balance = newBalance
  localStorage.setItem("balance", newBalance)
  // console.log(balance)
  // console.log(localStorage.getItem("balance"))
}

balanceDisplay.addEventListener("change", () => balanceChange())
balanceButton.addEventListener("click", () => addbalance())
