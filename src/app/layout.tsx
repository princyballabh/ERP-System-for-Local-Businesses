import "../styles/globals.css";
import Navbar from "../components/Navbar";
import AIChatbot from "../components/AIChatbot";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen bg-gradient-to-b from-cream to-mint">
          <Navbar />
          <main className="ml-56 flex-1 p-8">{children}</main>
          <AIChatbot />
        </div>
      </body>
    </html>
  );
}
