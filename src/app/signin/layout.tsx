export default function SigninLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <div>{children}</div>
      </body>
    </html>
  );
}
