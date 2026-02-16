import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function CandidateLanding() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 pt-32 pb-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6">
                    Find Your Next <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Dream Job</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                    Get discovered by top companies, showcase your skills, and get AI-powered insights on your applications.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/jobs"
                        className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-8 py-4 h-14 font-bold hover:shadow-lg transition-all hover:-translate-y-1"
                    >
                        Browse Jobs
                    </Link>
                    <Link
                        href="/auth/signup"
                        className="inline-flex items-center justify-center rounded-full bg-white text-gray-900 border border-gray-200 px-8 py-4 h-14 font-bold hover:shadow-md transition-all hover:-translate-y-1"
                    >
                        Create Profile
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 mt-20 grid md:grid-cols-3 gap-8">
                {[
                    { title: "Smart Matching", desc: "Our AI matches your profile with jobs that perfectly fit your skills." },
                    { title: "Application Tracking", desc: "Real-time updates on your application status and feedback." },
                    { title: "Skill Insights", desc: "Detailed analysis of how your profile ranks against job requirements." }
                ].map((f, i) => (
                    <div key={i} className="glass p-8 rounded-2xl">
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{f.title}</h3>
                        <p className="text-gray-600">{f.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
