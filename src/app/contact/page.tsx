import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us - Meelo",
  description: "Get in touch with the Meelo team",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Contact Us
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Have a question, feedback, or need help? We&apos;d love to hear from you.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Get in Touch
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                <a
                  href="mailto:support@meelo.online"
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  support@meelo.online
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Website</p>
                <a
                  href="https://meelo.online"
                  className="text-purple-600 dark:text-purple-400 hover:underline"
                >
                  meelo.online
                </a>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-gray-700 dark:text-gray-300">India</p>
              </div>
            </div>
          </div>

          {/* Common Topics */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              How Can We Help?
            </h2>
            <ul className="space-y-3 text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Report a bug or technical issue</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Request account deletion</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Report inappropriate content or users</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Feature suggestions and feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-0.5">•</span>
                <span>Partnership or business inquiries</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Response Time */}
        <div className="mt-8 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">
            Response Time
          </h3>
          <p className="text-purple-800 dark:text-purple-300 text-sm">
            We typically respond within 24–48 hours. For urgent matters related to account
            security, please include &quot;URGENT&quot; in your email subject line.
          </p>
        </div>

        {/* FAQ quick links */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Answers
          </h2>
          <div className="space-y-4">
            <details className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
                How do I delete my account?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Send an email to support@meelo.online with the subject &quot;Account Deletion
                Request&quot; from the email address associated with your account. We will process
                your request within 7 days.
              </p>
            </details>
            <details className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
                How do I report an inappropriate activity?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Email us at support@meelo.online with the activity link or name, and describe the
                issue. We will review and take appropriate action within 24 hours.
              </p>
            </details>
            <details className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
                Is Meelo free to use?
              </summary>
              <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
                Yes, Meelo is completely free. You can create and join unlimited activities at no
                cost.
              </p>
            </details>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 flex gap-4 text-sm">
          <a href="/privacy" className="text-purple-600 dark:text-purple-400 hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="text-purple-600 dark:text-purple-400 hover:underline">
            Terms & Conditions
          </a>
          <a href="/" className="text-purple-600 dark:text-purple-400 hover:underline">
            ← Back to Meelo
          </a>
        </div>
      </div>
    </div>
  );
}
