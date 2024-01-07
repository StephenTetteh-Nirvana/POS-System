import {signInWithEmailAndPassword} from 'firebase/auth'
import {auth} from "/src/firebase.js"
import Swal from 'sweetalert2';

const form = document.querySelector(".form");
const loader = document.querySelector(".loader-box")
const password = document.querySelector("#password")

function signIn(){
    loader.style.display = "block";
    const oldValue = form.email.value;
    const newValue = oldValue + '@gmail.com';
    signInWithEmailAndPassword(auth,newValue,form.password.value)
    .then(()=>{
        console.log("success")
        console.log(form.email.value)
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Login successfully",
            showConfirmButton: false,
            timer: 1500
          });
          setTimeout(()=>{
            window.location.href = "/dist/index.html"
          },1500)
    })
    .catch((error)=>{
        console.log(error.code)
        loader.style.display = "none"
        if (error.code === 'auth/invalid-email') {
            Swal.fire({
            icon: "error",
            title: "Invalid Email",
            });
            } else if (error.code === 'auth/wrong-password') {
                Swal.fire({
            icon: "error",
            title: "Incorrect Password",
            });
            } else if (error.code === 'auth/missing-password') {
                Swal.fire({
            icon: "error",
            title: "Please Enter Your Password",
            });
             } else if (error.code === 'auth/user-not-found') {
                Swal.fire({
            icon: "error",
            title: "There is no user with account",
            });
        }
            else if (error.code === 'auth/user-disabled') {
                Swal.fire({
            icon: "error",
            title: "User disabled",
            });
            }
            else if (error.code === "auth/invalid-login-credentials") {
                Swal.fire({
            icon: "error",
            title: "Wrong Credentials",
            });
            } else {
              (error.code==='auth/network-request-failed')
              Swal.fire({
                icon: "error",
                title: "Check Your Internet Connection",
                });
            }
    })
}

form.addEventListener("submit",(event)=>{
    event.preventDefault()
      signIn()
})

form.addEventListener("click",(event)=>{
     if(event.target.classList.contains("eye")){
         const checker = password.type === 'password' ? password.type = "text" : password.type = "password"
         console.log(checker)
     }
})