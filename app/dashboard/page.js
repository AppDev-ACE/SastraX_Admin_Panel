"use client";

import { useEffect, useState } from "react";
import { auth,db } from "../_util/config";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { OrbitProgress } from "react-loading-indicators";

export default function Login(){

    const [email,setEmail] = useState("");
    const [loading,setLoading] = useState(false);
    const [data,setData] = useState([]);
    const [deleted,setDeleted] = useState(false);

    const router = useRouter();

    useEffect(() => {
        const a = auth.onAuthStateChanged((user) => {
            if (user)
            {
                setEmail(user.email)
            }
        });
        return () => {
            a();
        }
    },[]);

    useEffect(() => {
        async function fetchData(){
            setLoading(true);
            try {
                const snapshot = await getDocs(collection(db, "placements"));
                const jobs = snapshot.docs
                .filter(doc => doc.id !== "BranchMapping") 
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));    
                setData(jobs);
            }
            catch(error){
                console.log(error.message);
            }
            setLoading(false);
        }
        fetchData();
    },[]);

    async function deletePost(id){
        try{
            await deleteDoc(doc(db, "placements", id));
            setData(prev => prev.filter(item => item.id !== id));
            setDeleted(true);
        }
        catch(error){
            console.log(error.message);
        }
    }

    async function handleLogout(){
        try{
            await signOut(auth);
            router.push("/");
        }
        catch(error){
            console.log(error.message);
        }
    }

    return (
        <>
            <div className="relative bg-black min-h-screen mx-auto py-5">
                <div className="mx-auto bg-gray-900 border border-gray-500 p-2 rounded-xl w-77 md:w-190 lg:w-250 xl:w-350">
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-row justify-left items-center">
                            <div className="flex flex-col">
                                <div className="select-none font-sans font-bold text-yellow-300 text-lg md:text-2xl">Welcome Admin</div>
                                <div className="select-none font-sans font-semibold text-yellow-300 text-sm md:text-sm">{email}</div>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-x-6 gap-y-3 items-center justify-center">
                            <h1 onClick={() => router.push("/addpost")} className="select-none font-sans font-semibold p-1 md:text-lg rounded-lg bg-yellow-300 hover:cursor-pointer">Add Post</h1>
                            <h1 onClick={handleLogout} className="select-none font-sans font-semibold p-1 md:text-lg rounded-lg bg-yellow-300 hover:cursor-pointer">Logout</h1>
                        </div>
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
                    deleted && 
                    <>
                        <div className="z-20 fixed inset-0 flex flex-col justify-center backdrop-blur-sm items-center">
                        <div className="font-mono flex flex-col items-center justify-center bg-gray-800 rounded-xl p-4 m-2 text-white text-xl font-bold">
                            <h1>Post Deleted successfully</h1>
                            <h2 className="bg-yellow-300 p-1 hover:cursor-pointer rounded-sm text-black" onClick={() => {setDeleted(false);router.push("/dashboard")}}>OK</h2>
                        </div>
                        </div>
                    </>
                } 

                <div className='flex flex-row flex-wrap m-4 justify-center items-center font-sans gap-10 mx-auto'>
                    {
                        data.map((dt,index) => (
                            <div key={index} className='z-10 border-3 w-77 md:w-100 border-gray-500 rounded-2xl flex flex-col items-center pt-12 relative hover:scale-102 transition duration-300 ease-in-out'>
                                <div className='absolute top-0 font-bold text-xl font-sans w-full bg-yellow-300 p-2 rounded-tr-2xl rounded-tl-2xl text-center select-none'>{dt.company}</div>
                                {dt.role && <div className='font-semibold text-lg select-none text-gray-300 text-center'>{dt.role}</div>}
                                <div className="font-sans text-justify text-white p-1 text-sm">{dt.description}</div>    
                                <div className="font-sans font-semibold p-1 flex flex-wrap gap-2 justify-center">
                                    <h1 className="bg-green-400 p-1 rounded-sm">CTC: {dt.ctc}</h1>
                                    {dt.stipend && <h1 className="bg-green-400 p-1 rounded-sm">Stipend: {dt.stipend}</h1>}
                                    <h1 className="bg-green-400 p-1 rounded-sm">CGPA: {dt.cgpa_threshold}</h1>
                                    <h1 className="bg-green-400 p-1 rounded-sm">Schools: {dt.schools}</h1>
                                    {dt.location && <h1 className="bg-green-400 p-1 rounded-sm">Location: {dt.location}</h1>}
                                    <h1 className="bg-green-400 p-1 rounded-sm">Departments: {dt.departments}</h1>
                                    <h1 className="bg-green-400 p-1 rounded-sm">Standing Arrear: {dt.currentArrear}</h1>
                                    <h1 className="bg-green-400 p-1 rounded-sm">History of Arrears: {dt.historyOfArrear}</h1>
                                </div>
                                <div>
                                    <h1 className="font-sans text-white font-semibold mt-2">Deadline: {dt.end_date} {dt.end_time}</h1>
                                </div>

                                <div className='flex flex-row justify-center items-center gap-x-3 my-3'>
                                    <button onClick={() => router.push(`/editpost/${dt.id}`)} className="font-sans bg-blue-400 w-35 md:w-40 p-1 rounded-lg font-bold hover:cursor-pointer hover:bg-blue-500 transition duraton-300">Update Post</button>
                                    <button onClick={() => deletePost(dt.id)} className="font-sans bg-blue-400 w-35 md:w-40 p-1 rounded-lg font-bold hover:cursor-pointer hover:bg-blue-500 transition duraton-300">Delete Post</button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        </>
    )
}