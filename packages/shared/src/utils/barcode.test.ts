import { describe, it, expect } from 'vitest';
import { isValidEAN13, isValidEAN8, isValidUPCA, detectBarcodeType } from './barcode';

describe('isValidEAN13', () => {
  it('validates correct EAN-13', () => {
    // Standard test barcodes
    expect(isValidEAN13('4006381333931')).toBe(true);
    expect(isValidEAN13('8710400000334')).toBe(true); // Dutch barcode
  });

  it('rejects incorrect check digit', () => {
    expect(isValidEAN13('4006381333932')).toBe(false); // wrong check digit
  });

  it('rejects wrong length', () => {
    expect(isValidEAN13('400638133393')).toBe(false); // 12 digits
    expect(isValidEAN13('40063813339312')).toBe(false); // 14 digits
  });

  it('rejects non-numeric', () => {
    expect(isValidEAN13('400638133393a')).toBe(false);
    expect(isValidEAN13('abcdefghijklm')).toBe(false);
  });

  it('rejects empty string', () => {
    expect(isValidEAN13('')).toBe(false);
  });
});

describe('isValidEAN8', () => {
  it('validates correct EAN-8', () => {
    expect(isValidEAN8('96385074')).toBe(true);
  });

  it('rejects incorrect check digit', () => {
    expect(isValidEAN8('96385075')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidEAN8('9638507')).toBe(false);
    expect(isValidEAN8('963850741')).toBe(false);
  });

  it('rejects non-numeric', () => {
    expect(isValidEAN8('9638507a')).toBe(false);
  });
});

describe('isValidUPCA', () => {
  it('validates correct UPC-A', () => {
    expect(isValidUPCA('036000291452')).toBe(true);
  });

  it('rejects incorrect check digit', () => {
    expect(isValidUPCA('036000291453')).toBe(false);
  });

  it('rejects wrong length', () => {
    expect(isValidUPCA('03600029145')).toBe(false);
    expect(isValidUPCA('0360002914521')).toBe(false);
  });
});

describe('detectBarcodeType', () => {
  it('detects EAN-13', () => {
    expect(detectBarcodeType('4006381333931')).toBe('ean-13');
  });

  it('detects EAN-8', () => {
    expect(detectBarcodeType('96385074')).toBe('ean-8');
  });

  it('detects UPC-A', () => {
    expect(detectBarcodeType('036000291452')).toBe('upc-a');
  });

  it('detects Code-128 for alphanumeric strings', () => {
    expect(detectBarcodeType('ABC-12345')).toBe('code-128');
  });

  it('returns unknown for empty string', () => {
    expect(detectBarcodeType('')).toBe('unknown');
  });

  it('returns unknown for single character', () => {
    expect(detectBarcodeType('A')).toBe('unknown');
  });

  it('falls back to code-128 for numeric strings with invalid check digit', () => {
    // 13-digit number with wrong check digit is not EAN-13, falls through to code-128
    expect(detectBarcodeType('4006381333932')).toBe('code-128');
  });
});
