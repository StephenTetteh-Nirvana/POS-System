import {db} from "/src/firebase"
import {getDocs,doc, collection} from "firebase/firestore"


const date = document.querySelector(".date")
const time = document.querySelector(".time")
const userDisplay = document.querySelector(".display-users")
const status = document.querySelector(".Status")


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
    }
    updateClock()
    setInterval(updateClock,1000)

    async function displayUsers() {
        try {
            const adminDoc = collection(db, "Admins");
            const cashierDoc = collection(db, "Cashiers");
            const admin = await getDocs(adminDoc);
            const cashier = await getDocs(cashierDoc);
    
            admin.docs.forEach((document) => {
                if(document.data().Role === "Admin"){
                    userDisplay.innerHTML += `<div class="display-users">
                                                    <li class="user">
                                                        <p>${document.data().Username}</p>
                                                        <p class="Status">${document.data().Role}</p>
                                                        <p><ion-icon class="user-delete" name="trash"></ion-icon></p>
                                                    </li>
                                                </div>`
                }
               
            });
            cashier.docs.forEach((document) => {
                if(document.data().Role === "Cashier"){
                    userDisplay.innerHTML += `<div class="display-users">
                                                    <li class="user">
                                                        <p>${document.data().Username}</p>
                                                        <p class="Status">${document.data().Role}</p>
                                                        <p><ion-icon class="user-delete" name="trash"></ion-icon></p>
                                                    </li>
                                               </div>`

                }
            });
        } catch (error) {
            console.log(error);
        }
    }
    displayUsers()

    
})