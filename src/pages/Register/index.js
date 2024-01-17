import {createUserWithEmailAndPassword,onAuthStateChanged} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, setDoc, doc ,getDoc,addDoc} from "firebase/firestore"
import Swal from "sweetalert2"

const registerForm = document.querySelector(".registerForm")
const loader = document.querySelector(".loader-box")
const error = document.querySelector(".error-display")
const password = document.querySelector("#password")


  async function registerUser(){
    if (registerForm.status.value !== "Admin" && registerForm.status.value !== "Cashier") {
        error.style.display = "block";
        registerForm.status.style.border = "1px solid red"
    }else{
        try{
            const oldValue = registerForm.username.value;
            const newValue = oldValue + '@gmail.com';
            loader.style.display = "block";
            console.log(newValue)
            await createUserWithEmailAndPassword(auth,newValue,registerForm.password.value)
            onAuthStateChanged(auth,(user)=>{
                if(user){
                    const uid = user.uid;
                    const adminCollection = (collection(db,"Admins"))
                    const cashierCollection = (collection(db,"Cashiers"))
                    const adminDoc = doc(adminCollection,uid)
                    const cashierDoc = doc(cashierCollection,uid)

                    if(registerForm.status.value === "Admin"){
                        setDoc(adminDoc,{
                           Role: registerForm.status.value,
                           Username: registerForm.username.value.trim(),
                           cart:[]
                       })
                       console.log("Admin created succesfully")
                       registerForm.reset()
                       Swal.fire({
                           position: "center",
                           icon: "success",
                           title: "Admin created successfully",
                           showConfirmButton: false,
                           timer: 1500
                         });
                         setTimeout(()=>{
                           window.location.href = "/dist/index.html"
                         },1500)
                  
                   }
                   if(registerForm.status.value === "Cashier"){
                       setDoc(cashierDoc,{
                           Role:registerForm.status.value,
                           Username: registerForm.username.value.trim(),
                           cart:[]
                       })
                       console.log("Cashier created succesfully")
                       registerForm.reset()
                       Swal.fire({
                           position: "center",
                           icon: "success",
                           title: "Cashier created successfully",
                           showConfirmButton: false,
                           timer: 1500
                         });
                         setTimeout(()=>{
                           window.location.href = "/dist/index.html"
                         },1500)
                   }
                }
            })

                      
           
        }catch(error){
           console.log(error)
           loader.style.display = "none"
           if(error.code === "auth/invalid-email"){
               Swal.fire({
                   icon: "error",
                   title: "Email is Incorrect",
                 });
           }else if (error.code === 'auth/wrong-password') {
               Swal.fire({
           icon: "error",
           title: "Please check your password",
           });
           } else if (error.code === 'auth/user-not-found') {
               Swal.fire({
           icon: "error",
           title: "No User Was Found",
           });
           } else if (error.code === 'auth/email-already-in-use') {
               Swal.fire({
           icon: "error",
           title: "Email Already Exists",
           });
           }
           else if (error.code === 'auth/weak-password') {
               Swal.fire({
           icon: "error",
           title: "Password should be 6 characters or more",
           });
           }
           else {
             (error.code==='auth/network-request-failed')
             Swal.fire({
               icon: "error",
               title: "Check Your Internet Connection",
               });
           }
        }
    }
         
 }

registerForm.addEventListener("submit",(event)=>{
    event.preventDefault()
    registerUser()
})

registerForm.addEventListener("click",(event)=>{
    if(event.target.classList.contains("eye")){
        const checker = password.type === 'password' ? password.type = "text" : password.type = "password"
        console.log(checker)
    }
})





