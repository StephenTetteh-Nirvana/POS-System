import {onAuthStateChanged,signOut} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, doc,getDoc,getDocs, updateDoc,addDoc} from "firebase/firestore"
import Swal from "sweetalert2"

const fruits = [];
const cart = [];
let order = []

const searchSection = document.querySelector(".second-section")
const orderContainer = document.querySelector(".order-container")
const orderSidebar = document.querySelector(".order-sidebar")
const date = document.querySelector(".date")
const time = document.querySelector(".time")
const username = document.querySelector(".username")
const userRole = document.querySelector(".user-role")
const role = document.querySelector(".role")
const userStatus = document.querySelector(".user-status")
const userLogout = document.querySelector("#logOut")
const users = document.querySelector("#users")
const dashboard = document.querySelector("#dashboard")
const fruitsDisplay = document.querySelector(".fruits-section")
const loader = document.querySelector(".loader-box")
const noOrders = document.querySelector(".no-orders-alert")
const orders = document.querySelector(".orders-alert")
const clearAllOrders = document.querySelector(".clear-all-orders")
const loadingOrder = document.querySelector(".loading-order-box")
const Total = document.querySelector(".total span")
const customerForm = document.querySelector(".customer-info")
const loadingCustomer = document.querySelector(".customer-loader-box")
const Payment = document.querySelector(".payment-section")

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
                dashboard.style.display = "none"
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
            loadCart(uid)
            totalAmount(uid)
            fetchDocs(uid)
          
        }else{
            console.log("no-user")
            window.location.href = "/src/pages/Login/login.html"

        }
        }) 
    displayFruits()

       
})

searchSection.addEventListener("click",(e)=>{
   if(e.target.classList.contains("hamburger") || e.target.classList.contains("bar")){
      orderSidebar.classList.add("order-active");
      orderContainer.classList.add("hamburger-active");
   
   }
})

orderContainer.addEventListener("click",(e)=>{
    if(e.target.classList.contains("close-icon")){
        orderSidebar.classList.remove("order-active");
        orderContainer.classList.remove("hamburger-active");
    }
})

Payment.addEventListener("click", (event) => {
    const liTag = event.target.closest("li");
    const ul = liTag.parentElement;
    ul.querySelectorAll("li").forEach((li) => {
        li.classList.remove("active");
    });
    liTag.classList.add("active");
});

function resetLi(){
    Payment.querySelectorAll("li").forEach((li) => {
        li.classList.remove("active");
    });
}


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
         fruitsDisplay.innerHTML += `<div class="fruit" data-name="${singleFruit.name}" data-image="${singleFruit.imagePath}" data-price="${singleFruit.price}" data-id="${singleFruit.id}">
                                             <div class="fruit-image-box">
                                                <img class="fruit-img" src="${singleFruit.imagePath}"/>
                                             </div>
                                             <div class="fruit-info-section">
                                                <div class="fruit-info">
                                                <p class="fruit-name">${singleFruit.name}</p>
                                                <p class="fruit-price">${singleFruit.price}.00</p>
                                                </div>
                                                <div class="initial-quantity-box">
                                                  <button class="quantity-subtract" data-id="${singleFruit.id}">-</button>
                                                  <input type="text" value=1 id="quantityInput"  data-id="${singleFruit.id}" readonly/>
                                                  <button class="quantity-add" data-id="${singleFruit.id}">+</button>
                                                </div>
                                             </div>
                                            
                                       </div>`
                                       

    }) 

    const fruitBox = document.querySelectorAll('.fruit');

fruitBox.forEach((eachFruit) => {
  eachFruit.addEventListener('click', (event) => {
    if(event.target.classList.contains("quantity-subtract")){
        const currentId = event.target.dataset.id;
        fruitBox.forEach((fruitQuantity)=>{
           if(currentId === fruitQuantity.dataset.id){
            const inputField = fruitQuantity.querySelector('#quantityInput');
                   if(inputField.value > 1){
                        let quantityConvert = Number(inputField.value)
                        quantityConvert -= 1;
                        inputField.value = quantityConvert;
                        console.log(currentId,quantityConvert)
                   }    
           }
        })
    }else if(event.target.classList.contains("quantity-add")){
        const currentId = event.target.dataset.id;
        fruitBox.forEach((fruitQuantity)=>{
           if(currentId === fruitQuantity.dataset.id){
            const inputField = fruitQuantity.querySelector('#quantityInput');
                        let quantityConvert = Number(inputField.value)
                        quantityConvert += 1;
                        inputField.value = quantityConvert;
                        console.log(currentId,quantityConvert)
           }
        })
    }else{
        const eachFruit = event.currentTarget;
        const currentId = event.currentTarget.dataset.id;

        fruitBox.forEach(async(fruitQuantity)=>{
            if(currentId === fruitQuantity.dataset.id){
             const inputField = fruitQuantity.querySelector('#quantityInput');

             const fruit = {
                Id:eachFruit.dataset.id,
                Name:eachFruit.dataset.name,
                Price:eachFruit.dataset.price,
                Image:eachFruit.dataset.image,
                quantity:inputField.value
            }

            
            onAuthStateChanged(auth,(user)=>{
                if(user){
                    const uid = user.uid;
                    addToCart(uid,fruit)
                    loadCart(uid)
                }
            })
           }
         })  
    }
  });
});
}


