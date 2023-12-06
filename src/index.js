import {onAuthStateChanged,signOut} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, doc,getDoc,getDocs, updateDoc} from "firebase/firestore"

const fruits = [];


const date = document.querySelector(".date")
const time = document.querySelector(".time")
const username = document.querySelector(".username")
const userRole = document.querySelector(".user-role")
const role = document.querySelector(".role")
const userStatus = document.querySelector(".user-status")
const userLogout = document.querySelector("#logOut")
const users = document.querySelector("#users")
const fruitsDisplay = document.querySelector(".fruits-section")


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

        if(ampm === 'AM'){
            username.innerText = "Good Morning,"
        }else if(ampm === 'PM' && hours >= 12 && hours <= 16){
            username.innerText = "Good Afternoon,"
        }else{
            username.innerText = "Good Evening,"
        }

    }
    updateClock()
    setInterval(updateClock,1000)

    async function fetchDocs(uid){
        try{
            const adminCollection = doc(db,"Admins",uid);
            const cashierCollection = doc(db,"Cashiers",uid);
            const adminDoc = await getDoc(adminCollection);
            const cashierDoc = await getDoc(cashierCollection);
            
            if(adminDoc.exists()){
              const user = adminDoc.data()
              userRole.classList.add("admin")
              role.innerText = user.Role;
              username.innerText = user.Role;
              userStatus.innerText = user.Username;
            }else if(cashierDoc.exists()){
              const user = cashierDoc.data()
              if(user.Role === "Cashier"){
                users.style.display = "none";
              }
              userRole.classList.add("cashier")
                role.innerText = user.Role;
                username.innerText = user.Role;
                userStatus.innerText = user.Username;
            }
            else{
                console.log("user doc does not exist")
            }

        }
        catch(error){
            
        }
    }
     
        onAuthStateChanged(auth,(user)=>{
        if(user){
            const uid = user.uid;
            fetchDocs(uid)
        }else{
            console.log("no-user")
            window.location.href = "/src/pages/Login/login.html"

        }
        })

    fetchDocs() 


    displayFruits()
       
})

async function displayFruits(){
    const fruitsCollection = collection(db,"Fruits")
    const snapshot = await getDocs(fruitsCollection)
    snapshot.forEach((fruit)=>{
         const singleFruit = {
             id:fruit.id,
             name: fruit.data().Name,
             imagePath:fruit.data().Img,
             price:fruit.data().Price
         }
         fruits.push(singleFruit)
         fruitsDisplay.innerHTML += `<div class="fruit">
                                             <div class="fruit-image-box">
                                                <img class="fruit-img" src="${singleFruit.imagePath}"/>
                                             </div>
                                             <div class="fruit-info">
                                                 <p class="fruit-name">${singleFruit.name}</p>
                                                 <p class="fruit-price">${singleFruit.price}.00</p>
                                             </div>
                                             <div class="button-box">
                                             <button class="btn" data-name="${singleFruit.name}" data-image="${singleFruit.imagePath}" data-price="${singleFruit.price}" data-id="${singleFruit.id}"><ion-icon name="cart" class="cart"></ion-icon></button>
                                             </div>
                                       </div>`
                                       

    })

  

   
}

async function addToCart(uid,fruit){
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);

   if(adminDoc.exists()){
    const cartArray = adminDoc.data().cart;
    cartArray.push(fruit)
    await updateDoc(cashierCollection,{cart:cartArray})
    console.log("updated")
    console.log(cartArray)
   }else if(cashierDoc.exists()){
    const cartArray = cashierDoc.data().cart;
    cartArray.push(fruit)
    await updateDoc(cashierCollection,{cart:cartArray})
    console.log("updated")
    console.log(cartArray)
   }
}

fruitsDisplay.addEventListener("click",(event)=>{
    if(event.target.classList.contains("cart")){
        const eachFruit = event.target;
        const fruit = {
            Id:eachFruit.parentElement.dataset.id,
            Name:eachFruit.parentElement.dataset.name,
            Price:eachFruit.parentElement.dataset.price,
            Image:eachFruit.parentElement.dataset.image,
        }
        console.log(fruit)
        onAuthStateChanged(auth,(user)=>{
            if(user){
                const uid = user.uid;
                addToCart(uid,fruit)
            }
         
        })

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
