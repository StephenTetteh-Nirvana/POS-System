import {onAuthStateChanged,signOut} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, doc,getDoc,getDocs} from "firebase/firestore"


const products = document.querySelector(".products-container")
const InstockButton = document.querySelector(".in-stock")
const OutstockButton = document.querySelector(".out-of-stock")
const buttonsBox = document.querySelector(".products-buttons")
const displayInstock = document.querySelector(".products-inStock")
const displayOutofStock = document.querySelector(".products-OutofStock")
const productsLoader = document.querySelector(".products-loader")
const date = document.querySelector(".date")
const time = document.querySelector(".time")
const userLogout = document.querySelector("#logOut")
const categoryBox = document.querySelector(".category-box")




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
            ProductsInStock()
            ProductsOutOfStock()
        }
    })
})


buttonsBox.addEventListener("click",(e)=>{
    if(e.target.classList.contains("filter-button")){
        if(categoryBox.classList.contains("active-categoryBox")){
            categoryBox.classList.remove("active-categoryBox");
            e.target.innerText = "Choose Category"
        }else{
            categoryBox.classList.add("active-categoryBox");
            e.target.innerText = "Hide Category"
        }
       
    }
})



async function ProductsInStock(){
    productsLoader.style.display = "block"
    InstockButton.classList.add("active-item")
    const fruitsCollection = collection(db,"Fruits")
    const docRef = await getDocs(fruitsCollection)
    docRef.forEach((doc)=>{
        const product = {
            name:doc.data().Name,
            price:doc.data().Price,
            stock:doc.data().Stock
        }
        productsLoader.style.display = "none"
        displayInstock.style.display = "block";
        displayInstock.innerHTML += `
                                        <div class="product">
                                         <div>
                                         <p>${product.name}</p>
                                         </div>
                                            <div class="in-stock-box">
                                            <p>x${product.stock}</p>
                                            </div>
                                                <div class="price-box">
                                                <p>$${product.price}.00</p>
                                                </div>
                                      </div>`
  
    })
}

async function ProductsOutOfStock(){
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
        displayOutofStock.innerHTML += `
                                        <div class="product">
                                         <div>
                                         <p>${product.name}</p>
                                         </div>
                                            <div class="out-stock-box">
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
    InstockButton.classList.add("active-item")
    OutstockButton.classList.remove("active-item")
    displayInstock.style.display = "block";
    displayOutofStock.style.display = "none"
   }else if(event.target.classList.contains("out-of-stock")){
    InstockButton.classList.remove("active-item")
    OutstockButton.classList.add("active-item")
    displayInstock.style.display = "none";
    displayOutofStock.style.display = "block"
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