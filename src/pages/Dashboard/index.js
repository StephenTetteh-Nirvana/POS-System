import {onAuthStateChanged,signOut} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, doc,getDoc,getDocs} from "firebase/firestore"

const date = document.querySelector(".date")
const time = document.querySelector(".time")
const userLogout = document.querySelector("#logOut")
const users = document.querySelector("#users")
const products = document.querySelector(".products-container")
const displayProducts = document.querySelector(".products-display")
const heading = document.querySelector("#in-stock-heading")
const adminInvoice = document.querySelector(".admin-invoices")



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
     
        onAuthStateChanged(auth,(user)=>{
        if(user){
            const uid = user.uid;
            fetchDocs(uid)
            retrieveProducts()
            retrieveInvoices()
        }
    })
})


async function retrieveProducts(){
    const fruitsCollection = collection(db,"Fruits")
    const docRef = await getDocs(fruitsCollection)
    docRef.forEach((doc)=>{
        const product = {
            name:doc.data().Name,
            price:doc.data().Price,
            stock:doc.data().Stock
        }
        displayProducts.innerHTML += `
        <div class="product">
                                         <div>
                                         <p>${product.name}</p>
                                         </div>
                                            <div class="stock-box">
                                            <p>${product.stock}</p>
                                            </div>
                                                <div class="price-box">
                                                <p>$${product.price}.00</p>
                                                </div>
                                      </div>`
    })
}


products.addEventListener("click",(event)=>{
   if(event.target.classList.contains("in-stock")){
    console.log(event.target)
    heading.style.visibility = "visible";
    displayProducts.style.display = "block";
   }else if(event.target.classList.contains("out-of-stock")){
    console.log(event.target)
    heading.style.visibility = "visible";
    displayProducts.style.display = "none"
   }
})

async function retrieveInvoices(){
    const adminCollection = collection(db,"Admins")
    const cashierCollection = collection(db,"Cashiers")
    const adminDoc = await getDocs(adminCollection)
    const cashierDoc = await getDocs(cashierCollection)
    adminDoc.forEach(async (document)=>{
        const Id = document.id;
        const customerDocRef = doc(db, "Admins",Id);
        const customerCollection = collection(customerDocRef, "Customers");
        const customerDocs = await getDocs(customerCollection);
        await retrieveCustomers(customerDocs)

       
    })
    cashierDoc.forEach(async (document)=>{
        const Id = document.id;
        const customerDocRef = doc(db, "Cashiers",Id);
        const customerCollection = collection(customerDocRef, "Customers");
        const customerDocs = await getDocs(customerCollection);
        await retrieveCustomers(customerDocs)
    })
}

async function retrieveCustomers(customerDocs){
    customerDocs.forEach((customer)=>{
        const orderData = customer.data().order
        orderData.map((arr)=>{
            const Info = {
                name:arr.Name,
                price:arr.Price,
                quantity:arr.quantity
            }
            console.log(Info)
            adminInvoice.innerHTML += `<div class="invoice">
            <p>${Info.name}</p>
            <p>${customer.data().CustomerName}</p>
            <p>${customer.data().CustomerPhone}</p>
            </div>`
        })


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
