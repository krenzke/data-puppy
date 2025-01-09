import { utcFormat } from "d3-time-format";
import {
  timeSecond,
  timeMinute,
  timeHour,
  timeDay,
  timeWeek,
  timeMonth,
  timeYear,
} from "d3-time";

const formatMillisecond = utcFormat(".%L");
const formatSecond = utcFormat(":%S");
const formatMinute = utcFormat("%I:%M");
const formatHour = utcFormat("%I %p");
const formatDay = utcFormat("%a %d");
const formatWeek = utcFormat("%b %d");
const formatMonth = utcFormat("%B");
const formatYear = utcFormat("%Y");

function dateToAxixLabel(date: Date) {
  return (
    timeSecond(date) < date
      ? formatMillisecond
      : timeMinute(date) < date
      ? formatSecond
      : timeHour(date) < date
      ? formatMinute
      : timeDay(date) < date
      ? formatHour
      : timeMonth(date) < date
      ? timeWeek(date) < date
        ? formatDay
        : formatWeek
      : timeYear(date) < date
      ? formatMonth
      : formatYear
  )(date);
}

function unixTimestampToISOString(t: number): string {
  const date = new Date(t * 1000);
  return date.toISOString();
}

function dateToISOString(date: Date): string {
  return date.toISOString();
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function unixTimestampRelativeTimeSinceNow(t: number): string {
  const units: { name: Intl.RelativeTimeFormatUnit; duration: number }[] = [
    { name: "year", duration: 24 * 60 * 60 * 1000 * 365 },
    { name: "month", duration: (24 * 60 * 60 * 1000 * 365) / 12 },
    { name: "day", duration: 24 * 60 * 60 * 1000 },
    { name: "hour", duration: 60 * 60 * 1000 },
    { name: "minute", duration: 60 * 1000 },
    { name: "second", duration: 1000 },
  ];

  const now = new Date();
  const then = new Date(t * 1000);
  const elapsed: number = then.getTime() - now.getTime();

  // "Math.abs" accounts for both "past" & "future" scenarios
  for (const e of units) {
    if (Math.abs(elapsed) > e.duration) {
      return rtf.format(Math.round(elapsed / e.duration), e.name);
    }
  }
  return rtf.format(Math.round(elapsed / 1000), "second");
}

export {
  unixTimestampToISOString,
  dateToISOString,
  unixTimestampRelativeTimeSinceNow,
  dateToAxixLabel,
};
