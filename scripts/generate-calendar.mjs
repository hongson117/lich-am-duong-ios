// Generate Vietnamese lunisolar month boundaries using Astronomy Engine (MIT).
// Rules: UTC+7 civil new-moon days, month 11 contains winter solstice;
// in a 13-month solstice cycle, the first month without a principal term is leap.
import { SearchMoonPhase, Seasons, SunPosition } from 'astronomy-engine';
import { writeFileSync } from 'node:fs';

const DAY = 86400000;
const vnDay = (d) => Math.floor((d.getTime() + 7 * 3600000) / DAY);
const midnight = (day) => new Date(day * DAY - 7 * 3600000);
const rows = [];
for (let year = 1898; year <= 2101; year++) {
  const a = vnDay(Seasons(year).dec_solstice.date);
  const b = vnDay(Seasons(year + 1).dec_solstice.date);
  let cursor = new Date((a - 40) * DAY);
  const moons = [];
  while (true) {
    const moon = SearchMoonPhase(0, cursor, 35);
    if (!moon) throw new Error(`No new moon: ${year}`);
    const day = vnDay(moon.date);
    moons.push(day);
    if (day > b + 32) break;
    cursor = new Date(moon.date.getTime() + 20 * DAY);
  }
  const first = moons.findIndex((v, i) => v <= a && moons[i + 1] > a);
  const last = moons.findIndex((v, i) => v <= b && moons[i + 1] > b);
  const count = last - first;
  if (![12, 13].includes(count)) throw new Error(`Invalid cycle ${year}: ${count}`);
  let leap = -1;
  if (count === 13) {
    for (let i = 1; i < count; i++) {
      const startSector = Math.floor(SunPosition(midnight(moons[first + i])).elon / 30);
      const endSector = Math.floor(SunPosition(midnight(moons[first + i + 1])).elon / 30);
      if (startSector === endSector) { leap = i; break; }
    }
    if (leap < 0) throw new Error(`Missing leap month: ${year}`);
  }
  for (let i = 0; i < count; i++) {
    const month = ((10 + i - (leap >= 0 && i >= leap ? 1 : 0)) % 12) + 1;
    rows.push([moons[first + i], month, month >= 11 ? year : year + 1, i === leap ? 1 : 0]);
  }
}
writeFileSync(new URL('../src/data/lunar-months.json', import.meta.url), JSON.stringify(rows));
console.log(`Generated ${rows.length} lunar months (UTC+7), 1898–2102.`);
