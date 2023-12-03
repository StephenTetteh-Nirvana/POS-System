import {onAuthStateChanged } from "firebase/auth"
import {db,auth} from "/src/firebase"
import {getDocs,deleteDoc,doc,collection} from "firebase/firestore"


const date = document.querySelector(".date")
const time = document.querySelector(".time")
const userDisplay = document.querySelector(".display-users")
const findCashier = document.querySelector(".find-cashier-box button")
const popUp = document.querySelector(".find-cashier-popup")
const closePopUp = document.querySelector(".removePop")
const form = document.querySelector(".form")


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
                                                    <li class="user ">
                                                        <p>${document.data().Username}</p>
                                                        <p class="Status admin">${document.data().Role}</p>
                                                    </li>
                                                </div>`
                }
               
            });
            cashier.docs.forEach((document) => {
                if(document.data().Role === "Cashier"){
                    userDisplay.innerHTML += `<div class="display-users" >
                                                    <li class="user">
                                                        <p>${document.data().Username}</p>
                                                        <p class="Status cashier">${document.data().Role}</p>
                                                        <p  data-document-id="${document.id}"><ion-icon class="user-delete" name="trash"></ion-icon></p>
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


form.addEventListener("submit",(event)=>{
    event.preventDefault();
})

findCashier.addEventListener("click",()=>{
    popUp.style.display = "block"
})
closePopUp.addEventListener("click",()=>{
    popUp.style.display = "none";
})


      async function deleteCashier(DomId){
        const cashierCollection = collection(db,"Cashiers")
        const cashiers = await getDocs(cashierCollection)
        cashiers.forEach((document)=>{
           if(document.id === DomId){
            deleteDoc(doc(db,"Cashiers",document.id))
            .then(()=>{
                console.log("Id matches",DomId)
                console.log("document deleted",document.id)
            })
            .catch((error)=>{
                console.log(error)
            })
           
           }

        })
       }

       function removeFromDOM(event){
        const parentTag = event.target.closest('p')
                const mainTag = parentTag.closest('.display-users')
                if (mainTag) {
                    mainTag.remove()
                    console.log(mainTag);
                } else {
                    console.error("Grandparent div not found");
                }
       }
        userDisplay.addEventListener("click",(event)=>{
            if(event.target.classList.contains("user-delete")){
                const DomId = event.target.parentElement.dataset.documentId;
                deleteCashier(event,DomId)
                removeFromDOM(event)
            }
            
        })
