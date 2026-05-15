import "./globals.css";

export const metadata = {
  title: "ApnaTuition — Student Learning Management System",
  description: "Centralized platform for managing student notes, tests, scores, and educational games.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
