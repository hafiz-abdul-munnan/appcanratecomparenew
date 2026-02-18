import React, { useState, useEffect, useRef } from 'react';
import { 
    StepType, 
    FunnelStep, 
    FormData, 
    VerificationState 
} from './types';
import { 
    ChevronDown, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle2, 
    Loader2, 
    Lock, 
    Truck, 
    CanRateCompareLogo,
    PROVINCES
} from './constants';
import { sendVerificationCode, checkVerificationCode } from './services/twilioService';

const WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/9687151/ugcg0z3/';

const CUSTOMER_IMAGES = [
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200&h=200',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200&h=200',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200'
];

const FUNNEL_STEPS: FunnelStep[] = [
    { 
        id: 'offeringBenefits', 
        question: 'Do you currently offer any group benefits?', 
        type: StepType.BUTTON_SELECTION, 
        options: ['Yes', 'No'] 
    },
    { 
        id: 'employeeCount', 
        question: 'How many employees do you currently have?', 
        type: StepType.BUTTON_SELECTION, 
        options: ['1 - 4', '5 - 9', '10 - 19', '20 - 49', '50+'] 
    },
    { 
        id: 'mainGoal', 
        question: 'What’s your main goal right now?', 
        type: StepType.BUTTON_SELECTION, 
        options: ['Reduce costs', 'Offer benefits for the first time', 'Improve employee retention', 'Compare plans at renewal'] 
    },
    { 
        id: 'contactTime', 
        question: 'When is the best time for us to contact you?', 
        type: StepType.BUTTON_SELECTION, 
        options: ['Morning (9am–12pm)', 'Afternoon (12pm–4pm)', 'Evening (4pm–7pm)'] 
    },
    { 
        id: 'province', 
        question: 'Which province do you live in?', 
        type: StepType.BUTTON_SELECTION, 
        options: PROVINCES 
    },
    { 
        id: 'contact', 
        question: 'Where should we send your quote?', 
        subtext: 'Enter your details below. We will verify your request via SMS.', 
        type: StepType.CONTACT_FORM 
    },
    { 
        id: 'otp', 
        question: 'Enter Verification Code', 
        subtext: 'We sent a 6-digit code to your phone number to verify your request.', 
        type: StepType.OTP_VERIFICATION 
    }
];

const Counter: React.FC<{ end: number }> = ({ end }) => {
    const [count, setCount] = useState(1);

    useEffect(() => {
        let startTime: number | null = null;
        const duration = 2500;

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / duration, 1);
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            setCount(1 + easeOutCubic * (end - 1));
            if (progress < 1) requestAnimationFrame(animate);
        };

        const animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [end]);

    return <span className="text-[#1e40af]">{count.toFixed(2)}K</span>;
};

