import { Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
};

export function NotificationsPanel({
  notifications
}: {
  notifications: NotificationItem[];
}) {
  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-300/10">
            <Bell className="h-4 w-4 text-cyan-200" />
          </div>
          <div>
            <h2 className="font-[var(--font-display)] text-xl font-semibold text-white">
              Notification Center
            </h2>
            <p className="text-sm text-white/48">Latest admin-facing platform alerts.</p>
          </div>
        </div>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div key={notification.id} className="rounded-[20px] border border-white/10 bg-white/4 p-4">
              <p className="font-medium text-white">{notification.title}</p>
              <p className="mt-2 text-sm leading-7 text-white/58">{notification.message}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
