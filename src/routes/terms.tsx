import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/terms')({
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-messenger-dark text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
        <div className="space-y-6 text-white/80">
          <p>
            By using Messenger Wrapped, you agree to these terms of service.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Usage</h2>
          <p>
            Messenger Wrapped is provided as-is for personal, non-commercial use. You may use the service to analyze your own Facebook Messenger data.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Disclaimer</h2>
          <p>
            This tool is not affiliated with, endorsed by, or connected to Facebook, Meta, or Spotify. It is an independent project inspired by Spotify Wrapped.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Limitations</h2>
          <p>
            We are not responsible for any issues arising from the use of this tool. All data processing happens locally on your device.
          </p>
        </div>
      </div>
    </div>
  );
}
