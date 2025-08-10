import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import ATS from '~/components/ATS';
import Details from '~/components/details';
import Summary from '~/components/summary';
import { usePuterStore } from '~/lib/puter';

export function meta() {[
      { title: "Resume analyzer | Review" },
      { name: "description", content: "Detailed overview of your resume" } ,
    ];
  }
  
const Resume = () => {
    const {auth,kv,isLoading,fs}=usePuterStore();
    const [imageUrl, setimageUrl] = useState('');
    const [ResumeUrl, setResumeUrl] = useState('');
    const [feedback, setfeedback] = useState<Feedback|null>(null);
    const navigate = useNavigate();
    const {id} =useParams();
    
    useEffect(() => {
        if(!isLoading && !auth.isAuthenticated){
          navigate(`/auth?next=/resume${id}`);
        }
      }, [isLoading])
    

    useEffect(()=>{
        const loadResume = async ()=>{
            const resume = await kv.get(`resume:${id}`);
            if(!resume) return;
            
            const data = JSON.parse(resume); 
            const resumeBlob = await fs.read(data.resumePath)
            if(!resumeBlob) return;

            const pdfBlob=new Blob([resumeBlob],{type:'application/pdf'})
            const resumeUrl = URL.createObjectURL(pdfBlob);
            setResumeUrl(resumeUrl)
            
            const ImageBlob = await fs.read(data.imagePath)
            if(!ImageBlob) return;

            const ImageUrl = URL.createObjectURL(ImageBlob);
            setimageUrl(ImageUrl)

            setfeedback(data.feedback);
            console.log({resumeUrl,imageUrl,feedback:data.feedback});
        }
        loadResume();
    },[id]);


  return (
    <main className='!p1-0'>
        <nav  className='resuem-nav'>
            <Link to='/' className="back-button">
                <img src="/icons/back.svg" alt="logo" className='w-2 h-2.5' />
                <span className='text-grat-800 text-sm fotn-semibold'>Back to Message</span>
            </Link>
        </nav>
        <div className="flex flex-row w-full max-lg:flex-col-reverse">
            <section className="feedback-section bg-[url('/images/bg-small.svg')] bg-cover h-[100vh] sticky top-0 items-center justify-center">
                {imageUrl&& ResumeUrl &&(
                    <div className="animate-in fade-in duration-1000 gradient-border max-sm:m-0 h-[90%] max-2xl:h-fit w-fit">
                        <a href={ResumeUrl} target='_blank' rel='noopener noreferrer'>
                            <img src={imageUrl} alt="image" className='w-full h-full object-contiain rounded-2xl '
                                title='resume'
                            />
                        </a>
                    </div>
                )}

            </section>
            <section className='feedback-section'>
                <h2 className='etxt-4xl !text-black font-bold'>Resume Review</h2>
                {feedback?(
                    <div className="flex flex-col gap-8 animate-in fade-in duration-1000">
                        <Summary feedback={feedback}/>
                        <ATS score={feedback.ATS.score||0} suggestions={feedback.ATS.tips||[]} />
                        <Details feedback={feedback}/>
                    </div>
                ):(
                    <img src="/images/resume-scan-2.gif" className='w-full' />
                )}
            </section>      
        </div>
    </main>
  )
}

export default Resume