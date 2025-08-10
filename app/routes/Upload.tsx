import { prepareInstructions } from 'constnants';
import React, { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router';
import FileUploader from '~/components/FileUploader';
import Navbar from '~/components/Navbar'
import { convertPdfToImage } from '~/lib/pdf2Image';
import { usePuterStore } from '~/lib/puter';
import { generateUUID } from '~/lib/utils';

const Upload = () => {

    const {auth,isLoading,fs,ai,kv} = usePuterStore();
    const navigate=useNavigate();
    const [isProcessing,setisProcessing]=useState(false);
    const [statusText,setstatusText]=useState('');
    const [file, setfile] = useState<File|null>(null)
    const handleFileSelect=(file:File|null)=>{
        setfile(file)
    }

    const handleAnalyze=async({companyName,jobDescription,jobTitle,file}:{companyName:string,jobDescription:string,jobTitle:string,file:File})=>{
        setisProcessing(true);
        setstatusText("Uploading the File...");
        const uploadFile= await fs.upload([file]); 
        if(!uploadFile)return setstatusText("Error: Failed to uplaod File");
        
        setstatusText("converting to Image...");
        const imageFile=await convertPdfToImage(file);
        
        if(!imageFile.file)return setstatusText("Error:  Failed to convert PDF to Image");
        
        setstatusText("Uploading the Image...")
        const uploadedImage= await fs.upload([imageFile.file]);
        if(!uploadedImage)return setstatusText("Error: Failed to uplaod Image");

        setstatusText("Preparing Data...")

        const uuid=generateUUID();
        const data={
            id: uuid,
            resumePath: uploadFile.path, 
            imagePath: uploadedImage.path,
            companyName,jobDescription,jobTitle,file,
            feedback:""
        }

        await kv.set(`resume:${uuid}`,JSON.stringify(data));
        setstatusText("Analyzing...");

        const feedback = await ai.feedback(
            uploadFile.path,
            prepareInstructions({jobTitle,jobDescription})
        );
        if(!feedback)return setstatusText("Error: Failed to analyse resume")
        const FeedbackText = typeof feedback.message.content==='string'?feedback.message.content:feedback.message.content[0].text;

        data.feedback =JSON.parse(FeedbackText);
        await kv.set(`resume:${uuid}`,JSON.stringify(data));
        setstatusText("Analysis complete, re-directing...")
        console.log(data);

        navigate(`/resume/${uuid}`)
        
    }

    const handleSubmit =(e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault();
        const form=e.currentTarget.closest('form')
        if(!form) return;
        const formData=new FormData(form);
        const companyName=formData.get("company-name") as string;
        const jobTitle=formData.get("job-title")as string;
        const jobDescription=formData.get("job-description")as string;
        
        // console.log({
        //     compnyName,jobDescription,jobTitle,file
        // });
        
        if(!file) return;
        handleAnalyze({companyName,jobDescription,jobTitle,file})

    
    }

    return (
    <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar/> 
        <section className='main-section'>
            <div className="page-heading py-16">
                <h1>Smart Feedback for Your dream Job</h1>
                {isProcessing?(
                    <>
                        <h2>{statusText}</h2>
                        <img src="/images/resume-scan.gif" className='w-full'/>
                    </>
                ):(
                    <h2>Drop your resume for an ATS score and improvement tips</h2>
                )}
                {!isProcessing && (
                    <form id='upload-form' onSubmit={handleSubmit} className='flex flex-col gap-4 mt-8'>
                        <div className="form-div">
                            <label htmlFor="company-name">Company Name</label>
                            <input type="text" name="company-name" placeholder='company-name' id='company-name'/>
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-title">Job Title</label>
                            <input type="text" name="job-title" placeholder='job-title' id='job-title'/>
                        </div>
                        <div className="form-div">
                            <label htmlFor="job-description">Job Description</label>
                            <textarea rows={5} name="job-description" placeholder='job-description' id='job-description'/>
                        </div>
                        <div className="form-div">
                            <label htmlFor="uploader">Upload Resume</label>
                            <FileUploader onFileSelect={handleFileSelect}/>
                        </div>
                        <button className='primary-button' type="submit">
                            Analyze Resume
                        </button>
                    </form>
                )}
            </div>
        </section>
    </main>
  )
}

export default Upload