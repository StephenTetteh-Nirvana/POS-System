import {createUserWithEmailAndPassword,onAuthStateChanged} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, setDoc, doc } from "firebase/firestore"
import Swal from "sweetalert2"

const registerForm = document.querySelector(".registerForm")
const loader = document.querySelector(".loader-box")


const error = document.querySelector(".error-display")
  async function registerUser(){
    if (registerForm.status.value !== "Admin" && registerForm.status.value !== "Cashier") {
        error.style.display = "block";
    }else{
        try{
            loader.style.display = "block";
            await createUserWithEmailAndPassword(auth,registerForm.email.value,registerForm.password.value)
            .then(()=>{
             onAuthStateChanged(auth,(user)=>{
                if(user){
                        const adminCollection = (collection(db,"Admins"))
                        const cashierCollection = (collection(db,"Cashiers"))
                        const adminDoc = doc(adminCollection,user.uid)
                        const cashierDoc = doc(cashierCollection,user.uid)

                        if(registerForm.status.value === "Admin"){
                            setDoc(adminDoc,{
                                Role: registerForm.status.value,
                                Username: registerForm.username.value.trim(),
                                cart:[],
                                order:[]
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
                                cart:[],
                                order:[]
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
              
        
            })
           .catch((error)=>{
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
            
           })
        }
        catch(error){
           console.log(error)
        }
    }
         
 }
        
   

registerForm.addEventListener("submit",(event)=>{
    event.preventDefault()
    registerUser()
})





