import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import ScoreCircle from './ScoreCircle'
import { usePuterStore } from '~/lib/puter';
import { resumes } from 'constnants';

const ResumeCard = ( {resume: {id,companyName,jobTitle,feedback,imagePath}}:{resume:Resume}) => {
    const navigate = useNavigate();
    const [resumeUrl, setResumeUrl] = useState('')
    const {fs} = usePuterStore();
    
    
      useEffect(
        ()=>{
          const loadResume=async()=>{
            const blob = await fs.read(imagePath)
            if(!blob)return 
    
            let url = URL.createObjectURL(blob);
            setResumeUrl(url);
          } 
          loadResume();
        },[imagePath])
  
    return (
    <Link to ={`/resume/${id}`} className='resume-card animate-in fade-in duration-1000'>
        <div className="resume-card-header">
            <div className="flex flex-col gap-2">
                {companyName && <h2 className='text-black font-bold break-words'>{companyName}</h2>}
                {jobTitle && <h3 className='text-lg break-words text-gray0599'>{jobTitle}</h3>}
                {!jobTitle && !companyName && (
                    <h2 className="!text-black font-bold break-words">Resume</h2>
                )}
            </div>
        <div className="flex-shrink-0">
                <ScoreCircle score={feedback.overallScore}/>
            </div>
        </div>
        {resumes && (<div className="gradient-border animate-in duration-1000">
            <div className="w-full h-full">
                <img
                    src={resumeUrl}
                    alt="resume"
                    className='w-full h-[350px] max-sm:h-[200px] object-cover object-top duration-1000'
                />
            </div>
        </div>)}
    </Link>
  )
}

export default ResumeCard