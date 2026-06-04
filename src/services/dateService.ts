export function getMonthRange(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1);

  const endDate = new Date(year, month, 0);
  endDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
  };
}

export function getQuarterRange(
  year: number,
  quarter: number
) {
  const startMonth = (quarter - 1) * 3;

  const startDate = new Date(
    year,
    startMonth,
    1
  );

  const endDate = new Date(
    year,
    startMonth + 3,
    0
  );

  endDate.setHours(
    23,
    59,
    59,
    999
  );

  return {
    startDate,
    endDate,
  };
}