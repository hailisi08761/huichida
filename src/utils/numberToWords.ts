import { PiLanguage } from '../types/pi';

// ---------------- ENGLISH ----------------
const EN_ONES = [
  '',
  'ONE',
  'TWO',
  'THREE',
  'FOUR',
  'FIVE',
  'SIX',
  'SEVEN',
  'EIGHT',
  'NINE',
  'TEN',
  'ELEVEN',
  'TWELVE',
  'THIRTEEN',
  'FOURTEEN',
  'FIFTEEN',
  'SIXTEEN',
  'SEVENTEEN',
  'EIGHTEEN',
  'NINETEEN',
];

const EN_TENS = [
  '',
  '',
  'TWENTY',
  'THIRTY',
  'FORTY',
  'FIFTY',
  'SIXTY',
  'SEVENTY',
  'EIGHTY',
  'NINETY',
];

const EN_SCALES = ['', 'THOUSAND', 'MILLION', 'BILLION', 'TRILLION'];

function enHundreds(num: number): string {
  const parts: string[] = [];
  const hundreds = Math.floor(num / 100);
  const remainder = num % 100;

  if (hundreds > 0) parts.push(`${EN_ONES[hundreds]} HUNDRED`);
  if (remainder > 0) {
    if (hundreds > 0) parts.push('AND');
    if (remainder < 20) {
      parts.push(EN_ONES[remainder]);
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;
      parts.push(one > 0 ? `${EN_TENS[ten]}-${EN_ONES[one]}` : EN_TENS[ten]);
    }
  }
  return parts.join(' ');
}

function enIntegerToWords(num: number): string {
  if (num === 0) return 'ZERO';
  const groups: number[] = [];
  let n = num;
  while (n > 0) {
    groups.push(n % 1000);
    n = Math.floor(n / 1000);
  }
  const words: string[] = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    const text = enHundreds(groups[i]);
    words.push(EN_SCALES[i] ? `${text} ${EN_SCALES[i]}` : text);
  }
  return words.join(' ').replace(/\s+/g, ' ').trim();
}

// ---------------- FRENCH ----------------
const FR_UNITS = [
  '',
  'UN',
  'DEUX',
  'TROIS',
  'QUATRE',
  'CINQ',
  'SIX',
  'SEPT',
  'HUIT',
  'NEUF',
  'DIX',
  'ONZE',
  'DOUZE',
  'TREIZE',
  'QUATORZE',
  'QUINZE',
  'SEIZE',
  'DIX-SEPT',
  'DIX-HUIT',
  'DIX-NEUF',
];

function frUnderHundred(n: number): string {
  if (n === 0) return '';
  if (n < 20) return FR_UNITS[n];
  if (n < 70) {
    const tens = ['', '', 'VINGT', 'TRENTE', 'QUARANTE', 'CINQUANTE', 'SOIXANTE'][
      Math.floor(n / 10)
    ];
    const unit = n % 10;
    if (unit === 0) return tens;
    if (unit === 1) return `${tens} ET UN`;
    return `${tens}-${FR_UNITS[unit]}`;
  }
  if (n < 80) {
    const rem = n - 60;
    if (rem === 11) return 'SOIXANTE ET ONZE';
    return `SOIXANTE-${FR_UNITS[rem]}`;
  }
  // 80..99
  const rem = n - 80;
  if (rem === 0) return 'QUATRE-VINGTS';
  return `QUATRE-VINGT-${FR_UNITS[rem]}`;
}

function frUnderThousand(n: number, isEnd = true): string {
  const hundreds = Math.floor(n / 100);
  const rem = n % 100;
  const parts: string[] = [];

  if (hundreds === 1) {
    parts.push('CENT');
  } else if (hundreds > 1) {
    parts.push(rem === 0 && isEnd ? `${FR_UNITS[hundreds]} CENTS` : `${FR_UNITS[hundreds]} CENT`);
  }

  if (rem > 0) {
    parts.push(frUnderHundred(rem));
  }
  return parts.join(' ');
}

