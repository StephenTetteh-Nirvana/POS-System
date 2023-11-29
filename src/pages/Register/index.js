import {createUserWithEmailAndPassword,onAuthStateChanged} from "firebase/auth"
import {auth,db} from "/src/firebase"
import { collection, setDoc, doc } from "firebase/firestore"

const registerForm = document.querySelector(".registerForm")

  async function registerUser(){
    if(registerForm.role.value !== "Admin" && "Cashier"){
       registerForm.role.style.border = "1px solid red"
    }else{
        try{
            await createUserWithEmailAndPassword(auth,registerForm.email.value,registerForm.password.value)
            .then(()=>{
             onAuthStateChanged(auth,(user)=>{
                if(user){
                        const adminCollection = (collection(db,"Admins"))
                        const cashierCollection = (collection(db,"Cashiers"))
                        const adminDoc = doc(adminCollection,user.uid)
                        const cashierDoc = doc(cashierCollection,user.uid)

                        if(registerForm.role.value === "Admin"){
                            setDoc(adminDoc,{
                                Role: registerForm.role.value,
                                Username: registerForm.username.value
                            })
                            console.log("Admin created succesfully")
                            registerForm.reset()
                        }
                        if(registerForm.role.value === "Cashier"){
                            setDoc(cashierDoc,{
                                Role: registerForm.role.value,
                                Username: registerForm.username.value
                            })
                            console.log("Cashier created succesfully")
                            registerForm.reset()
                        }
                }
                   
             })
              
        
            })
           .catch((error)=>{
            console.log(error)
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



