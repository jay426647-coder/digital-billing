export const MONTH_NAMES_HI = ['', 'जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];

export function getCurrentCycle() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const financial_year = month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  return { month, financial_year };
}

export function getCalendarYear(financial_year, month) {
  const [startYear, endYear] = financial_year.split('-').map(Number);
  return month >= 4 ? startYear : endYear;
}

export function getAbsoluteMonthIndex(financial_year, month) {
  const calYear = getCalendarYear(financial_year, month);
  return calYear * 12 + month;
}

export function getMonthsOverdue(bill, currentMonth, currentFinancialYear) {
  const billIdx = getAbsoluteMonthIndex(bill.financial_year, bill.month);
  const currentIdx = getAbsoluteMonthIndex(currentFinancialYear, currentMonth);
  return Math.max(0, currentIdx - billIdx);
}

export function formatBillPeriod(bill) {
  const calYear = getCalendarYear(bill.financial_year, bill.month);
  return `${MONTH_NAMES_HI[bill.month]} ${calYear}`;
}
