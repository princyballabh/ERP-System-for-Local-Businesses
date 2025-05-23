import "../styles/globals.css";
import Navbar from "../components/Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <div className="flex min-h-screen bg-gradient-to-b from-cream to-mint">
          <Navbar />
          <main className="flex-1 p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
