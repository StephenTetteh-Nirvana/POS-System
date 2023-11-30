import {signInWithEmailAndPassword} from 'firebase/auth'
import {auth} from "/src/firebase.js"
import Swal from 'sweetalert2';

const form = document.querySelector(".form");

function signIn(){
    signInWithEmailAndPassword(auth,form.email.value,form.password.value)
    .then(()=>{
        console.log("success")
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