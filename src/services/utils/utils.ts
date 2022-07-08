const addDaysToDate = (date: Date, days: number) => {
  return new Date(date.setDate(date.getDate() + days));
};

const returnBookOnTime = (date: Date) => {
  const returnBookDate = date.getTime();
  const now = new Date().getTime();

  return now < returnBookDate;
};

export { addDaysToDate, returnBookOnTime };
