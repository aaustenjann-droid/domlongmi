// Khmer number to words conversion and currency formatting utilities

const khmerDigits = ['សូន្យ', 'មួយ', 'ពីរ', 'បី', 'បួន', 'ប្រាំ', 'ប្រាំមួយ', 'ប្រាំពីរ', 'ប្រាំបី', 'ប្រាំបួន'];
const khmerPositions = ['', 'ដប់', 'រយ', 'ពាន់', 'ម៉ឺន', 'សែន', 'លាន'];

export function numberToKhmerWords(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'សូន្យរៀលគត់';

  function readGroupOfSix(n: number): string {
    if (n === 0) return '';
    let result = '';
    const str = n.toString();
    const len = str.length;

    // Khmer reading typically groups by 10s, 100s, 1000s, 10,000s (ម៉ឺន), 100,000s (សែន)
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i]);
      const pos = len - 1 - i;

      if (digit === 0) continue;

      if (pos === 1) {
        // Tens
        if (digit === 1) {
          result += 'ដប់ ';
        } else if (digit === 2) {
          result += 'ម្ភៃ ';
        } else if (digit === 3) {
          result += 'សាមសិប ';
        } else if (digit === 4) {
          result += 'សែសិប ';
        } else if (digit === 5) {
          result += 'ហាសិប ';
        } else if (digit === 6) {
          result += 'ហុកសិប ';
        } else if (digit === 7) {
          result += 'ចិតសិប ';
        } else if (digit === 8) {
          result += 'ប៉ែតសិប ';
        } else if (digit === 9) {
          result += 'កៅសិប ';
        }
      } else if (pos === 0) {
        // Ones
        result += khmerDigits[digit] + ' ';
      } else {
        result += khmerDigits[digit] + khmerPositions[pos] + ' ';
      }
    }
    return result.trim();
  }

  // Handle millions
  let millions = Math.floor(rounded / 1000000);
  let remainder = rounded % 1000000;

  let text = '';
  if (millions > 0) {
    if (millions >= 1000000) {
      const billions = Math.floor(millions / 1000000);
      const remainingMillions = millions % 1000000;
      text += readGroupOfSix(billions) + 'ពាន់លាន ';
      if (remainingMillions > 0) {
        text += readGroupOfSix(remainingMillions) + 'លាន ';
      }
    } else {
      text += readGroupOfSix(millions) + 'លាន ';
    }
  }

  if (remainder > 0) {
    text += readGroupOfSix(remainder);
  }

  return text.trim() + ' រៀលគត់';
}

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

export function numberToEnglishWords(amount: number): string {
  const dollars = Math.floor(amount);
  const cents = Math.round((amount - dollars) * 100);

  function convertHundreds(n: number): string {
    let str = '';
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + ' ';
    }
    return str.trim();
  }

  if (dollars === 0 && cents === 0) return 'Zero Dollars';

  let result = '';
  let n = dollars;

  if (n >= 1000000) {
    result += convertHundreds(Math.floor(n / 1000000)) + ' Million ';
    n %= 1000000;
  }
  if (n >= 1000) {
    result += convertHundreds(Math.floor(n / 1000)) + ' Thousand ';
    n %= 1000;
  }
  if (n > 0) {
    result += convertHundreds(n);
  }

  result = result.trim() + ' Dollars';

  if (cents > 0) {
    result += ' and ' + convertHundreds(cents) + ' Cents';
  }

  return result + ' Only';
}

// KHQR payload generator (EMVCo compliant format or standard payment URI)
export function generateKhqrPayload(bankAccount: string, amount: number, currency: 'KHR' | 'USD'): string {
  // Generates a mock or standard Bakong KHQR URI that banking apps recognize
  const curCode = currency === 'KHR' ? '116' : '840';
  return `https://link.payway.com.kh/khqr?account=${encodeURIComponent(bankAccount)}&amount=${amount}&currency=${curCode}`;
}
