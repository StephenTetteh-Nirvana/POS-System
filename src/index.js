import { db } from "./firebase.js"
import {collection,getDocs} from "firebase/firestore"

const timeDisplay = document.querySelector(".time-display")
const date = document.querySelector(".date")
const time = document.querySelector(".time")
const username = document.querySelector(".username span")

document.addEventListener("DOMContentLoaded",function(){
    function updateClock(){
        let currentTime = new Date();
        let hours = currentTime.getHours()
        let minutes = currentTime.getMinutes()
        let seconds = currentTime.getSeconds()
        let ampm = hours >= 12 ? 'PM' : 'AM'
        let updatedTime = `${hours}:${minutes < 10 ? '0':''}${minutes}:${seconds < 10 ? '0':''}${seconds} ${ampm}`;
        
        time.textContent = updatedTime;
        date.textContent = currentTime.toDateString()

        if(ampm === 'AM'){
            username.innerText = "Good Morning,"
        }else if(ampm === 'PM' && hours === 12 && 13 && 14 && 15){
            username.innerText = "Good Afternoon,"
            console.log("afternoon")
        }else{
            username.innerText = "Good Evening,"
            console.log("evening")
        }

    }
    updateClock()
    
    setInterval(updateClock,1000)
})
  const col = collection(db,"NAMES")

getDocs(col).then(data =>{
    data.docs.forEach((document)=>{
           console.log(document.data())
    })
})

