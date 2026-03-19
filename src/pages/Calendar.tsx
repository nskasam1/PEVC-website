import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PageWrapper from "@/components/PageWrapper";
import { CalendarDays } from "lucide-react";

const GOOGLE_CALENDAR_EMBED_URL =
  "https://calendar.google.com/calendar/embed?src=en.usa%23holiday%40group.v.calendar.google.com&ctz=America%2FNew_York";

const CalendarPage = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user || !["Admin", "PM", "Member"].includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <PageWrapper>
      <section className="min-h-screen pt-28 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <CalendarDays size={24} className="text-primary" />
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Team Calendar</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            Stay up to date with club events, deadlines, and meetings.
          </p>

          <div className="border border-border rounded-lg overflow-hidden bg-card">
            <iframe
              src={GOOGLE_CALENDAR_EMBED_URL}
              className="w-full border-0"
              style={{ height: "600px" }}
              title="PEVC Team Calendar"
            />
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            Replace the embed URL in <code className="text-primary/80">src/pages/Calendar.tsx</code> with your organization's Google Calendar.
          </p>
        </div>
      </section>
    </PageWrapper>
  );
};

export default CalendarPage;
