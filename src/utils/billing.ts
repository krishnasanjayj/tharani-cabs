import type { BookingData } from '../types/booking';

/**
 * Calculates all financial line items and return full computed booking object
 */
export function calculateBookingTotals(
  data: Omit<BookingData, 'cabFare' | 'subtotal' | 'gstAmount' | 'totalPayable'>
): BookingData {
  const distanceKm = Math.max(0, Number(data.distanceKm) || 0);
  const ratePerKm = Math.max(0, Number(data.ratePerKm) || 0);
  
  const cabFare = distanceKm * ratePerKm;
  const driverBata = Math.max(0, Number(data.driverBata) || 0);
  const tollParking = Math.max(0, Number(data.tollParking) || 0);
  const waitingCharges = Math.max(0, Number(data.waitingCharges) || 0);
  const discount = Math.max(0, Number(data.discount) || 0);
  const gstRate = Math.max(0, Number(data.gstRate) || 0);
  
  const subtotal = cabFare + driverBata + tollParking + waitingCharges;
  const taxableAmount = subtotal;
  const gstAmount = (taxableAmount * gstRate) / 100;
  const totalPayable = taxableAmount + gstAmount;

  return {
    ...data,
    distanceKm,
    ratePerKm,
    driverBata,
    tollParking,
    waitingCharges,
    discount,
    gstRate,
    cabFare,
    subtotal,
    gstAmount,
    totalPayable,
  };
}

/**
 * Formats a number into Indian Rupee format, e.g. ₹2,850.00
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `₹${formatted}`;
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) into DD/MM/YYYY
 */
export function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  
  // If already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
    return dateStr;
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Generates next auto-incremented invoice ID from list, starting with TC-001
 */
export function generateNextInvoiceId(existingBookings: { invoiceId: string }[]): string {
  if (!existingBookings || existingBookings.length === 0) {
    return 'TC-001';
  }

  let maxNum = 0;
  existingBookings.forEach((b) => {
    if (b.invoiceId && b.invoiceId.startsWith('TC-')) {
      const numStr = b.invoiceId.replace('TC-', '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
  });

  const nextNum = maxNum + 1;
  return `TC-${String(nextNum).padStart(3, '0')}`;
}

/**
 * Formats a 24-hour time string "HH:MM" to 12-hour AM/PM format, e.g. "09:00 AM"
 */
export function formatTime12Hour(timeStr?: string): string {
  if (!timeStr) return '';
  if (/^\d{2}:\d{2}\s?(AM|PM)$/i.test(timeStr)) {
    return timeStr;
  }
  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) return timeStr;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const strHours = String(hours).padStart(2, '0');
  return `${strHours}:${minutes} ${ampm}`;
}

/**
 * Parses a 12-hour AM/PM time string "HH:MM AM/PM" to 24-hour format "HH:MM"
 */
export function parseTimeTo24Hour(timeStr?: string): string {
  if (!timeStr) return '';
  const match = timeStr.match(/^(\d{2}):(\d{2})\s?(AM|PM)$/i);
  if (!match) return timeStr;
  
  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const ampm = match[3].toUpperCase();
  
  if (ampm === 'PM' && hours < 12) {
    hours += 12;
  } else if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }
  
  return `${String(hours).padStart(2, '0')}:${minutes}`;
}
