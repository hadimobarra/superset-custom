import {
  gregorianToPersian,
  persianToGregorian,
  formatPersianDate,
  getCurrentPersianDate,
  isValidPersianDate,
  isPersianLocale,
  isRTLLayout,
  ensureJalaliDayjsPlugin,
  PERSIAN_MONTHS,
  PERSIAN_WEEKDAYS,
} from 'src/utils/persianCalendar';

const defaultDir = document.documentElement.dir;
const defaultLang = document.documentElement.lang;
const defaultNavigatorLanguage = navigator.language;
const defaultNavigatorLanguages = [...navigator.languages];

const setNavigatorLanguage = (language?: string, languages?: string[]) => {
  Object.defineProperty(window.navigator, 'language', {
    value: language,
    configurable: true,
  });
  Object.defineProperty(window.navigator, 'languages', {
    value: languages,
    configurable: true,
  });
};

afterEach(() => {
  document.documentElement.dir = defaultDir;
  document.documentElement.lang = defaultLang;
  setNavigatorLanguage(defaultNavigatorLanguage, defaultNavigatorLanguages);
});

// --- gregorianToPersian ---

test('gregorian dates map to correct Persian weekday names', () => {
  expect(gregorianToPersian(2024, 3, 31).weekday).toBe('یکشنبه');
  expect(gregorianToPersian(2024, 4, 1).weekday).toBe('دوشنبه');
});

test('gregorianToPersian returns correct month names', () => {
  const result = gregorianToPersian(2024, 3, 21);
  expect(result.monthName).toBe('فروردین');
  expect(PERSIAN_MONTHS).toHaveLength(12);
  expect(PERSIAN_MONTHS[0]).toBe('فروردین');
  expect(PERSIAN_MONTHS[11]).toBe('اسفند');
});

test('gregorianToPersian converts Nowruz 2024 correctly', () => {
  const result = gregorianToPersian(2024, 3, 20);
  expect(result.year).toBe(1403);
  expect(result.month).toBe(1);
  expect(result.day).toBe(1);
  expect(result.monthName).toBe('فروردین');
});

test('gregorianToPersian converts end of Jalali year', () => {
  const result = gregorianToPersian(2024, 3, 19);
  expect(result.year).toBe(1402);
  expect(result.month).toBe(12);
  expect(result.day).toBe(29);
  expect(result.monthName).toBe('اسفند');
});

test('gregorianToPersian converts mid-year date', () => {
  const result = gregorianToPersian(2024, 9, 22);
  expect(result.year).toBe(1403);
  expect(result.month).toBeGreaterThanOrEqual(1);
  expect(result.month).toBeLessThanOrEqual(12);
});

test('gregorianToPersian weekday starts correctly from Saturday (shanbeh)', () => {
  expect(PERSIAN_WEEKDAYS[0]).toBe('شنبه');
  expect(PERSIAN_WEEKDAYS[6]).toBe('جمعه');
  const result = gregorianToPersian(2024, 4, 6); // Saturday
  expect(result.weekday).toBe('شنبه');
});

// --- persianToGregorian ---

test('persianToGregorian converts Nowruz 1403 back to Gregorian', () => {
  const result = persianToGregorian(1403, 1, 1);
  expect(result.year).toBe(2024);
  expect(result.month).toBe(3);
  expect(result.day).toBe(20);
});

test('persianToGregorian converts end of Jalali 1402', () => {
  const result = persianToGregorian(1402, 12, 29);
  expect(result.year).toBe(2024);
  expect(result.month).toBe(3);
  expect(result.day).toBe(19);
});

test('persianToGregorian throws on invalid Jalali date', () => {
  expect(() => persianToGregorian(1403, 13, 1)).toThrow();
  expect(() => persianToGregorian(1403, 0, 1)).toThrow();
  expect(() => persianToGregorian(1403, 1, 0)).toThrow();
});

// --- round-trip conversion ---

test('gregorian -> persian -> gregorian round-trip preserves dates', () => {
  const testDates = [
    [2024, 1, 15],
    [2024, 6, 15],
    [2024, 12, 31],
    [2025, 3, 20],
    [2000, 7, 1],
  ];
  for (const [gYear, gMonth, gDay] of testDates) {
    const persian = gregorianToPersian(gYear, gMonth, gDay);
    const backToGregorian = persianToGregorian(
      persian.year,
      persian.month,
      persian.day,
    );
    expect(backToGregorian.year).toBe(gYear);
    expect(backToGregorian.month).toBe(gMonth);
    expect(backToGregorian.day).toBe(gDay);
  }
});

// --- formatPersianDate ---

test('formatPersianDate pads month and day with zeros', () => {
  expect(formatPersianDate(1403, 1, 1)).toBe('1403/01/01');
  expect(formatPersianDate(1403, 12, 29)).toBe('1403/12/29');
  expect(formatPersianDate(1403, 6, 15)).toBe('1403/06/15');
});

test('formatPersianDate uses Persian month numbers', () => {
  const result = formatPersianDate(1403, 1, 1);
  expect(result).toBe('1403/01/01');
});

// --- getCurrentPersianDate ---

test('getCurrentPersianDate returns a valid Persian date', () => {
  const now = new Date();
  const persian = getCurrentPersianDate();
  const expected = gregorianToPersian(
    now.getFullYear(),
    now.getMonth() + 1,
    now.getDate(),
  );
  expect(persian.year).toBe(expected.year);
  expect(persian.month).toBe(expected.month);
  expect(persian.day).toBe(expected.day);
  expect(persian.monthName).toBe(expected.monthName);
  expect(persian.weekday).toBe(expected.weekday);
});

