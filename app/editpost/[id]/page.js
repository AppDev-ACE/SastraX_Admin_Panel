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
    const [restrictions,setRestrictions] = useState("");

    const [rounds, setRounds] = useState([
    {
        round: "",
        completed: "",
        date: "",
        time: "",
        link: "",
        instructions: "",
        resultFile: null
    }
    ]);

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

    function addNewRound() {
        setRounds([
            ...rounds,
            {
            round: "",
            completed: "",
            date: "",
            time: "",
            link: "",
            instructions: "",
            resultFile: null
            }
        ]);
    }

    function updateRound(index, field, value) {
        const updated = [...rounds];
        updated[index][field] = value;
        setRounds(updated);
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
                    setRestrictions(data.restrictions || "");

                    if(data.progress && data.progress.length > 0){
                        const formattedRounds = data.progress.map((p)=>({
                            round: p.round || "",
                            completed: p.completed ? "Yes" : "No",
                            date: p.date || "",
                            time: p.time || "",
                            link: p.link || "",
                            instructions: p.instructions || "",
                            resultFile: null,
                            resultUrl: p.result || ""
                        }));
                        setRounds(formattedRounds);
                    }
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
        try{
            const progressArray = [];
            for(const r of rounds){
                let resultUrl = r.resultUrl || "";
                if(r.resultFile){
                    const formData = new FormData();
                    formData.append("file", r.resultFile);
                    formData.append("upload_preset","placements_results");

                    const res = await fetch(
                        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUD_NAME}/upload`,
                        {
                            method:"POST",
                            body:formData
                        }
                    );

                    const data = await res.json();
                    resultUrl = data.secure_url;
                }

                progressArray.push({
                    round: r.round,
                    completed: r.completed === "Yes",
                    date: r.date || "",
                    time: r.time || "",
                    link: r.link || "",
                    instructions: r.instructions || "",
                    result: resultUrl
                });
            }
            const docRef = doc(db,"placements",id);

            await updateDoc(docRef,{
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
                progress: progressArray
            });
            alert("Updated successfully");
            router.push("/dashboard");
        }
        catch(error){
            console.log(error);
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

            <form onSubmit={handleSubmit}>
                <div className="mx-auto flex flex-col items-center mt-8 rounded-2xl py-6 shadow-2xl w-77 md:w-190 lg:w-250 xl:w-350 bg-gray-900">

                {/* Company */}
                <input
                value={companyName}
                onChange={(e)=>setCompanyName(e.target.value)}
                required
                className="p-3 mb-4 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="Company Name"
                />

                <input
                value={jobRole}
                onChange={(e)=>setJobRole(e.target.value)}
                className="p-3 mb-4 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="Job Role"
                />

                <input
                value={jobLocation}
                onChange={(e)=>setJobLocation(e.target.value)}
                className="p-3 mb-4 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="Job Location"
                />

                <input
                value={batch}
                onChange={(e)=>setBatch(e.target.value)}
                className="p-3 mb-4 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="Batch"
                />

                <textarea
                value={description}
                onChange={(e)=>setDescription(e.target.value)}
                className="resize-none h-32 p-3 mb-4 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="Description"
                />

                <input
                value={ctc}
                onChange={(e)=>setCtc(e.target.value)}
                className="p-3 mb-4 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="CTC"
                />

                <input
                value={stipend}
                onChange={(e)=>setStipend(e.target.value)}
                className="p-3 mb-4 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="Stipend"
                />

                <input
                value={cgpa}
                onChange={(e)=>setCgpa(e.target.value)}
                className="p-3 mb-4 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="CGPA"
                />

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
                <input value={restrictions} onChange={(e) => setRestrictions(e.target.value)} className="p-3 mb-4 ml-2 w-68 font-sans text-white text-lg md:w-180 lg:mx-4 lg:w-210 rounded-xl border border-gray-500" type="text" placeholder="Restrictions (Which company placed students cannot apply? If not leave empty)"/>

                <input
                value={schools}
                onChange={(e)=>setSchools(e.target.value)}
                className="p-3 mb-4 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="Schools"
                />

                <input
                value={dept}
                onChange={(e)=>setDept(e.target.value)}
                className="p-3 mb-4 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="Departments"
                />

                {/* Deadline */}
                <div className="p-4 mb-4 border border-gray-500 rounded-xl w-68 md:w-180 lg:w-210 text-white">
                <label className="text-lg font-semibold">Deadline</label>

                <div className="flex gap-4 mt-2">
                <input
                type="date"
                value={date}
                onChange={(e)=>setDate(e.target.value)}
                className="border border-gray-500 rounded-xl p-2"
                />

                <input
                type="time"
                value={time}
                onChange={(e)=>setTime(e.target.value)}
                className="border border-gray-500 rounded-xl p-2"
                />
                </div>
                </div>

                <input
                value={link}
                onChange={(e)=>setLink(e.target.value)}
                className="p-3 mb-6 w-68 md:w-180 lg:w-210 rounded-xl border border-gray-500 text-white"
                placeholder="Google Form Link"
                />


                {/* ---------------- ROUNDS ---------------- */}

                <div className="text-white text-2xl font-bold mb-4">
                Round Progress
                </div>

                {rounds.map((r,index)=>(
                <div
                key={index}
                className="p-4 mb-6 border border-gray-500 rounded-xl w-68 md:w-180 lg:w-210 text-white"
                >

                <div className="font-bold text-lg mb-2">
                Round {index+1}
                </div>

                <input
                value={r.round}
                onChange={(e)=>updateRound(index,"round",e.target.value)}
                placeholder="Round Name (OA / Interview)"
                className="border border-gray-500 rounded-xl p-2 w-full mb-3"
                />

                <div className="mb-3">

                <label className="mr-4 font-lg">Is this round completed?&nbsp;&nbsp;
                <input
                type="radio"
                checked={r.completed==="Yes"}
                onChange={()=>updateRound(index,"completed","Yes")}
                /> Yes
                </label>

                <label>
                <input
                type="radio"
                checked={r.completed==="No"}
                onChange={()=>updateRound(index,"completed","No")}
                /> No
                </label>

                </div>

                {/* ROUND NOT COMPLETED */}

                {r.completed==="No" && (
                <>

                <input
                value={r.link}
                onChange={(e)=>updateRound(index,"link",e.target.value)}
                placeholder="Round Link"
                className="border border-gray-500 rounded-xl p-2 w-full mb-3"
                />

                <input
                value={r.instructions}
                onChange={(e)=>updateRound(index,"instructions",e.target.value)}
                placeholder="Instructions"
                className="border border-gray-500 rounded-xl p-2 w-full mb-3"
                />

                <div className="flex gap-4">

                <input
                type="date"
                value={r.date}
                onChange={(e)=>updateRound(index,"date",e.target.value)}
                className="border border-gray-500 rounded-xl p-2"
                />

                <input
                type="time"
                value={r.time}
                onChange={(e)=>updateRound(index,"time",e.target.value)}
                className="border border-gray-500 rounded-xl p-2"
                />

                </div>

                </>
                )}

                {/* ROUND COMPLETED */}

                {r.completed==="Yes" && (
                <div className="flex flex-col gap-3">

                {/* Existing Result */}
                {r.resultUrl && (
                <a
                href={r.resultUrl}
                target="_blank"
                className="text-yellow-300 underline font-semibold"
                >
                View Uploaded Result
                </a>
                )}

                {/* Replace File */}
                <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e)=>updateRound(index,"resultFile",e.target.files[0])}
                className="border border-gray-500 rounded-xl p-2 w-full"
                />

                </div>
                )}

                </div>
                ))}


                <div className="flex flex-row gap-x-6">
                    <button type="button" onClick={addNewRound} className="bg-yellow-300 text-black font-bold px-6 py-2 rounded-lg mb-6 hover:cursor-pointer">Add Another Round</button>
                    <button type="submit" className="bg-yellow-300 text-black font-bold text-xl w-52 h-10 rounded-lg hover:cursor-pointer">Update Post</button>
                </div>

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