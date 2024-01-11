import { onAuthStateChanged,signOut } from "firebase/auth";
import {auth,db} from '/src/firebase.js';
import { collection,doc,getDoc,getDocs, serverTimestamp} from "firebase/firestore"

const date = document.querySelector(".date")
const time = document.querySelector(".time")
const userLogout = document.querySelector("#logOut")
const Info = document.querySelector(".order-info")
const PopUp = document.querySelector(".popup-order-summary")
const PopUpOrders = document.querySelector(".order-summary-order")
const loader = document.querySelector(".loader-box")
const bottomInfo = document.querySelector(".bottom-section")
const grandTotal = document.querySelector("#grand-total")
const customerLoader = document.querySelector(".customer-loader-box")
const users = document.querySelector("#users")
const dashboard = document.querySelector("#dashboard")
const products = document.querySelector("#products")
const paymentInfo = document.querySelector("#payment")
const billingName = document.querySelector("#billing-name")
const billingContact = document.querySelector("#billing-contact")
const billingDate = document.querySelector("#billing-date")




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
                dashboard.style.display = "none";
                products.style.display = "none";
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

 
    onAuthStateChanged(auth,(user)=>{
        if(user){
            const uid = user.uid;
            displayCustomers(uid)
            fetchDocs(uid)
            
        }
    })
})

async function displayCustomers(uid){
    customerLoader.style.display = " block"
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
                            <li>${adminDoc.data().Username}<span class="status">${adminDoc.data().Role}</span></li>
                            <button class="btn" data-id="${customer.id}">View</button>
                          </ul>
                          `
        customerLoader.style.display = "none"
    })
   
   }else if(cashierDoc.exists()){
    const customerCollection = collection(cashierCollection,"Customers");
    const snapshot = await getDocs(customerCollection)
    snapshot.forEach((customer)=>{
        const customerInfo = {
            name:customer.data().CustomerName,
            phone:customer.data().CustomerPhone,
          
        }
        paymentInfo.textContent = `${customer.payment}`
        Info.innerHTML += `<ul class="customer-info">
                           <li>${customerInfo.name}</li>
                            <li>${customerInfo.phone}</li>
                            <li>${cashierDoc.data().Username}<span class="cashier-status">${cashierDoc.data().Role}</span></li>
                            <button class="btn"  data-id="${customer.id}" >View</button>
                          </ul>`
        customerLoader.style.display = "none"
        

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
        window.location.reload()
    }else if(event.target.classList.contains("print-button")){
        window.print()
        console.log(event.target)
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
        let sum = 0;
        snapshot.forEach((customer) => {
           if(customer.id === documentId){
            console.log("id match")
            const documentInfo = {
                name : customer.data().CustomerName,
                phone : customer.data().CustomerPhone,
                payment : customer.data().paymentMethod,
                date : customer.data().createdAt
            }
            console.log(documentInfo)
            billingName.innerText += ` ${documentInfo.name}`
            billingContact.innerText += ` ${documentInfo.phone}`
            paymentInfo.innerText += ` ${documentInfo.payment}`

            const orderData = customer.data().order;
            orderData.forEach((order,index) => {
                const orderItem = {
                    name:order.Name,
                    price:order.Price,
                    image:order.Image,
                    quantity:order.quantity,
                }
                const total = orderItem.quantity * orderItem.price;
                sum += total; 
                PopUpOrders.innerHTML += `<div class="invoice">
                                                
                                            <div class="order-index">
                                            <h3>${index}</h3>
                                            </div>

                                                <div class="order-name">
                                                <h3>${orderItem.name}</h3>
                                                </div>

                                                    <div class="order-quantity">
                                                    <h3>X ${orderItem.quantity}</h3>
                                                    </div>

                                                        <div class="order-price">
                                                        <h3>$${orderItem.price}.00</h3>
                                                        </div>

                                                        
                                                        <div class="order-total">
                                                        <h3>$${total}.00</h3>
                                                        </div>

                                            </div>`
                    loader.style.display = "none"
                    bottomInfo.style.visibility = "visible"
                    grandTotal.innerText = `$ ${sum}.00`;
                    console.log(sum)
                
            })
           }else{
            console.log("no match:",customer.id)
           }
        })
       
    }else if(cashierDoc.exists()){
        const CashiercustomerCollection = collection(cashierCollection,"Customers");
        const snapshot = await getDocs(CashiercustomerCollection)
        let sum = 0;
        snapshot.forEach((customer) => {
           if(customer.id === documentId){
            console.log(documentId)
            console.log("id match")
            const documentInfo = {
                name : customer.data().CustomerName,
                phone : customer.data().CustomerPhone,
                payment : customer.data().paymentMethod,
                date : customer.data().createdAt
            }
            console.log(documentInfo)
            billingName.innerText += ` ${documentInfo.name}`
            billingContact.innerText += ` ${documentInfo.phone}`
            billingDate.innerText += ` ${documentInfo.date}`
            paymentInfo.innerText += ` ${documentInfo.payment}`


            const orderData = customer.data().order;
            console.log(orderData)
            orderData.forEach((order,index) => {
                const orderItem = {
                    name:order.Name,
                    price:order.Price,
                    image:order.Image,
                    quantity:order.quantity
                }
                const total = orderItem.quantity * orderItem.price;
                sum += total; 
                PopUpOrders.innerHTML += `<div class="invoice">
                                                
                                            <div class="order-index">
                                            <h3>${index}</h3>
                                            </div>

                                                <div class="order-name">
                                                <h3>${orderItem.name}</h3>
                                                </div>

                                                    <div class="order-quantity">
                                                    <h3>X ${orderItem.quantity}</h3>
                                                    </div>

                                                        <div class="order-price">
                                                        <h3>$${orderItem.price}.00</h3>
                                                        </div>

                                                        
                                                        <div class="order-total">
                                                        <h3>$${total}.00</h3>
                                                        </div>

                                            </div>`
                    loader.style.display = "none"
                    bottomInfo.style.visibility = "visible"
                    grandTotal.innerText = `$ ${sum}.00`;
                    console.log(sum)
            })
           }else{
            console.log("no match:",customer.id)
           }
        })
       
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