/**
 * Validate EAN-13 barcode check digit.
 * EAN-13: 13 digits, last digit is check digit.
 * Algorithm: alternating weights of 1 and 3, check digit = (10 - sum % 10) % 10
 */
export function isValidEAN13(barcode: string): boolean {
  if (!/^\d{13}$/.test(barcode)) return false;

  const digits = barcode.split('').map(Number);
  const checkDigit = digits[12]!;
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += digits[i]! * (i % 2 === 0 ? 1 : 3);
  }

  return (10 - (sum % 10)) % 10 === checkDigit;
}

/**
 * Validate EAN-8 barcode check digit.
 */
export function isValidEAN8(barcode: string): boolean {
  if (!/^\d{8}$/.test(barcode)) return false;

  const digits = barcode.split('').map(Number);
  const checkDigit = digits[7]!;
  let sum = 0;

  for (let i = 0; i < 7; i++) {
    sum += digits[i]! * (i % 2 === 0 ? 3 : 1);
  }

  return (10 - (sum % 10)) % 10 === checkDigit;
}

/**
 * Validate UPC-A barcode (12 digits).
 */
export function isValidUPCA(barcode: string): boolean {
  if (!/^\d{12}$/.test(barcode)) return false;

  const digits = barcode.split('').map(Number);
  const checkDigit = digits[11]!;
  let sum = 0;

  for (let i = 0; i < 11; i++) {
    sum += digits[i]! * (i % 2 === 0 ? 3 : 1);
  }

  return (10 - (sum % 10)) % 10 === checkDigit;
}

/**
 * Detect barcode type from string.
 */
export function detectBarcodeType(
  barcode: string,
): 'ean-13' | 'ean-8' | 'upc-a' | 'code-128' | 'qr' | 'unknown' {
  if (/^\d{13}$/.test(barcode) && isValidEAN13(barcode)) return 'ean-13';
  if (/^\d{8}$/.test(barcode) && isValidEAN8(barcode)) return 'ean-8';
  if (/^\d{12}$/.test(barcode) && isValidUPCA(barcode)) return 'upc-a';
  if (/^[\x00-\x7F]+$/.test(barcode) && barcode.length > 1) return 'code-128';
  return 'unknown';
}