async function addToCart(uid,fruit){
    Swal.fire({
        position: "center",
        icon: "success",
        title: "Product added to cart successfully",
        showConfirmButton: false,
        timer: 1000
      });
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);

    try{  
        if(adminDoc.exists()){
            const cartArray = adminDoc.data().cart;
            cartArray.push(fruit)
            await updateDoc(adminCollection,{cart:cartArray})
                console.log("updated succesfully")
                console.log(cartArray)
                await loadCart(uid)
                await totalAmount(uid)
        }else if(cashierDoc.exists()){
            const cartArray = cashierDoc.data().cart;
            cartArray.push(fruit)
            await updateDoc(cashierCollection,{cart:cartArray})
              await loadCart(uid)
              await totalAmount(uid)
            console.log("updated")
            console.log(cartArray)
        }
    }
    catch(error){
        console.log(error)
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
                orders.innerHTML = '';
                noOrders.style.display = "none";
                orders.style.display = "block"
                cartData.forEach((item)=>{
                    const eachItem = {
                        id:item.Id,
                        name:item.Name,
                        price:item.Price,
                        image:item.Image,
                        quantity:item.quantity
                    }
                  
                    orders.innerHTML += `<div class="order">
                                            <p class="order-name">${eachItem.name}</p>
                                            <p>X ${eachItem.quantity}</p>
                                            <p class="order-price">$${eachItem.price}.00</p>
                                            <button data-id="${eachItem.id}">
                                            <ion-icon name="close-circle" class="order-delete"></ion-icon>
                                            </button>
                                        </div>`
                 })
          
            }else{
                noOrders.style.display = "block";
                orders.style.display = "none";
                console.log("empty cart")
            }
             

        }else if(cashierDoc.exists()){
            const cartData = cashierDoc.data().cart
            if(cartData.length > 0){
                orders.innerHTML = '';
                noOrders.style.display = "none";
                orders.style.display = "block"
                cartData.forEach((item)=>{
                    const eachItem = {
                        id:item.Id,
                        name:item.Name,
                        price:item.Price,
                        image:item.Image,
                        quantity:item.quantity
                    }
                    orders.innerHTML += `<div class="order">
                                            <p class="order-name">${eachItem.name}</p>
                                            <p>X ${eachItem.quantity}</p>
                                            <p class="order-price">$${eachItem.price}.00</p>
                                            <button data-id="${eachItem.id}">
                                            <ion-icon name="close-circle" class="order-delete"></ion-icon>
                                            </button>
                                        </div>`
                 })
          
            }else{
                noOrders.style.display = "block";
                orders.style.display = "none";
                console.log("empty cart")
            }
         
        }
    }
    catch(error){
        console.log("err",error.code)
    }
 }

 async function deleteAllOrders(uid){
    loadingOrder.style.display = "block";
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);
 

    if(adminDoc.exists()){
        console.log("all cleared")
        await updateDoc(adminCollection,{
            cart:[]
        })
        loadingOrder.style.display = "none";
        orders.style.display = "none";
        await loadCart(uid)
        await totalAmount(uid)
        console.log("all cleared")
    }else if(cashierDoc.exists()){
        loadingOrder.style.display = "block";
        orders.style.display = "none";
        console.log("all cleared")
        await updateDoc(cashierCollection,{
            cart:[]
        })
        loadingOrder.style.display = "none";
        orders.style.opacity = "1";
        await loadCart(uid)
        await totalAmount(uid)
        console.log("all cleared")

    }
 }
 clearAllOrders.addEventListener("click",()=>{
        onAuthStateChanged(auth,(user)=>{
            const uid = user.uid;
            deleteAllOrders(uid)
        })
 })

 async function deleteFromCart(uid,docId){
    loadingOrder.style.display = "block";
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
        loadingOrder.style.display = "none";
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Product removed from cart",
            showConfirmButton: false,
            timer: 1500
          });
          await totalAmount(uid)
        await loadCart(uid)
        console.log("Cart updated successfully");
        console.log(cartData)
    }
    else if(cashierDoc.exists()){
        const cartData = cashierDoc.data().cart;
        const updatedCartData = cartData.filter((product) => product.Id !== docId);
    
        await updateDoc(cashierCollection, {
            cart: updatedCartData
        });
        loadingOrder.style.display = "none";
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Product removed from cart",
            showConfirmButton: false,
            timer: 1500
          });
          await totalAmount(uid)
        await loadCart(uid)
        console.log("Cart updated successfully");
        console.log(cartData)
    }
      
    }

 orders.addEventListener("click",(event)=>{
    if(event.target.classList.contains("order-delete")){
        const docId = event.target.parentElement.dataset.id;
        onAuthStateChanged(auth,(user)=>{
            if(user){
                const uid = user.uid;
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
        await loadCart(uid)
        await totalAmount(uid)
        loadingOrder.style.display = "none";
        orders.style.opacity = "1";
        console.log("increased quantity")
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
           await totalAmount(uid)
           await loadCart(uid)
           loadingOrder.style.display = "none";
           orders.style.opacity = "1";
        console.log("decreased quantity")
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
           await totalAmount(uid)
           await loadCart(uid)
           loadingOrder.style.display = "none";
           orders.style.opacity = "1";
           console.log("increased quantity")
        console.log("decreased quantity")
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
           await totalAmount(uid)
           await loadCart(uid)
           loadingOrder.style.display = "none";
           orders.style.opacity = "1";
           console.log("increased quantity")
        console.log("decreased quantity")
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

 async function createCustomerCollection(uid){
    loadingCustomer.style.display = "block";
    const adminCollection = doc(db,"Admins",uid);
    const cashierCollection = doc(db,"Cashiers",uid);
    const adminDoc = await getDoc(adminCollection);
    const cashierDoc = await getDoc(cashierCollection);
    try{
        if(adminDoc.exists()){
            const cartData = adminDoc.data().cart;
            if(cartData.length === 0){
                loadingCustomer.style.display = "none"
                customerForm.reset()
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "No Item Added",
                    showConfirmButton: false,
                    timer: 1500
                  });
            }
            else{
                const customerCollection = collection(adminCollection,"Customers");
            const customerDocRef =  await addDoc(customerCollection,{
                CustomerName: customerForm.customerName.value,
                CustomerPhone: customerForm.customerPhone.value,
                order:[]
            })
            console.log("customer created successfully")
            await updateAdminCustomer(customerDocRef,cartData,adminCollection)
            customerForm.reset()
            await loadCart(uid)
            await totalAmount(uid)
            resetLi()
            loadingCustomer.style.display = "none"
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Order Completed",
                showConfirmButton: false,
                timer: 1500
              });
            console.log("order array updated")
            }
        }else if(cashierDoc.exists()){
            const cartData = cashierDoc.data().cart;
            if(cartData.length === 0){
                loadingCustomer.style.display = "none"
                customerForm.reset()
                Swal.fire({
                    position: "center",
                    icon: "error",
                    title: "No Item Added",
                    showConfirmButton: false,
                    timer: 1500
                  });
            } 
            else{
            const customerCollection = collection(cashierCollection,"Customers");
            const customerDocRef =  await addDoc(customerCollection,{
                CustomerName: customerForm.customerName.value,
                CustomerPhone: customerForm.customerPhone.value,
                order:[]
            })
            console.log("customer created successfully")
            await updateCashierCustomer(customerDocRef,cartData,cashierCollection)
            customerForm.reset()
            await loadCart(uid)
            await totalAmount(uid)
            resetLi()
            loadingCustomer.style.display = "none"
            Swal.fire({
                position: "center",
                icon: "success",
                title: "Order Completed",
                showConfirmButton: false,
                timer: 1500
              });
            console.log("order array updated")
            }


        
    }
}
    catch(error){
       console.log(error)
    }

  }

  async function updateAdminCustomer(customerDocRef,cartData,adminCollection){
       const displayCustomer = await getDoc(customerDocRef)
       if(displayCustomer.exists()){
           const orderData = displayCustomer.data().order;
           await orderData.push(...cartData)
           await updateDoc(customerDocRef,{
              order:orderData
           })
           console.log("order array update")
           console.log(orderData)

           await updateDoc(adminCollection,{
            cart:[]
           })
           console.log("cart has been updated succesfully")

       }
    }

    async function updateCashierCustomer(customerDocRef,cartData,cashierCollection){
        const displayCustomer = await getDoc(customerDocRef)
        if(displayCustomer.exists()){
            const orderData = displayCustomer.data().order;
            await orderData.push(...cartData)
            await updateDoc(customerDocRef,{
               order:orderData
            })
            console.log("order array update")
            console.log(orderData)
 
            await updateDoc(cashierCollection,{
             cart:[]
            })
            console.log("cart has been updated succesfully")
        }
     }

 customerForm.addEventListener("submit",(event)=>{
   event.preventDefault();
   onAuthStateChanged(auth,(user)=>{
    if(user){
        const uid = user.uid
        createCustomerCollection(uid)
    }
   })
  
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