function frIntegerToWords(num: number): string {
  if (num === 0) return 'ZÉRO';

  const billions = Math.floor(num / 1_000_000_000);
  const millions = Math.floor((num % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((num % 1_000_000) / 1000);
  const rest = num % 1000;

  const parts: string[] = [];
  if (billions > 0) {
    parts.push(
      `${frUnderThousand(billions, false)} ${billions === 1 ? 'MILLIARD' : 'MILLIARDS'}`
    );
  }
  if (millions > 0) {
    parts.push(
      `${frUnderThousand(millions, false)} ${millions === 1 ? 'MILLION' : 'MILLIONS'}`
    );
  }
  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('MILLE');
    } else {
      parts.push(`${frUnderThousand(thousands, false)} MILLE`);
    }
  }
  if (rest > 0) {
    parts.push(frUnderThousand(rest, true));
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

// ---------------- SPANISH ----------------
const ES_UNITS = [
  '',
  'UNO',
  'DOS',
  'TRES',
  'CUATRO',
  'CINCO',
  'SEIS',
  'SIETE',
  'OCHO',
  'NUEVE',
  'DIEZ',
  'ONCE',
  'DOCE',
  'TRECE',
  'CATORCE',
  'QUINCE',
  'DIECISÉIS',
  'DIECISIETE',
  'DIECIOCHO',
  'DIECINUEVE',
];

const ES_TWENTIES = [
  'VEINTE',
  'VEINTIUNO',
  'VEINTIDÓS',
  'VEINTITRÉS',
  'VEINTICUATRO',
  'VEINTICINCO',
  'VEINTISÉIS',
  'VEINTISIETE',
  'VEINTIOCHO',
  'VEINTINUEVE',
];

const ES_TENS = [
  '',
  '',
  '',
  'TREINTA',
  'CUARENTA',
  'CINCUENTA',
  'SESENTA',
  'SETENTA',
  'OCHENTA',
  'NOVENTA',
];

const ES_HUNDREDS = [
  '',
  'CIENTO',
  'DOSCIENTOS',
  'TRESCIENTOS',
  'CUATROCIENTOS',
  'QUINIENTOS',
  'SEISCIENTOS',
  'SETECIENTOS',
  'OCHOCIENTOS',
  'NOVECIENTOS',
];

function esUnderThousand(n: number, apocopateOne = false): string {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';

  const hundreds = Math.floor(n / 100);
  const rem = n % 100;
  const parts: string[] = [];

  if (hundreds > 0) parts.push(ES_HUNDREDS[hundreds]);

  if (rem > 0) {
    if (rem < 20) {
      parts.push(rem === 1 && apocopateOne ? 'UN' : ES_UNITS[rem]);
    } else if (rem < 30) {
      parts.push(rem === 21 && apocopateOne ? 'VEINTIÚN' : ES_TWENTIES[rem - 20]);
    } else {
      const ten = Math.floor(rem / 10);
      const unit = rem % 10;
      if (unit === 0) {
        parts.push(ES_TENS[ten]);
      } else {
        const unitWord = unit === 1 && apocopateOne ? 'UN' : ES_UNITS[unit];
        parts.push(`${ES_TENS[ten]} Y ${unitWord}`);
      }
    }
  }

  return parts.join(' ');
}

function esIntegerToWords(num: number): string {
  if (num === 0) return 'CERO';

  const millions = Math.floor(num / 1_000_000);
  const thousands = Math.floor((num % 1_000_000) / 1000);
  const rest = num % 1000;

  const parts: string[] = [];
  if (millions > 0) {
    if (millions === 1) {
      parts.push('UN MILLÓN');
    } else {
      parts.push(`${esUnderThousand(millions, true)} MILLONES`);
    }
  }
  if (thousands > 0) {
    if (thousands === 1) {
      parts.push('MIL');
    } else {
      parts.push(`${esUnderThousand(thousands, true)} MIL`);
    }
  }
  if (rest > 0) {
    parts.push(esUnderThousand(rest, true));
  }

  return parts.join(' ').replace(/\s+/g, ' ').trim();
}

/**
 * Converts a numeric USD amount into formal Proforma Invoice uppercase words
 * in English, French, or Spanish.
 */
export function numberToUsdWords(amount: number, lang: PiLanguage = 'en'): string {
  const safeAmount = !Number.isFinite(amount) || amount < 0 ? 0 : Math.round(amount * 100) / 100;
  const whole = Math.floor(safeAmount);
  const cents = Math.round((safeAmount - whole) * 100);

  if (lang === 'fr') {
    const unit = whole === 1 ? 'DOLLAR AMÉRICAIN' : 'DOLLARS AMÉRICAINS';
    const base = `${frIntegerToWords(whole)} ${unit}`;
    if (cents === 0) return `${base} SEULEMENT`;
    const centUnit = cents === 1 ? 'CENT' : 'CENTS';
    return `${base} ET ${frIntegerToWords(cents)} ${centUnit} SEULEMENT`;
  }

  if (lang === 'es') {
    const unit = whole === 1 ? 'DÓLAR ESTADOUNIDENSE' : 'DÓLARES ESTADOUNIDENSES';
    const base = `${esIntegerToWords(whole)} ${unit}`;
    if (cents === 0) return `${base} SOLAMENTE`;
    const centUnit = cents === 1 ? 'CENTAVO' : 'CENTAVOS';
    return `${base} CON ${esIntegerToWords(cents)} ${centUnit} SOLAMENTE`;
  }

  // English
  const dollarLabel = whole === 1 ? 'US DOLLAR' : 'US DOLLARS';
  const dollarWords = `${enIntegerToWords(whole)} ${dollarLabel}`;
  if (cents === 0) {
    return `${dollarWords} ONLY`;
  }
  const centLabel = cents === 1 ? 'CENT' : 'CENTS';
  return `${dollarWords} AND ${enIntegerToWords(cents)} ${centLabel} ONLY`;
}

export function formatUsd(amount: number): string {
  if (!Number.isFinite(amount)) return '$0';
  const hasDecimals = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(amount);
}

export function formatContractUsd(amount: number): string {
  if (!Number.isFinite(amount)) return 'US$0';
  const hasDecimals = Math.round(amount * 100) % 100 !== 0;
  const formatted = new Intl.NumberFormat('en-US', {
    useGrouping: true,
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: hasDecimals ? 2 : 0,
  }).format(amount);
  return `US$${formatted}`;
}

export function calculateSplitAmounts(total: number, depositPercent: number) {
  const safeTotal = Math.max(0, Math.round(total * 100) / 100);
  const clampedPct = Math.min(100, Math.max(0, depositPercent));
  const depositAmount = Math.round(safeTotal * (clampedPct / 100) * 100) / 100;
  const balanceAmount = Math.round((safeTotal - depositAmount) * 100) / 100;
  const balancePercent = Math.round((100 - clampedPct) * 100) / 100;
  return {
    totalAmount: safeTotal,
    depositPercent: clampedPct,
    balancePercent,
    depositAmount,
    balanceAmount,
  };
}
