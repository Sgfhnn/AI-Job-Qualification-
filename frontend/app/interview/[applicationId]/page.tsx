'use client'
import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-job-qualification.onrender.com'

export default function InterviewPage() {
    const params = useParams()
    const applicationId = params.applicationId as string
    const router = useRouter()

    const [status, setStatus] = useState('waiting_to_start') // waiting_to_start, initializing, ready, listening, processing, speaking, completed
    const [transcript, setTranscript] = useState<{ role: string, content: string }[]>([])
    const [interimText, setInterimText] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [mounted, setMounted] = useState(false)

    // Web Speech API refs
    const recognitionRef = useRef<any>(null)
    const synthesisRef = useRef<any>(null)
    const statusRef = useRef(status)

    // Keep statusRef in sync
    useEffect(() => {
        statusRef.current = status;
    }, [status]);

    useEffect(() => {
        setMounted(true)
        if (typeof window !== 'undefined') {
            // Initialize Speech Synthesis
            synthesisRef.current = window.speechSynthesis;

            // Initialize Speech Recognition
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event: any) => {
                    let interimTranscript = '';
                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            const speechResult = event.results[i][0].transcript;
                            console.log('🎤 Final Result:', speechResult);
                            setInterimText('');
                            handleUserResponse(speechResult);
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }
                    if (interimTranscript) {
                        setInterimText(interimTranscript);
                    }
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error('Speech recognition error', event.error);
                    if (event.error === 'not-allowed') {
                        setError('Microphone permission denied. Please enable microphone access.');
                    } else if (event.error === 'network') {
                        setError('Speech recognition network error. Please check your internet.');
                    } else {
                        setStatus('ready'); // Reset to ready on error so user can try again
                    }
                };

                recognitionRef.current.onend = () => {
                    // Check latest status via statusRef to avoid stale closures
                    if (statusRef.current === 'listening') {
                        setInterimText('');
                        setStatus('ready');
                    }
                };
            } else {
                setError('Speech recognition not supported in this browser. Please use Chrome.');
            }
        }

        return () => {
            if (recognitionRef.current) {
                try { recognitionRef.current.stop(); } catch (e) { }
            }
            if (synthesisRef.current) synthesisRef.current.cancel();
        }
    }, [])

    const startInterview = async () => {
        setStatus('initializing');
        try {
            // Wake up speech synthesis with a silent click-based gesture first
            const silent = new SpeechSynthesisUtterance("");
            synthesisRef.current?.speak(silent);

            const response = await fetch(`${API_BASE_URL}/api/interview/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId })
            });
            const data = await response.json();

            if (data.success) {
                setTranscript([{ role: 'assistant', content: data.message }]);
                speak(data.message);
            } else {
                setError(data.error || 'Failed to start interview');
            }
        } catch (e) {
            console.error("Start error:", e);
            setError('Connection error. Please ensure the server is running.');
        }
    }

    const handleUserResponse = async (text: string) => {
        if (!text.trim()) {
            setStatus('ready');
            return;
        }

        setStatus('processing');
        setTranscript(prev => [...prev, { role: 'user', content: text }]);

        try {
            const response = await fetch(`${API_BASE_URL}/api/interview/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId, message: text })
            });
            const data = await response.json();

            if (data.success) {
                setTranscript(prev => [...prev, { role: 'assistant', content: data.message }]);
                speak(data.message);
            } else {
                setError(data.error || 'The interview session was lost. Please try refreshing.');
                setStatus('ready');
            }
        } catch (e) {
            console.error('Chat error:', e);
            setError('Connection lost. Please check your internet.');
            setStatus('ready');
        }
    }

    const speak = (text: string) => {
        if (!synthesisRef.current) {
            setStatus('ready');
            return;
        }

        setStatus('speaking');
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            setStatus('ready');
        };

        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setStatus('ready');
        };

        synthesisRef.current.speak(utterance);
    }

    const startListening = () => {
        if (recognitionRef.current && status === 'ready') {
            try {
                // Ensure audio context is resumed (browser policy)
                recognitionRef.current.start();
                setStatus('listening');
            } catch (e) {
                console.error("Start error:", e);
            }
        }
    }

    const endInterview = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/interview/end`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ applicationId })
            });
            const data = await response.json();
            if (data.success) {
                setStatus('completed');
            }
        } catch (e) {
            console.error("End error", e);
        }
    }

    if (!mounted) return null;

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'completed') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50">
                <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                    <div className="text-green-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Interview Completed</h2>
                    <p className="text-gray-600">Thank you for your time. The recruiter will be in touch shortly.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col">
            {/* Header */}
            <div className="bg-gray-800 p-4 shadow-md flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold">Live Interview Session</span>
                </div>
                <button
                    onClick={endInterview}
                    className="text-gray-400 hover:text-white text-sm"
                >
                    End Interview
                </button>
            </div>

            {/* Visualizer / Avatar Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {/* Visualizer Circles */}
                <div className={`absolute w-64 h-64 border-2 border-blue-500 rounded-full transition-all duration-500 opacity-20 ${status === 'speaking' ? 'scale-125' : 'scale-100'
                    }`}></div>
                <div className={`absolute w-48 h-48 border-2 border-indigo-500 rounded-full transition-all duration-500 opacity-30 ${status === 'speaking' ? 'scale-110' : 'scale-100'
                    }`}></div>

                {/* Main Avatar */}
                <div className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 cursor-pointer ${status === 'listening' ? 'bg-red-600 shadow-red-900/50 scale-110' :
                    status === 'speaking' ? 'bg-blue-600 shadow-blue-900/50' :
                        status === 'processing' ? 'bg-purple-600 animate-pulse' :
                            status === 'waiting_to_start' ? 'bg-green-600 hover:bg-green-700 shadow-green-900/40' :
                                'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-900/40'
                    }`}
                    onClick={status === 'ready' ? startListening : status === 'waiting_to_start' ? startInterview : undefined}
                >
                    {(status === 'listening' || status === 'ready' || status === 'waiting_to_start') && (
                        <svg className={`w-12 h-12 text-white ${(status === 'ready' || status === 'waiting_to_start') ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {status === 'waiting_to_start' ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            )}
                        </svg>
                    )}
                    {status === 'speaking' && (
                        <div className="space-y-1">
                            <div className="w-16 h-1 bg-white rounded-full animate-pulse"></div>
                            <div className="w-10 h-1 bg-white rounded-full animate-pulse mx-auto"></div>
                            <div className="w-14 h-1 bg-white rounded-full animate-pulse mx-auto"></div>
                        </div>
                    )}
                    {status === 'processing' && (
                        <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]"></div>
                        </div>
                    )}
                    {status === 'initializing' && (
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent"></div>
                    )}
                </div>

                <p className="mt-8 text-xl font-light text-gray-300 min-h-[3rem] text-center max-w-2xl px-4 uppercase tracking-widest text-sm">
                    {status === 'listening' ? (
                        <span className="text-red-400 font-bold animate-pulse">
                            {interimText || "Listening..."}
                        </span>
                    ) :
                        status === 'processing' ? "Analyzing Response..." :
                            status === 'speaking' ? "Interviewer is speaking..." :
                                status === 'waiting_to_start' ? "Ready to begin?" :
                                    status === 'initializing' ? "Setting up interview..." :
                                        "Ready. Tap the microphone to answer"}
                </p>

                {status === 'waiting_to_start' && (
                    <button
                        onClick={startInterview}
                        className="mt-8 bg-green-600 hover:bg-green-700 text-white font-black py-4 px-10 rounded-full shadow-2xl transform transition hover:scale-105 active:scale-95 uppercase tracking-tighter text-lg"
                    >
                        Start Interview
                    </button>
                )}

                {status === 'ready' && (
                    <button
                        onClick={startListening}
                        className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 px-10 rounded-full shadow-2xl transform transition hover:scale-105 active:scale-95 uppercase tracking-tighter text-lg"
                    >
                        Click to Speak
                    </button>
                )}
            </div>

            {/* Transcript Area (Optional - maybe hidden or bottom sheet) */}
            <div className="bg-gray-800 p-4 max-h-48 overflow-y-auto border-t border-gray-700">
                <div className="max-w-3xl mx-auto space-y-2">
                    {transcript.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
