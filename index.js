const timeDisplay = document.querySelector(".time-display")
const date = document.querySelector(".date")
const time = document.querySelector(".time")

document.addEventListener("DOMContentLoaded",function(){
    function updateClock(){
        let currentTime = new Date();
        let hours = currentTime.getHours()
        let minutes = currentTime.getMinutes()
        let seconds = currentTime.getSeconds()
        let ampm = hours >= 12 ? 'PM' : 'AM'
        let updatedTime = `${hours}:${minutes}:${seconds} ${ampm}`;


        time.textContent = updatedTime;
        date.textContent = currentTime.toDateString()
    }
    updateClock()
    
    setInterval(updateClock,1000)
})


