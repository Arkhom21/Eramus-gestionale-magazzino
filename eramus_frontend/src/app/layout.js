import 'bootstrap-italia/dist/css/bootstrap-italia.min.css';
import "./globals.css";

export const metadata = {
  title: "ERAMUS - Gestionale",
  description: "Progetto Web Avanzato - Eramus",[cite: 1]
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body className="vh-100">
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}