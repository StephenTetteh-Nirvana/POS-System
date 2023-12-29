import {onAuthStateChanged,signOut} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, doc,getDoc,getDocs} from "firebase/firestore"

const date = document.querySelector(".date")
const time = document.querySelector(".time")
const userLogout = document.querySelector("#logOut")
const users = document.querySelector("#users")
const products = document.querySelector(".products-container")
const InstockButton = document.querySelector(".in-stock")
const OutstockButton = document.querySelector(".out-of-stock")
const displayProducts = document.querySelector(".products-display")
const heading = document.querySelector("#in-stock-heading")
const productsLoader = document.querySelector(".products-loader")
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
            retrieveProducts()
            retrieveCashiers()
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
                                            <p class="customer">No. Of Customers : ${docRef.size}</p>
                                        </div>
                                    </div>
                                    <div class="selling-cashier-secondBox">
                                        <p><ion-icon class="highest-cashier" name="swap-vertical"></ion-icon></p>
                                    </div>
                                </div>`;
    }
}


async function retrieveProducts(){
    productsLoader.style.display = "block"
    const fruitsCollection = collection(db,"Fruits")
    const docRef = await getDocs(fruitsCollection)
    docRef.forEach((doc)=>{
        const product = {
            name:doc.data().Name,
            price:doc.data().Price,
            stock:doc.data().Stock
        }
        productsLoader.style.display = "none"
        displayProducts.innerHTML += `
        <div class="product">
                                         <div>
                                         <p>${product.name}</p>
                                         </div>
                                            <div class="stock-box">
                                            <p>x ${product.stock}</p>
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
    displayProducts.style.display = "block";
   }else if(event.target.classList.contains("out-of-stock")){
    console.log(event.target)
    displayProducts.style.visibility = "none"
   }
   if(event.target.classList.contains("view-products-button")){
        if (event.target.innerText === "Hide Products"){
            event.target.innerText = "View Products"
            displayProducts.style.display = "none"
            heading.style.visibility = "hidden"
            InstockButton.style.visibility = "hidden"
            OutstockButton.style.visibility = "hidden"
        }else if(event.target.innerText === "View Products"){
        event.target.innerText = "Hide Products"
        displayProducts.style.display = "block"
        heading.style.visibility = "visible"
        InstockButton.style.visibility = "visible"
        OutstockButton.style.visibility = "visible"
        }
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
