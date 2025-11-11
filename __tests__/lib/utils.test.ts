import {
  formatPrice,
  formatDate,
  slugify,
  getInitials,
  truncate,
  generateTimeSlots,
  isValidEmail,
  isValidPhone,
} from '@/lib/utils';

describe('Utils', () => {
  describe('formatPrice', () => {
    it('should format price in ARS currency', () => {
      expect(formatPrice(5000, 'ARS')).toBe('$\xa05000');
    });

    it('should format price with decimals', () => {
      expect(formatPrice(5000.50, 'ARS')).toBe('$\xa05000,50');
    });
  });

  describe('formatDate', () => {
    const testDate = new Date('2024-01-15T10:30:00');

    it('should format date in short format', () => {
      const result = formatDate(testDate, 'short');
      expect(result).toContain('15');
      expect(result).toContain('01');
      expect(result).toContain('2024');
    });

    it('should format time', () => {
      const result = formatDate(testDate, 'time');
      expect(result).toContain('10');
      expect(result).toContain('30');
    });
  });

  describe('slugify', () => {
    it('should convert text to slug', () => {
      expect(slugify('Belleza & Estilo')).toBe('belleza-estilo');
    });

    it('should handle special characters', () => {
      expect(slugify('Café Ñoño!')).toBe('cafe-nono');
    });

    it('should handle multiple spaces', () => {
      expect(slugify('Mi   Negocio  Test')).toBe('mi-negocio-test');
    });
  });

  describe('getInitials', () => {
    it('should get initials from full name', () => {
      expect(getInitials('Juan Pérez')).toBe('JP');
    });

    it('should handle single name', () => {
      expect(getInitials('María')).toBe('MA');
    });

    it('should handle three names', () => {
      expect(getInitials('Ana María González')).toBe('AM');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const text = 'This is a very long text that needs to be truncated';
      expect(truncate(text, 20)).toBe('This is a very long ...');
    });

    it('should not truncate short text', () => {
      const text = 'Short text';
      expect(truncate(text, 20)).toBe('Short text');
    });
  });

  describe('generateTimeSlots', () => {
    it('should generate time slots with 30 min intervals', () => {
      const slots = generateTimeSlots('09:00', '11:00', 30);
      expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30']);
    });

    it('should generate time slots with 60 min intervals', () => {
      const slots = generateTimeSlots('10:00', '13:00', 60);
      expect(slots).toEqual(['10:00', '11:00', '12:00']);
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
    });

    it('should reject invalid email', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('should validate phone numbers', () => {
      expect(isValidPhone('+5491123456789')).toBe(true);
      expect(isValidPhone('1123456789')).toBe(true);
    });

    it('should reject invalid phone', () => {
      expect(isValidPhone('abc')).toBe(false);
      expect(isValidPhone('123')).toBe(false);
    });
  });
});