const App: React.FC = () => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [formData, setFormData] = useState<FormData>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const topRef = useRef<HTMLDivElement>(null);

    const currentStep = FUNNEL_STEPS[currentStepIndex];

    useEffect(() => {
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentStepIndex]);

    const nextStep = () => {
        if (currentStepIndex < FUNNEL_STEPS.length - 1) {
            setCurrentStepIndex(prev => prev + 1);
            setError(null);
        } else {
            finalizeSubmission();
        }
    };

    const prevStep = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1);
            setError(null);
        }
    };

    const handleSelection = (value: string) => {
        setFormData(prev => ({ ...prev, [currentStep.id]: value }));
        setTimeout(nextStep, 200);
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, otp: e.target.value }));
    };

    const triggerSmsVerification = async () => {
        const { fullName, email, phone } = formData;
        if (!fullName || !email || !phone) {
            setError("Please fill in all details.");
            return;
        }

        const digits = phone.replace(/\D/g, '');
        if (digits.length < 10) {
            setError("Please enter a valid 10-digit phone number.");
            return;
        }

        setIsSubmitting(true);
        const success = await sendVerificationCode(phone);
        setIsSubmitting(false);

        if (success) {
            setCurrentStepIndex(FUNNEL_STEPS.findIndex(s => s.id === 'otp'));
            setError(null);
        } else {
            setError("Failed to send code. Please check your phone number.");
        }
    };

    const verifyAndSubmit = async () => {
        if (!formData.otp || formData.otp.length < 4) {
            setError("Please enter the code.");
            return;
        }

        setIsSubmitting(true);
        const isApproved = await checkVerificationCode(formData.phone!, formData.otp);

        if (isApproved) {
            finalizeSubmission();
        } else {
            setIsSubmitting(false);
            setError("Invalid verification code.");
        }
    };

    const finalizeSubmission = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                mode: 'no-cors',
                body: JSON.stringify(formData),
            });
            
            if (response.type === 'opaque' || response.ok) {
                if (typeof (window as any).fbq !== 'undefined') {
                    (window as any).fbq('track', 'Lead');
                }
                setIsSuccess(true);
            } else {
                setError("Submission failed. Please try again.");
            }
        } catch (e) {
            setIsSuccess(true);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col animate-fade-in font-sans bg-[#f4fcfe]">
                <header className="bg-white py-6 flex justify-center items-center shadow-sm">
                    <CanRateCompareLogo className="w-56 md:w-64" />
                </header>

                <main className="flex-grow flex flex-col items-center justify-center py-20 px-4 text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-[#034078] mb-6 tracking-tight">
                        Thank You for Completing the Survey!
                    </h1>
                    <p className="text-lg md:text-xl text-[#034078] italic mb-16 opacity-90 max-w-2xl">
                        One of our specialists from Can Rate Compare will contact you shortly to discuss your group benefits quote.
                    </p>
                    
                    <div className="flex flex-col items-center space-y-6">
                        <p className="text-sm font-bold text-[#034078]">20,000+ Satisfied Customers</p>
                        <div className="flex -space-x-1">
                            {CUSTOMER_IMAGES.map((url, i) => (
                                <img 
                                    key={i} 
                                    src={url} 
                                    className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-white shadow-md object-cover" 
                                    alt="Professional customer"
                                />
                            ))}
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex text-yellow-400 text-4xl mb-2 drop-shadow-sm">
                                <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                            </div>
                            <p className="text-[#034078] font-bold text-lg">4.9 Rating</p>
                        </div>
                    </div>
                </main>
                
                <footer className="bg-[#031930] py-10 text-white text-center">
                    <p className="text-sm font-bold">© 2025 Can Rate Compare. All Rights Reserved.</p>
                </footer>
            </div>
        );
    }

    return (
        <div ref={topRef} className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center min-h-screen">
            <CanRateCompareLogo className="w-64 mb-6" />
            
            <div className="text-center mb-6 px-2 animate-fade-in w-full">
                <h1 className="text-3xl md:text-5xl font-extrabold text-[#1a202c] mb-3 tracking-tight">
                    Get a Group Benefits quote in minutes
                </h1>
                <p className="text-xl text-[#1e40af] mb-6 font-medium">
                    Better coverage for your team, lower costs for your business.
                </p>
                <div className="flex flex-col items-center gap-2 mb-4">
                    <ChevronDown className="w-6 h-6 text-[#dc3545] animate-bounce" />
                    <h2 className="text-xl font-bold text-[#111827] mb-2">Group Benefits Request</h2>
                </div>
            </div>

            <div className="w-full bg-white rounded-[40px] shadow-2xl p-8 md:p-12 border border-slate-50 animate-slide-up relative">
                <div className="flex justify-between items-center mb-8">
                    {currentStepIndex > 0 ? (
                        <button onClick={prevStep} className="text-gray-400 hover:text-gray-600 font-bold flex items-center gap-1 text-sm uppercase tracking-wider transition-colors">
                            <ChevronLeft className="w-4 h-4" /> Back
                        </button>
                    ) : <div />}
                    <span className="text-xs font-black text-gray-300 tracking-widest uppercase">Step {currentStepIndex + 1} of {FUNNEL_STEPS.length}</span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 text-center leading-tight">{currentStep.question}</h2>
                {currentStep.subtext && <p className="text-gray-500 text-center mb-8">{currentStep.subtext}</p>}

                <div className="w-full h-1.5 bg-gray-100 rounded-full mb-10 overflow-hidden">
                    <div className="h-full bg-[#28a745] transition-all duration-500 ease-out" style={{ width: `${((currentStepIndex + 1) / FUNNEL_STEPS.length) * 100}%` }} />
                </div>

                {currentStep.type === StepType.BUTTON_SELECTION && (
                    <div className="grid gap-3">
                        {currentStep.options?.map(opt => (
                            <button 
                                key={opt}
                                onClick={() => handleSelection(opt)}
                                className={`w-full py-5 px-6 rounded-2xl font-bold text-lg text-center transition-all border-2 flex justify-center items-center gap-3 relative
                                    ${formData[currentStep.id] === opt 
                                        ? 'bg-[#28a745] text-white border-[#28a745] shadow-lg scale-[1.02]' 
                                        : 'bg-green-50/30 text-gray-700 border-green-50 hover:border-[#28a745] hover:bg-green-50'
                                    }`}
                            >
                                <span className="flex-1">{opt}</span>
                                {formData[currentStep.id] === opt && <CheckCircle2 className="w-6 h-6 shrink-0 absolute right-6" />}
                            </button>
                        ))}
                    </div>
                )}

                {currentStep.type === StepType.CONTACT_FORM && (
                    <div className="space-y-4 max-w-md mx-auto">
                        <input name="fullName" onChange={handleContactChange} placeholder="Full Name" className="w-full p-5 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#28a745] text-lg font-bold" />
                        <input name="phone" type="tel" onChange={handleContactChange} placeholder="Phone Number" className="w-full p-5 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#28a745] text-lg font-bold" />
                        <input name="email" type="email" onChange={handleContactChange} placeholder="Email Address" className="w-full p-5 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#28a745] text-lg font-bold" />
                        {error && <p className="text-red-500 font-bold text-center text-sm">{error}</p>}
                        <button onClick={triggerSmsVerification} disabled={isSubmitting} className="w-full bg-[#dc3545] hover:bg-[#c82333] text-white py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex justify-center items-center gap-2 uppercase tracking-tight transform hover:-translate-y-1">
                            {isSubmitting ? <Loader2 className="animate-spin w-6 h-6" /> : <>Get Free Quote <ChevronRight className="w-5 h-5" /></>}
                        </button>
                    </div>
                )}

                {currentStep.type === StepType.OTP_VERIFICATION && (
                    <div className="space-y-6 max-w-md mx-auto text-center">
                        <input maxLength={6} onChange={handleOtpChange} placeholder="000000" className="w-48 text-center p-5 border-4 border-gray-100 rounded-3xl text-5xl font-black font-mono focus:border-[#28a745] outline-none tracking-tighter" />
                        {error && <p className="text-red-500 font-bold">{error}</p>}
                        <button onClick={verifyAndSubmit} disabled={isSubmitting} className="w-full bg-[#28a745] text-white py-5 rounded-2xl font-black text-xl shadow-xl transition-all flex justify-center items-center gap-2 uppercase">
                            {isSubmitting ? <Loader2 className="animate-spin w-8 h-8" /> : "Verify & Finalize"}
                        </button>
                        <button onClick={triggerSmsVerification} className="text-[#28a745] font-bold text-sm hover:underline">Resend code</button>
                    </div>
                )}

                <div className="mt-12 flex justify-center items-center gap-2 text-[10px] font-black text-gray-300 uppercase tracking-widest border-t border-gray-50 pt-6">
                    <Lock className="w-3 h-3" />
                    Secure Lead Verification Powered by Twilio
                </div>
            </div>

            <div className="mt-12 text-center pb-20 space-y-8">
                <p className="text-gray-800 font-black text-xl flex items-center justify-center gap-2">
                    <Counter end={12.26} />+ Canadian Businesses Protected <Truck className="w-6 h-6 text-[#FBBC05] fill-[#FBBC05]" />
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-12 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-50">
                        <span className="font-black text-2xl tracking-tighter">
                            <span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span>
                        </span>
                        <span className="text-[#FBBC05] text-xl font-bold">★★★★★</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-50">
                        <span className="font-black text-2xl tracking-tighter text-[#1a1a1a]"><span className="text-[#00b67a]">Trustpilot</span></span>
                        <span className="text-[#00b67a] text-xl font-bold">★★★★★</span>
                    </div>
                </div>

                <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.3em]">Can Rate Compare &copy; {new Date().getFullYear()}. All Rights Reserved.</p>
            </div>
        </div>
    );
};

export default App;