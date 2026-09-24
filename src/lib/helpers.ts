import { eachDayOfInterval, format, startOfDay, startOfMonth } from "date-fns";

export const formatPrice = (
  value: number,
  currency: string = "INR",
): string => {
  const locale = currency === "INR" ? "en-IN" : undefined;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};

export function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function currentMonthDays() {
  const today = startOfDay(new Date());
  return eachDayOfInterval({ start: startOfMonth(today), end: today }).map(
    (d) => ({ key: dayKey(d), label: format(d, "d MMM") }),
  );
}
