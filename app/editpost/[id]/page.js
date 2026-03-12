"use client";

import { useEffect, useState } from "react";
import { auth, db } from "../../_util/config";
import { useParams, useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { OrbitProgress } from "react-loading-indicators";

export default function EditPost(){

    const [email,setEmail] = useState("");
    const [loading,setLoading] = useState(false);
    const [companyName,setCompanyName] = useState("");
    const [jobRole,setJobRole] = useState("");
    const [jobLocation,setJobLocation] = useState("");
    const [batch,setBatch] = useState("");
    const [description,setDescription] = useState("");
    const [ctc,setCtc] = useState("");
    const [stipend,setStipend] = useState("");
    const [cgpa,setCgpa] = useState("");
    const [standingArrear,setStandingArrear] = useState("");
    const [historyArrear,setHistoryArrear] = useState("");
    const [schools,setSchools] = useState("");
    const [dept,setDept] = useState("");
    const [date,setDate] = useState("");
    const [time,setTime] = useState("");
    const [link,setLink] = useState("");

    const [roundName,setRoundName] = useState("");
    const [roundCompleted,setRoundCompleted] = useState("");
    const [roundDate,setRoundDate] = useState("");
    const [roundTime,setRoundTime] = useState("");
    const [roundLink,setRoundLink] = useState("");
    const [roundInst,setRoundInst] = useState("");
    const [roundResult,setRoundResult] = useState("");

    const router = useRouter();
    const params = useParams();
    const id = params.id;

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

    async function handleLogout(){
        try{
            await signOut(auth);
            router.push("/");
        }
        catch(error){
            console.log(error.message);
        }
    }

    useEffect(() => {
        async function fetchPost(){
            setLoading(true);
            try{
                const snap = await getDoc(doc(db,"placements",id));

                if(snap.exists()){
                    const data = snap.data();

                    setCompanyName(data.company || "");
                    setJobRole(data.role || "");
                    setJobLocation(data.location || "");
                    setBatch(data.batch || "");
                    setDescription(data.description || "");
                    setCtc(data.ctc || "");
                    setStipend(data.stipend || "");
                    setCgpa(data.cgpa_threshold || "");
                    setStandingArrear(data.currentArrear || "");
                    setHistoryArrear(data.historyOfArrear || "");
                    setSchools(data.schools || "");
                    setDept(data.departments || "");
                    setDate(data.end_date || "");
                    setTime(data.end_time || "");
                    setLink(data.link || "");
                }

            } catch(error){
                console.log(error.message);
            }
            setLoading(false);
        }

        fetchPost();
    }, [id]);

    async function handleSubmit(e){
        e.preventDefault();
        setLoading(true);

        let resultUrl = "";

        if (roundResult) {
            const formData = new FormData();
            formData.append("file", roundResult);
            formData.append("upload_preset", "placements_results");

            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/upload`,
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await res.json();
            resultUrl = data.secure_url;
        }

        const roundData = {
            round: roundName,
            completed: roundCompleted === "Yes" ? true : false,
            date: roundDate,
            time: roundTime,
            link: roundLink,
            instructions: roundInst,
            result: resultUrl,
        };

        try{
            await updateDoc(doc(db,"placements",id),{
                company: companyName,
                role: jobRole,
                location: jobLocation,
                batch: batch,
                description: description,
                ctc: ctc,
                stipend: stipend,
                cgpa_threshold: cgpa,
                currentArrear: standingArrear,
                historyOfArrear: historyArrear,
                schools: schools,
                departments: dept,
                end_date: date,
                end_time: time,
                link: link,

                progress: arrayUnion(roundData)
            });

            alert("Updated successfully");
            router.push("/dashboard");

        } catch(error){
            console.log(error.message);
        }

        setLoading(false);
    }

    return (
        <div className="relative bg-black min-h-screen mx-auto py-5">
            <div className="mx-auto bg-gray-900 border border-gray-500 p-2 rounded-xl w-77 md:w-190 lg:w-250 xl:w-350">
                <div className="flex flex-row justify-between">
                    <div className="flex flex-row justify-left items-center">
                        <div className="flex flex-col">
                            <div className="select-none font-sans font-bold text-yellow-300 text-lg md:text-2xl">Welcome Admin</div>
                            <div className="select-none font-sans font-semibold text-yellow-300 text-sm md:text-sm">{email}</div>
                        </div>
                    </div>
                    <div className="select-none hidden md:flex font-sans text-white font-semibold text-2xl items-center">Update Job Post</div>
                    <div className="flex flex-col md:flex-row gap-x-6 gap-y-3 items-center justify-center">
                        <h1 onClick={() => router.push("/dashboard")} className="select-none font-sans font-semibold p-1 md:text-lg rounded-lg bg-yellow-300 hover:cursor-pointer">Dashboard</h1>
                        <h1 onClick={handleLogout} className="select-none font-sans font-semibold p-1 md:text-lg rounded-lg bg-yellow-300 hover:cursor-pointer">Logout</h1>
                    </div>
                </div>
            </div>

            <form onSubmit={(e) => handleSubmit(e)}>
                <div className="mx-auto flex flex-col justify-center items-center mt-8 rounded-2xl py-4 shadow-2xl w-77 md:w-190 lg:w-250 xl:w-350 bg-gray-900">
                    <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="Company Name"/>
                    <input value={jobRole} onChange={(e) => setJobRole(e.target.value)} className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="Job Role"/>
                    <input value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="Job Location"/>
                    <input value={batch} onChange={(e) => setBatch(e.target.value)} required className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="Batch"/>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} required className="resize-none h-30 p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" placeholder="Description"/>
                    <input value={ctc} onChange={(e) => setCtc(e.target.value)} required className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="CTC"/>
                    <input value={stipend} onChange={(e) => setStipend(e.target.value)} className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="Stipend"/>
                    <input value={cgpa} onChange={(e) => setCgpa(e.target.value)} required className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="CGPA"/>
                    <div className="mx-auto p-3 mb-4 rounded-2xl text-white w-68 border md:w-180 lg:mx-4 lg:w-210 border-gray-500">
                        <div className="font-sans text-xl">
                            Can student have standing arrear?
                        </div>
                        <div>
                            <input value="Yes" checked={standingArrear === "Yes"} onChange={(e) => setStandingArrear(e.target.value)} required className="mx-4 font-sans text-lg" type="radio" name="standingArrear"/>
                            <label className="font-sans text-lg">Yes</label><br></br>
                            <input value="No" checked={standingArrear === "No"} onChange={(e) => setStandingArrear(e.target.value)} className="mx-4 font-sans text-lg" type="radio" name="standingArrear"/>
                            <label className="font-sans text-lg">No</label>
                        </div>
                    </div>
                    <div className="mx-auto p-3 mb-4 rounded-2xl text-white w-68 border md:w-180 lg:mx-4 lg:w-210 border-gray-500">
                        <div className="font-sans text-xl">
                            Can student have history of arrears?
                        </div>
                        <div>
                            <input value="Yes" checked={historyArrear === "Yes"} onChange={(e) => setHistoryArrear(e.target.value)} required className="mx-4 font-sans text-lg" type="radio" name="historyOfArrears"/>
                            <label className="font-sans text-lg">Yes</label><br></br>
                            <input value="No" checked={historyArrear === "No"} onChange={(e) => setHistoryArrear(e.target.value)} className="mx-4 font-sans text-lg" type="radio" name="historyOfArrears"/>
                            <label className="font-sans text-lg">No</label>
                        </div>
                    </div>
                    <input value={schools} onChange={(e) => setSchools(e.target.value)} required className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="Schools (SOC, SEEE, . . .)"/>
                    <input value={dept} onChange={(e) => setDept(e.target.value)} required className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="Departments (CSE, AIDS, CSBT, . . .)"/>
                    <div className="mx-auto p-3 mb-4 rounded-2xl text-white w-68 border md:w-180 lg:mx-4 lg:w-210 border-gray-500">
                        <label className="font-sans text-xl">Deadline - Date & Time</label>
                        <div className="flex flex-col gap-y-2 mt-2">
                            <input value={date} onChange={(e) => setDate(e.target.value)} required className="border border-gray-500 rounded-xl p-2 w-40" type="date" placeholder="Schools (SOC, SEEE, ...)"/>
                            <input value={time} onChange={(e) => setTime(e.target.value)} required className="border border-gray-500 rounded-xl p-2 w-40" type="time" placeholder="Schools (SOC, SEEE, ...)"/>
                        </div>
                    </div>
                    <input value={link} onChange={(e) => setLink(e.target.value)} required className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="Paste Google Form Link"/>
                    
                    <div className="mx-auto p-3 mb-4 rounded-2xl text-white w-68 border md:w-180 lg:mx-4 lg:w-210 border-gray-500">
                        <label className="font-sans text-xl">Update Progress</label>
                        <div className="flex flex-col gap-y-2 mt-2">
                            <label className="font-sans text-xl">Round Details</label>
                            <input value={roundName} onChange={(e) => setRoundName(e.target.value)} required className="border border-gray-500 rounded-xl p-2 lg:w-203" type="text" placeholder="Round Name"/>
                            <div className="font-sans text-xl">
                                Is this round completed?
                            </div>
                            <div>
                                <input value="Yes" checked={roundCompleted === "Yes"} onChange={(e) => setRoundCompleted(e.target.value)} required className="mx-4 font-sans text-lg" type="radio" name="roundCompleted"/>
                                <label className="font-sans text-lg">Yes</label><br></br>
                                <input value="No" checked={roundCompleted === "No"} onChange={(e) => setRoundCompleted(e.target.value)} className="mx-4 font-sans text-lg" type="radio" name="roundCompleted"/>
                                <label className="font-sans text-lg">No</label>
                            </div>
                            {
                                roundCompleted === "No" && 
                                    <>
                                        <input value={roundLink} onChange={(e) => setRoundLink(e.target.value)} required className="border border-gray-500 rounded-xl p-2 lg:w-203" type="text" placeholder="Round Link"/>
                                        <input value={roundInst} onChange={(e) => setRoundInst(e.target.value)} required className="border border-gray-500 rounded-xl p-2 lg:w-203" type="text" placeholder="Round Instructions"/>
                                        <label className="font-sans text-lg">Date & Time</label>
                                        <div className="flex flex-col gap-y-2 mt-2">
                                            <input value={roundDate} onChange={(e) => setRoundDate(e.target.value)} required className="border border-gray-500 rounded-xl p-2 w-40" type="date" placeholder="Schools (SOC, SEEE, ...)"/>
                                            <input value={roundTime} onChange={(e) => setRoundTime(e.target.value)} required className="border border-gray-500 rounded-xl p-2 w-40" type="time" placeholder="Schools (SOC, SEEE, ...)"/>
                                        </div>
                                    </> 
                            } 
                            {
                                roundCompleted === "Yes" && 
                                    <>
                                        <label>Upload the results in excel format</label>
                                        <input accept=".xlsx,.xls,.csv" onChange={(e) => setRoundResult(e.target.files[0])} required className="border border-gray-500 rounded-xl p-2 lg:w-203" type="file" placeholder="Upload Results"/>
                                    </> 
                            }                            
                        </div>
                    </div>
                    
                    <button className="font-sans font-bold text-xl bg-yellow-300 w-50 h-10 rounded-lg hover:cursor-pointer" type="submit">Update Post</button>
                </div>
            </form>

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
        </div>
    )
}