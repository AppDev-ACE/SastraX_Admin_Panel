"use client"

import Image from "next/image";
import { useState } from "react";
import { auth } from "./_util/config";
import { OrbitProgress } from "react-loading-indicators";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function Home() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const [success,setSuccess] = useState(false);
  const [invalid,setInvalid] = useState(false);

  const router = useRouter();

  async function handleSubmit(e){
    e.preventDefault();
    try
    {
      setLoading(true);
      await signInWithEmailAndPassword(auth,email,password);
      setLoading(false);
      setEmail("");
      setPassword("");
      setSuccess(true);
    }
    catch(error)
    {
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password" || error.code === "auth/invalid-credential")
      {
        setLoading(false);
        setInvalid(true);
      }
    }
  }

  return (
    <>
        <div className="select-none relative bg-black min-h-screen md:bg-black">
          <div className="flex flex-col justify-center items-center h-screen">
            <Image src="/ace-logo.webp" width={200} height={200} alt="ace-logo"></Image>
            <h1 className="font-sans font-bold text-yellow-300 text-2xl md:text-4xl my-5">SastraX Admin Panel</h1>
            <div className="rounded-xl bg-gray-900 w-75 md:w-100">
              <h1 className="flex justify-center text-2xl my-2 font-bold text-white mb-4">Login</h1>
              <form onSubmit={(e) => handleSubmit(e)}>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="font-sans text-white w-70 md:w-90 flex justify-center mx-auto border border-white my-2 p-2 rounded-lg" type="email" required placeholder="Email"></input>
                <input value={password} onChange={(e) => setPassword(e.target.value)} className="font-sans text-white w-70 md:w-90 flex justify-center mx-auto border border-white my-2 p-2 rounded-lg" type="password" required placeholder="Password"></input>
                <button className="font-sans text-xl w-70 md:w-90 bg-yellow-300 font-bold mx-auto flex justify-center p-2 my-5 rounded-lg w-20 hover:bg-yellow-200 hover:cursor-pointer transition duration-300">Login</button>
              </form>
            </div>        
          </div>
          {
              loading && 
              <>
                <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                  <div className="font-mono m-2 text-white text-3xl font-bold">
                    <OrbitProgress variant="disc" color="#f6cb00" size="medium" text="" textColor="" />
                  </div>
                </div>
              </>
            } 

            {
              success && 
              <>
                <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                  <div className="font-mono flex flex-col items-center justify-center bg-gray-800 rounded-xl p-4 m-2 text-white text-xl font-bold">
                    <h1>Login Successful</h1>
                    <h2 className="bg-yellow-300 p-1 hover:cursor-pointer rounded-sm text-black" onClick={() => {setSuccess(false);router.push("/dashboard")}}>OK</h2>
                  </div>
                </div>
              </>
            } 

            {
              invalid && 
              <>
                <div className="fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                  <div className="font-mono flex flex-col items-center justify-center bg-gray-800 rounded-xl p-4 m-2 text-white text-xl font-bold">
                    <h1>Invalid Email or Password</h1>
                    <h2 className="bg-yellow-300 p-1 hover:cursor-pointer rounded-sm text-black" onClick={() => setInvalid(false)}>OK</h2>
                  </div>
                </div>
              </>
            } 
        </div>
    </>
  );
}
