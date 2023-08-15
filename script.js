let currentDay = (new Date).getDay() - 1
let bars = document.querySelectorAll('.bar')
let tooltip = document.querySelector('#tooltip')

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
