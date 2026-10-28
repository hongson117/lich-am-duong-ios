import { Memorial } from '../lib/memorials';
import { ReminderSettings } from '../lib/personal';
export async function enableNotifications() { return false; }
export async function syncNotifications(_m: Memorial[], _s: ReminderSettings) { return 0; }
export function listenNotifications(_onOpen: (route: string) => void) { return () => {}; }
