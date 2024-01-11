import {onAuthStateChanged,signOut} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, doc,getDoc,getDocs} from "firebase/firestore"

const date = document.querySelector(".date")
const time = document.querySelector(".time")
const userLogout = document.querySelector("#logOut")
const users = document.querySelector("#users")
const cashierBox = document.querySelector(".best-cashiers-box")




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

    async function fetchDocs(uid){
        try{
            const cashierCollection = doc(db,"Cashiers",uid);
            const cashierDoc = await getDoc(cashierCollection);
           if(cashierDoc.exists()){
              const user = cashierDoc.data()
              if(user.Role === "Cashier"){
                users.style.display = "none";
              }
            }
            else{
                console.log("user doc does not exist")
            }

        }
        catch(error){
            console.log(error)
        }
    }

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
            fetchDocs(uid)
            retrieveCashiers()
            loadCashiers()
        }
    })
})


async function retrieveCashiers(){
     const cashierCollection = collection(db,"Cashiers")
     const colRef = await getDocs(cashierCollection)
     colRef.forEach(async (document)=>{
        const Id = document.id;
        const customerCollection = collection(doc(db, "Cashiers", Id), "Customers");
        const docRef = await getDocs(customerCollection);
        console.log(Id,docRef.size)
        await loadCashiers(Id,docRef)
         })
}

async function loadCashiers(Id, docRef) {
    const highestNumber = 1;

    if (docRef.size > highestNumber) {
        const colRef = doc(db, "Cashiers", Id);
        const colDoc = await getDoc(colRef);

        cashierBox.innerHTML += `<div class="best-cashier">
                                    <div class="selling-cashier-firstBox">
                                        <p><ion-icon class="cashier-icon" name="person-circle"></ion-icon></p>
                                        <div class="firstBox-info">
                                            <p class="name">${colDoc.data().Username}</p>
                                            <p class="customer">No. Of Orders : ${docRef.size}</p>
                                        </div>
                                    </div>
                                    <div class="selling-cashier-secondBox">
                                        <p><ion-icon class="highest-cashier" name="swap-vertical"></ion-icon></p>
                                    </div>
                                </div>`;
    }
}


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
