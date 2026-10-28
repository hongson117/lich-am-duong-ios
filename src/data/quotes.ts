import { CivilDate, dayNumber, mod } from '../lib/calendar';
import passages from './tao-passages.json';
export const TAO_SOURCE = 'https://zh.wikisource.org/wiki/道德經_(王弼本)';
export type TaoQuote = { chapter: number; original: string; text: string; meaning: string; practice: string; author: string };
// Public-domain original text; Vietnamese renderings and explanations newly authored for this app.
export const quotes: TaoQuote[] = passages;
export function dailyQuote(date: CivilDate) { return quotes[mod(dayNumber(date), quotes.length)]; }
