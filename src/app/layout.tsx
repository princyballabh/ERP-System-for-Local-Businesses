import "../styles/globals.css";
import Navbar from "../components/Navbar";
import AIChatbot from "../components/AIChatbot";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen bg-gradient-to-b from-cream to-mint mb-16 md:mb-0">
          <Navbar />
          <main className="md:ml-56 flex-1 p-4 md:p-8 pb-20 md:pb-8">{children}</main>
          <AIChatbot />
        </div>
      </body>
    </html>
  );
}
