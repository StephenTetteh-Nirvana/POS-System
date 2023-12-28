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
        }
    })
})


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
