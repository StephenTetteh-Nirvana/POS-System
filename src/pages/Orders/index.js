import { onAuthStateChanged,signOut } from "firebase/auth";
import {auth,db} from '/src/firebase.js';
import { collection,doc,getDoc,getDocs} from "firebase/firestore"

const date = document.querySelector(".date")
const time = document.querySelector(".time")
const userLogout = document.querySelector("#logOut")
const Info = document.querySelector(".order-info")
const PopUp = document.querySelector(".popup-order-summary")
const PopUpOrders = document.querySelector(".order-summary-order")
const loader = document.querySelector(".loader-box")
const bottomInfo = document.querySelector(".bottom-section")


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

    onAuthStateChanged(auth,(user)=>{
        if(user){
            const uid = user.uid;
            displayCustomers(uid)
            
        }
    })
})

async function displayCustomers(uid){
   const adminCollection = doc(db,"Admins",uid)
   const cashierCollection = doc(db,"Cashiers",uid)
   const adminDoc = await getDoc(adminCollection)
   const cashierDoc = await getDoc(cashierCollection)


   if(adminDoc.exists()){
    const customerCollection = collection(adminCollection,"Customers");
    const snapshot = await getDocs(customerCollection)
    snapshot.forEach((customer)=>{
        const customerInfo = {
            id:customer.id,
            name:customer.data().CustomerName,
            phone:customer.data().CustomerPhone,
        }
        console.log(customerInfo)
        Info.innerHTML += `<ul class="customer-info">
                            <li>${customerInfo.name}</li>
                            <li>${customerInfo.phone}</li>
                            <li>${adminDoc.data().Username}<span class="status">(${adminDoc.data().Role})</span></li>
                            <button class="btn" data-id="${customer.id}">View</button>
                          </ul>
                          `
    })
   
   }else if(cashierDoc.exists()){
    const customerCollection = collection(cashierCollection,"Customers");
    const snapshot = await getDocs(customerCollection)
    snapshot.forEach((customer)=>{
        const customerInfo = {
            name:customer.data().CustomerName,
            phone:customer.data().CustomerPhone,
        }
        console.log(customerInfo)
        Info.innerHTML += `<ul class="customer-info">
                            <li>${customerInfo.name}</li>
                            <li>${customerInfo.phone}</li>
                            <li>${cashierDoc.data().Username}<span class="status">(${cashierDoc.data().Role})</span></li>
                            <button class="btn">View</button>
                          </ul>
                          `
    })
   }

}

Info.addEventListener("click",(event)=>{
    if(event.target.classList.contains("btn")){
        console.log(event.target)
        const documentId = event.target.dataset.id;
        onAuthStateChanged(auth,(user)=>{
            if(user){
                const uid = user.uid;
                displayOrders(uid,documentId)
            }
        })
    }
})

PopUp.addEventListener("click",(event)=>{
    if(event.target.classList.contains("close")){
        PopUp.style.display = "none"
    }
})


async function displayOrders(uid,documentId){
    PopUp.style.display = "block"
    loader.style.display = "block"
    const adminCollection = doc(db,"Admins",uid)
    const cashierCollection = doc(db,"Cashiers",uid)
    const adminDoc = await getDoc(adminCollection)
    const cashierDoc = await getDoc(cashierCollection)

    if(adminDoc.exists()){
        const customerCollection = collection(adminCollection,"Customers");
        const snapshot = await getDocs(customerCollection)
        snapshot.forEach((customer) => {
           if(customer.id === documentId){
            console.log("id match")
            const orderData = customer.data().order;
            orderData.forEach((order) => {
                const orderItem = {
                    name:order.Name,
                    price:order.Price,
                    image:order.Image,
                    quantity:order.quantity
                }
                console.log(orderItem.image)
                PopUpOrders.innerHTML += `<div class="order">

                                            <div class="order-image-box">
                                            <img src="${orderItem.image}"/>
                                            </div>
                                                <div>
                                                <h3>${orderItem.name}</h3>
                                                </div>

                                                    <div>
                                                    <h3>${orderItem.quantity} piece(s)</h3>
                                                    </div>

                                                        <div>
                                                        <h3>${orderItem.price}.00</h3>
                                                        </div>

                                            </div>`
                    loader.style.display = "none"
                    bottomInfo.style.display = "block"
                
            })
           }else{
            console.log("no match:",customer.id)
           }
        })
       


        
    }else if(cashierDoc.exists()){
        const customerCollection = collection(adminCollection,"Customers");
        const snapshot = await getDocs(customerCollection)
        console.log(snapshot)
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