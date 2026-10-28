import * as Notifications from 'expo-notifications';
import { Memorial } from '../lib/memorials';
import { ReminderSettings } from '../lib/personal';
import { reminderPlan } from '../lib/reminders';
Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false }) });
export async function enableNotifications() {
  const permission = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowSound: true, allowBadge: false } });
  return permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
}
let queue: Promise<number> = Promise.resolve(0);
export function syncNotifications(memorials: Memorial[], settings: ReminderSettings): Promise<number> {
  const run = async () => {
    const permission = await Notifications.getPermissionsAsync();
    const permitted = permission.granted || permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
    const desired = permitted ? reminderPlan(memorials, settings) : [];
    const pending = (await Notifications.getAllScheduledNotificationsAsync()).filter(n => n.identifier.startsWith('lad-'));
    const desiredMap = new Map(desired.map(d => [d.id, d]));
    for (const n of pending) { const match = desiredMap.get(n.identifier); if (!match || n.content.data?.at !== match.at) await Notifications.cancelScheduledNotificationAsync(n.identifier); else desiredMap.delete(n.identifier); }
    for (const r of desiredMap.values()) await Notifications.scheduleNotificationAsync({ identifier: r.id, content: { title: r.title, body: r.body, sound: 'default', data: { route: r.route, at: r.at } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(r.at) } });
    if (!permitted && (settings.memorials || settings.lunarDays)) throw new Error('Thông báo đang bị tắt trong Cài đặt iOS.');
    return desired.length;
  };
  const result = queue.catch(() => 0).then(run); queue = result; return result;
}
export function listenNotifications(onOpen: (route: string) => void) {
  const handle = (r: Notifications.NotificationResponse | null) => { const route = r?.notification.request.content.data?.route; if (route === 'today' || route === 'memorials') onOpen(route); };
  void Notifications.getLastNotificationResponseAsync().then(handle).catch(() => {});
  const subscription = Notifications.addNotificationResponseReceivedListener(handle);
  return () => subscription.remove();
}
