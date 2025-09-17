export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: January 2025
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                We collect information you provide directly to us, such as when you create an account, post a job, submit an application, or contact us for support.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, company information</li>
                <li><strong>Job Postings:</strong> Job titles, descriptions, requirements, and form configurations</li>
                <li><strong>Application Data:</strong> Resume files, form responses, and candidate information</li>
                <li><strong>Usage Data:</strong> How you interact with our platform and services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
              <p className="text-gray-600 mb-4">
                We use the information we collect to provide, maintain, and improve our services:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Process job applications and provide AI-powered candidate analysis</li>
                <li>Generate custom application forms based on job requirements</li>
                <li>Communicate with you about your account and our services</li>
                <li>Improve our AI algorithms and platform functionality</li>
                <li>Ensure platform security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties except as described below:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our platform</li>
                <li><strong>Legal Requirements:</strong> We may disclose information when required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement appropriate security measures to protect your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and authentication measures</li>
                <li>Secure cloud infrastructure with enterprise-grade protection</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <p className="text-gray-600 mb-4">
                We retain your information for as long as necessary to provide our services and comply with legal obligations:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Account information: Until account deletion</li>
                <li>Job postings and applications: 7 years for compliance purposes</li>
                <li>Resume files: 3 years or until deletion requested</li>
                <li>Usage data: 2 years for analytics and improvement</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Rights</h2>
              <p className="text-gray-600 mb-4">
                You have certain rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Opt out of certain data processing activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. AI and Automated Processing</h2>
              <p className="text-gray-600 mb-4">
                Our platform uses artificial intelligence to analyze resumes and rank candidates. This automated processing:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Is designed to reduce bias and improve hiring decisions</li>
                <li>Provides explanations for AI-generated scores and rankings</li>
                <li>Can be reviewed and overridden by human decision-makers</li>
                <li>Is continuously monitored and improved for fairness</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Contact Us</h2>
              <p className="text-gray-600 mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@aihire.com<br/>
                  <strong>Address:</strong> 123 Tech Street, San Francisco, CA 94105<br/>
                  <strong>Phone:</strong> +1 (555) 123-4567
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
