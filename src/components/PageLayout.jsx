export default function PageLayout({ children, className = '' }) {
  return (
    <main className={`page-content ${className}`}>
      {children}
    </main>
  );
}
