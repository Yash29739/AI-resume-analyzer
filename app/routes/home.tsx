import type { Route } from "./+types/home";
import Navbar from "~/components/Navbar";
import { resumes } from "constnants";
import ResumeCard from "~/components/ResumeCard";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Resume analyzer" },
    { name: "description", content: "smart feedback for Your dream Job" },
  ];
}

export default function Home() {
  const {auth} = usePuterStore();
  const navigate = useNavigate();

  useEffect(() => {
    if(!auth.isAuthenticated){
      navigate("/auth?next=/");
    }
  }, [auth.isAuthenticated])


  return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
    <Navbar/>
    <section className="main-section">
      <div className="page-heading py-16">
        <h1>Track Your Appplication & Resume Ratings</h1>
        <h2>Review Your submissions and check AI-powered feedback</h2>
      </div>
      {resumes.length>0 && (
        <div className="resumes-section">
          {resumes.map(resume=>(
            <ResumeCard key={resume.jobTitle} resume={resume}/>
          ))}
        </div>
      )}
    </section>

  </main>;
}
