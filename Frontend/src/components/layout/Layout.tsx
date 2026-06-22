import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} AI Travel Planner. Powered by Google Gemini.</p>
      </footer>
    </div>
  );
}
