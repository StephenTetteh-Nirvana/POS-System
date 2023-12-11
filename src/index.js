import {onAuthStateChanged,signOut} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, doc,getDoc,getDocs, updateDoc} from "firebase/firestore"

const fruits = [];
const cart = [];


const date = document.querySelector(".date")
const time = document.querySelector(".time")
const username = document.querySelector(".username")
const userRole = document.querySelector(".user-role")
const role = document.querySelector(".role")
const userStatus = document.querySelector(".user-status")
const userLogout = document.querySelector("#logOut")
const users = document.querySelector("#users")
const fruitsDisplay = document.querySelector(".fruits-section")
const loader = document.querySelector(".loader-box")
const noOrders = document.querySelector(".no-orders-alert")
const orders = document.querySelector(".orders-alert")
const clearAllOrders = document.querySelector(".clear-all-orders")
const loadingOrder = document.querySelector(".loading-order-box")
const Total = document.querySelector(".total span")


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
              console.log("cashier logged in",uid)
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
            checkCart(uid)
            loadCart(uid)
            totalAmount(uid)
        }else{
            console.log("no-user")
            window.location.href = "/src/pages/Login/login.html"

        }
        }) 
    displayFruits()

       
})


async function totalAmount(uid){
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);

    if(adminDoc.exists()){
        const cartData = adminDoc.data().cart;
        let sum = 0;
        cartData.forEach((product)=>{
            const price = product.Price;
            const quantity = product.quantity;
            const total = price*quantity;
            sum += total; 
        })
        console.log(sum)
        Total.innerText = `$${sum}.00`;
    }else if(cashierDoc.exists()){
        const cartData = cashierDoc.data().cart;
        let sum = 0;
        cartData.forEach((product)=>{
            const price = product.Price;
            const quantity = product.quantity;
            const total = price*quantity;
            sum += total; 
        })
        console.log(sum)
        Total.innerText = `$${sum}.00`;

    }
    
 }

 

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
    loader.style.display = "block" 
    fruitsDisplay.style.opacity = "0.5"
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);

    try{  
        if(adminDoc.exists()){
            const cartArray = adminDoc.data().cart;
            cartArray.push(fruit)
            await updateDoc(adminCollection,{cart:cartArray})
            .then(()=>{
                window.location.reload()
                loader.style.display = "none" 
                console.log("updated")
                console.log(cartArray)
            })
        }else if(cashierDoc.exists()){
            const cartArray = cashierDoc.data().cart;
            cartArray.push(fruit)
            await updateDoc(cashierCollection,{cart:cartArray})
            .then(()=>{
                window.location.reload()
                loader.style.display = "none" 
                console.log("updated")
                console.log(cartArray)
            })
        }
    }
    catch(error){
        console.log(error)
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
            quantity:1
        }
        onAuthStateChanged(auth,(user)=>{
            if(user){
                const uid = user.uid;
                addToCart(uid,fruit)
            }
         
        })

    }
 })


 async function checkCart(uid){
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);

    if(adminDoc.exists()){
        const cartData = adminDoc.data().cart;
        if(cartData.length === 0){
            orders.style.display = "none";
            noOrders.style.display = "block";
            console.log("cart is empty")
        }
        else(
            console.log("cart full",cartData)
        )
    }else if(cashierDoc.exists()){
        const cartData = cashierDoc.data().cart;
        if(cartData.length === 0){
            orders.style.display = "none";
            noOrders.style.display = "block";
            console.log("cart is empty")
        }
        else(
            console.log("cart full",cartData)
        )
    }
}


  async function loadCart(uid){
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);
      
    try{
        if(adminDoc.exists()){
            const cartData = adminDoc.data().cart;
            if(cartData.length > 0){
                noOrders.style.display = "none";
                clearAllOrders.style.display = "block";
                cartData.forEach((item)=>{
                    const eachItem = {
                        id:item.Id,
                        name:item.Name,
                        price:item.Price,
                        image:item.Image,
                        quantity:item.quantity
                    }
                    cart.push(eachItem);
                    console.log(cart);
               
                    orders.innerHTML += `<div class="order">
                                            <div class="order-first-section">
                                                <div class="order-image-box">
                                                   <img src="${eachItem.image}"/>
                                                </div>
                                           
                                                <div class="order-info">
                                                    <p class="order-name">${eachItem.name}</p>
                                                    <div class="order-quantity-box">
                                                        <div data-id="${eachItem.id}"><button class="order-subtract-button">-</button></div>
                                                        <div><p>${eachItem.quantity}</p></div>
                                                        <div data-id="${eachItem.id}"><button class="order-add-button">+</button></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="order-second-section">
                                                <div class="order-price-box">
                                                <p class="order-price">$${eachItem.price}.00</p>
                                                </div>
                                                <button data-id="${eachItem.id}"><ion-icon name="trash-bin-outline" class="order-delete"></ion-icon></button>
                                            </div>
                                        </div>`
                 })
          
            }else{
                noOrders.style.display = "block";
                console.log("empty cart")
            }
             

        }else if(cashierDoc.exists()){
            const cartData = cashierDoc.data().cart
            if(cartData.length > 0){
                noOrders.style.display = "none";
                clearAllOrders.style.display = "block";
                cartData.forEach((item)=>{
                    const eachItem = {
                        id:item.Id,
                        name:item.Name,
                        price:item.Price,
                        image:item.Image,
                        quantity:item.quantity
                    }
                    cart.push(eachItem);
                    console.log(cart);
               
                    orders.innerHTML += `<div class="order">
                                            <div class="order-first-section">
                                                <div class="order-image-box">
                                                   <img src="${eachItem.image}"/>
                                                </div>
                                           
                                                <div class="order-info">
                                                    <p class="order-name">${eachItem.name}</p>
                                                    <div class="order-quantity-box">
                                                        <div data-id="${eachItem.id}"><button class="order-subtract-button">-</button></div>
                                                        <div><p>${eachItem.quantity}</p></div>
                                                        <div data-id="${eachItem.id}"><button class="order-add-button">+</button></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="order-second-section">
                                                <div class="order-price-box">
                                                <p class="order-price">$${eachItem.price}.00</p>
                                                </div>
                                                <button data-id="${eachItem.id}"><ion-icon name="trash-bin-outline" class="order-delete"></ion-icon></button>
                                            </div>
                                        </div>`
                 })
          
            }
         
        }
    }
    catch(error){
        console.log("err",error.code)
    }
 }

 async function deleteAllOrders(uid){
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);
 

    if(adminDoc.exists()){
        loadingOrder.style.display = "block";
        orders.style.opacity = "0.5";
        console.log("all cleared")
        await updateDoc(adminCollection,{
            cart:[]
        })
        window.location.reload()
        console.log("all cleared")
    }else if(cashierDoc.exists()){
        loadingOrder.style.display = "block";
        orders.style.opacity = "0.5";
        console.log("all cleared")
        await updateDoc(cashierCollection,{
            cart:[]
        })
        window.location.reload()
   console.log("all cleared")

    }
 }
 orders.addEventListener("click",(event)=>{
    if(event.target.classList.contains("clear-all-orders")){
        onAuthStateChanged(auth,(user)=>{
            const uid = user.uid;
            deleteAllOrders(uid)
        })
       
    }
  
 })

 async function deleteFromCart(uid,docId){
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);

    if (adminDoc.exists()) {
        const cartData = adminDoc.data().cart;
        const updatedCartData = cartData.filter((product) => product.Id !== docId);
    
        await updateDoc(adminCollection, {
            cart: updatedCartData
        });
        console.log("Cart updated successfully");
        console.log(cartData)
    }
    else if(cashierDoc.exists()){
        const cartData = cashierDoc.data().cart;
        const updatedCartData = cartData.filter((product) => product.Id !== docId);
    
        await updateDoc(cashierCollection, {
            cart: updatedCartData
        });
        console.log("Cart updated successfully");
        console.log(cartData)
    }
      
    }

    function deleteFromCartDOM(event,docId){
           if(docId){
            const orderElement = event.target.closest(".order");
            if (orderElement) {
                orderElement.remove();
            }
           }
    }

 orders.addEventListener("click",(event)=>{
    if(event.target.classList.contains("order-delete")){
        const docId = event.target.parentElement.dataset.id;
        onAuthStateChanged(auth,(user)=>{
            if(user){
                const uid = user.uid;
                deleteFromCartDOM(event,docId)
                deleteFromCart(uid,docId)
            }
        })

    }
 })

 async function increaseQuantity(uid,documentId){
    loadingOrder.style.display = "block";
    orders.style.opacity = "0.5";
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);

    if(adminDoc.exists()){
        const cartData = adminDoc.data().cart;
        cartData.forEach((product)=>{
            try{
                if(product.Id === documentId){
                    console.log(product.quantity)
                   product.quantity += 1;
                   console.log(product.quantity)
                }
            }
            catch(error){
                console.log(error)
            }
          
        })
        await updateDoc(adminCollection,{
            cart : cartData
           })
        console.log("increased quantity")
        window.location.reload()
    }else if(cashierDoc.exists()){
        const cartData = cashierDoc.data().cart;
        cartData.forEach((product)=>{
            try{
                if(product.Id === documentId){
                    console.log(product.quantity)
                   product.quantity += 1;
                   console.log(product.quantity)
                }
            }
            catch(error){
                console.log(error)
            }
           
        })
        await updateDoc(cashierCollection,{
            cart : cartData
           })
        console.log("decreased quantity")
        window.location.reload()
    }
 }

 async function decreaseQuantity(uid,documentId){
    loadingOrder.style.display = "block";
    orders.style.opacity = "0.5";
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);

    if(adminDoc.exists()){
        const cartData = adminDoc.data().cart;
        cartData.forEach((product)=>{
            try{
                if(product.Id === documentId){
                    console.log(product.quantity)
                   product.quantity -= 1;
                   console.log(product.quantity)
                }
            }
            catch(error){
                console.log(error)
            }
            
        })
        await updateDoc(adminCollection,{
            cart : cartData
           })
        console.log("decreased quantity")
        window.location.reload()
    }else if(cashierDoc.exists()){
        const cartData = cashierDoc.data().cart;
        cartData.forEach((product)=>{
            try{
                if(product.Id === documentId){
                    console.log(product.quantity)
                   product.quantity -= 1;
                   console.log(product.quantity)
                }
            }
            catch(error){
                console.log(error)
            }
           
        })
        await updateDoc(cashierCollection,{
            cart : cartData
           })
        console.log("decreased quantity")
        window.location.reload()
    }
 }

 orders.addEventListener("click",(event)=>{
    if(event.target.classList.contains("order-add-button")){
        const documentId = event.target.parentElement.dataset.id;
        onAuthStateChanged(auth,(user)=>{
            if(user){
                const uid = user.uid;
                increaseQuantity(uid,documentId)
            }
        })
    }else if(event.target.classList.contains("order-subtract-button")){
        console.log(event.target)
        const documentId = event.target.parentElement.dataset.id;
        onAuthStateChanged(auth,(user)=>{
            if(user){
                const uid = user.uid;
                decreaseQuantity(uid,documentId)
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
