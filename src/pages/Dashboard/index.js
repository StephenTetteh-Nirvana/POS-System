import {onAuthStateChanged,signOut} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, doc,getDoc,getDocs} from "firebase/firestore"

const date = document.querySelector(".date")
const time = document.querySelector(".time")
const userLogout = document.querySelector("#logOut")
const users = document.querySelector("#users")
const TotalOrders = document.querySelector("#total-orders")
const TotalCustomers = document.querySelector("#total-customers")
const cashierBox = document.querySelector(".best-cashiers-box")

let allOrders = 0;
let allCustomers = 0;

const localUserRole = localStorage.getItem("user") !== null ? JSON.parse(localStorage.getItem("user")) : ""
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

    async function fetchDocs(){
        if(localUserRole === "Cashier"){
           users.style.display = "none";
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
            totalOrders()
            totalCustomers()

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

async function totalOrders(){
    const adminCollection = collection(db,"Admins");
    const cashierCollection = collection(db,"Cashiers")
    const adminDocs = await getDocs(adminCollection)
    const cashierDocs = await getDocs(cashierCollection)

    adminDocs.forEach(async(document)=>{
        const Id = document.id;
        const customerCollection = collection(doc(db, "Admins", Id), "Customers");
        const snapshot = await getDocs(customerCollection)

        snapshot.forEach((snap)=>{
            allOrders += snap.data().order.length
        })
    })

    
    cashierDocs.forEach(async(document)=>{
        const Id = document.id;
        const customerCollection = collection(doc(db, "Cashiers", Id), "Customers");
        const snapshot = await getDocs(customerCollection)

        snapshot.forEach((snap)=>{
            allOrders += snap.data().order.length
        })

        console.log("total orders",allOrders);
        TotalOrders.innerText = allOrders;
    })

}

async function totalCustomers(){
    const adminCollection = collection(db,"Admins");
    const cashierCollection = collection(db,"Cashiers")
    const adminDocs = await getDocs(adminCollection)
    const cashierDocs = await getDocs(cashierCollection)

    adminDocs.forEach(async(document)=>{
        const Id = document.id;
        const customerCollection = collection(doc(db, "Admins", Id), "Customers");
        const snapshot = await getDocs(customerCollection)
        console.log("admin cutomers",snapshot.size)
        allCustomers += snapshot.size;
    })

    
    cashierDocs.forEach(async(document)=>{
        const Id = document.id;
        const customerCollection = collection(doc(db, "Cashiers", Id), "Customers");
        const snapshot = await getDocs(customerCollection)
        console.log("cashier cutomers",snapshot.size)
        allCustomers += snapshot.size;
        console.log("total customers",allCustomers)
        TotalCustomers.innerText = allCustomers;
    })

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
