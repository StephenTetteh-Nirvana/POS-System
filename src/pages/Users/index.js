import {onAuthStateChanged,signOut } from "firebase/auth"
import {db,auth} from "/src/firebase"
import {getDocs,deleteDoc,doc,collection,getDoc} from "firebase/firestore"


const date = document.querySelector(".date")
const time = document.querySelector(".time")
const userDisplay = document.querySelector(".display-users")
const findCashier = document.querySelector(".find-cashier-box button")
const popUp = document.querySelector(".find-cashier-popup")
const closePopUp = document.querySelector(".removePop")
const form = document.querySelector(".form")
const userLogout = document.querySelector("#logOut")
const loadingUsers = document.querySelector(".loader-box")


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

   async function returnToHome(uid){
        const adminCollection = doc(db,"Admins",uid);
        const adminDoc = await getDoc(adminCollection);
        const cashierCollection = doc(db,"Cashiers",uid);
        const cashierDoc = await getDoc(cashierCollection);
        if(cashierDoc.exists()){
            window.location.href = "/dist/index.html";
        }else if(adminDoc.exists()){
            console.log("admin is allowed")
        }
        else{
            window.location.href = "/dist/index.html";
             
        }
    }
    onAuthStateChanged(auth,(user)=>{
        if(user){
            const uid = user.uid;
          returnToHome(uid)
        }
         
    })


    async function displayUsers() {
        loadingUsers.style.display = "block"
        try {
            const adminDoc = collection(db, "Admins");
            const cashierDoc = collection(db, "Cashiers");
            const admin = await getDocs(adminDoc);
            const cashier = await getDocs(cashierDoc);

            admin.docs.forEach((document) => {
                if(document.data().Role === "Admin"){
                    loadingUsers.style.display = "none"
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
                    loadingUsers.style.display = "none"
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


        function logOut(){
            signOut(auth)
          .then(()=>{
           console.log("logged out")
           window.location.href = "/src/pages/Login/login.html"
          })
          .catch((error)=>{
             console.log(error)
          })
       }
   
       userLogout.addEventListener("click",()=>{
         logOut()
       })