export function parseLocalDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0);
}

export function buildDateFilter(days?: string, from?: string, to?: string) {
  const filter: { gte?: Date; lte?: Date } = {};
  const now = new Date();

  if (days !== undefined && days !== "") {
    const daysNum = parseInt(days, 10);

    if (daysNum === 0) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      filter.gte = today;
      filter.lte = todayEnd;
    } else {
      const daysAgo = new Date(now);
      daysAgo.setDate(now.getDate() - daysNum);
      filter.gte = daysAgo;
    }
  } else {
    if (from) {
      filter.gte = parseLocalDate(from);
    }
    if (to) {
      const toDate = parseLocalDate(to);
      toDate.setHours(23, 59, 59, 999);
      filter.lte = toDate;
    }
  }

  return Object.keys(filter).length > 0 ? filter : undefined;
}

export function buildQueryString(params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  return searchParams.toString();
}
