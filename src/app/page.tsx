import Image from "next/image";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Your Personal AI Diary
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Write, Reflect, Evolve with AI-powered insights
          </p>
          <GoogleSignInButton />
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            title="Voice Input"
            description="Speak your thoughts naturally with our advanced voice-to-text feature"
          />
          <FeatureCard 
            title="AI-Powered Insights"
            description="Get personalized suggestions and emotional analysis of your entries"
          />
          <FeatureCard 
            title="Secure & Private"
            description="Your thoughts are encrypted and protected with industry-standard security"
          />
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300">
        {description}
      </p>
    </div>
  );
}
