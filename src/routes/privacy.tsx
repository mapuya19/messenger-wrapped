import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-messenger-dark text-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-white/80">
          <p>
            Messenger Wrapped processes all data locally in your browser. Your chat data is never uploaded to any server.
          </p>
          <p>
            When you upload your Facebook Messenger data export, the files are processed entirely within your browser using JavaScript. No data leaves your device.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Data Storage</h2>
          <p>
            Your chat data is temporarily stored in your browser's memory during your session. Once you close or refresh the page, all data is cleared.
          </p>
          <h2 className="text-xl font-semibold text-white mt-8 mb-4">Third Parties</h2>
          <p>
            We do not share any data with third parties. We do not use analytics, tracking cookies, or advertising.
          </p>
        </div>
      </div>
    </div>
  );
}