// --- isValidPersianDate ---

test('isValidPersianDate validates correct dates', () => {
  expect(isValidPersianDate(1403, 1, 1)).toBe(true);
  expect(isValidPersianDate(1403, 12, 29)).toBe(true);
  expect(isValidPersianDate(1399, 6, 31)).toBe(true);
});

test('isValidPersianDate rejects invalid dates', () => {
  expect(isValidPersianDate(1403, 13, 1)).toBe(false);
  expect(isValidPersianDate(1403, 0, 1)).toBe(false);
  expect(isValidPersianDate(1403, 1, 0)).toBe(false);
  expect(isValidPersianDate(1403, 1, 32)).toBe(false);
});

// --- isPersianLocale ---

test('detects Persian locale from navigator languages', () => {
  document.documentElement.dir = '';
  document.documentElement.lang = '';
  setNavigatorLanguage('fa-IR', ['fa-IR']);

  expect(isPersianLocale()).toBe(true);
  expect(isRTLLayout()).toBe(true);
});

test('detects Persian locale from document lang attribute', () => {
  document.documentElement.lang = 'fa';
  document.documentElement.dir = '';
  setNavigatorLanguage('en-US', ['en-US']);

  expect(isPersianLocale()).toBe(true);
});

test('detects Persian locale from navigator.language only', () => {
  document.documentElement.lang = '';
  document.documentElement.dir = '';
  setNavigatorLanguage('fa', []);

  expect(isPersianLocale()).toBe(true);
});

test('does not detect Persian locale for English', () => {
  document.documentElement.lang = 'en-US';
  document.documentElement.dir = 'ltr';
  setNavigatorLanguage('en-US', ['en-US']);

  expect(isPersianLocale()).toBe(false);
});

test('detects Persian locale from navigator.languages array', () => {
  document.documentElement.lang = '';
  document.documentElement.dir = '';
  setNavigatorLanguage('en-US', ['en-US', 'fa-IR']);

  expect(isPersianLocale()).toBe(true);
});

// --- isRTLLayout ---

test('detects RTL when document direction is rtl', () => {
  document.documentElement.dir = 'rtl';
  document.documentElement.lang = 'en-US';
  setNavigatorLanguage('en-US', ['en-US']);

  expect(isRTLLayout()).toBe(true);
});

test('detects RTL when lang starts with fa', () => {
  document.documentElement.dir = '';
  document.documentElement.lang = 'fa-IR';
  setNavigatorLanguage('en-US', ['en-US']);

  expect(isRTLLayout()).toBe(true);
});

test('returns false for LTR English layout', () => {
  document.documentElement.dir = 'ltr';
  document.documentElement.lang = 'en-US';
  setNavigatorLanguage('en-US', ['en-US']);

  expect(isRTLLayout()).toBe(false);
});

test('isRTLLayout falls back to isPersianLocale when no dir or lang set', () => {
  document.documentElement.dir = '';
  document.documentElement.lang = '';
  setNavigatorLanguage('fa-IR', ['fa-IR']);

  expect(isRTLLayout()).toBe(true);
});

// --- ensureJalaliDayjsPlugin ---

test('ensureJalaliDayjsPlugin loads successfully', () => {
  const result = ensureJalaliDayjsPlugin();
  expect(result).toBe(true);
});

test('ensureJalaliDayjsPlugin is idempotent on subsequent calls', () => {
  const first = ensureJalaliDayjsPlugin();
  const second = ensureJalaliDayjsPlugin();
  expect(first).toBe(true);
  expect(second).toBe(true);
});

// --- PERSIAN_MONTHS and PERSIAN_WEEKDAYS ---

test('PERSIAN_MONTHS has 12 months', () => {
  expect(PERSIAN_MONTHS).toHaveLength(12);
  PERSIAN_MONTHS.forEach(month => {
    expect(typeof month).toBe('string');
    expect(month.length).toBeGreaterThan(0);
  });
});

test('PERSIAN_WEEKDAYS has 7 days', () => {
  expect(PERSIAN_WEEKDAYS).toHaveLength(7);
  PERSIAN_WEEKDAYS.forEach(day => {
    expect(typeof day).toBe('string');
    expect(day.length).toBeGreaterThan(0);
  });
});

// --- Conversion edge cases ---

test('gregorianToPersian handles leap year', () => {
  const result = gregorianToPersian(2024, 2, 29);
  expect(result.year).toBe(1402);
  expect(result.month).toBe(12);
  expect(result.day).toBe(10);
});

test('gregorianToPersian handles year boundary', () => {
  const dec31 = gregorianToPersian(2023, 12, 31);
  const jan1 = gregorianToPersian(2024, 1, 1);
  expect(dec31.year).toBe(1402);
  expect(jan1.year).toBe(1402);
});

test('persianToGregorian handles Esfand 29 in leap year', () => {
  const result = persianToGregorian(1402, 12, 29);
  expect(result.year).toBe(2024);
  expect(result.month).toBe(3);
  expect(result.day).toBe(19);
});

test('persianToGregorian handles 6-month date', () => {
  const result = persianToGregorian(1403, 6, 15);
  expect(result.year).toBe(2024);
  expect(result.month).toBe(9);
  expect(result.day).toBe(5);
});