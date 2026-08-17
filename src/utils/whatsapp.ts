import type { BookingData, WhatsAppConfig } from '../types/booking';
import { formatCurrency } from './billing';

/**
 * Builds the exact required WhatsApp notification message text
 */
export function buildWhatsAppMessage(booking: BookingData, pdfDownloadUrl?: string): string {
  const formattedAmount = formatCurrency(booking.totalPayable);
  const downloadLink = pdfDownloadUrl || `${window.location.origin}?invoice=${booking.invoiceId}`;

  return `Hello ${booking.customerName}, thank you for booking with Tharani Cabs. Your trip from ${booking.pickupLocation} to ${booking.dropLocation} is confirmed. Total Payable: ${formattedAmount}. You can download your invoice here: ${downloadLink}`;
}

/**
 * Sanitizes phone number to international format, e.g. 916374152636
 */
export function sanitizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
}

/**
 * Generates direct WhatsApp Web / App click-to-chat URL
 */
export function getWhatsAppDirectUrl(booking: BookingData, pdfDownloadUrl?: string): string {
  const phone = sanitizePhoneNumber(booking.customerPhone);
  const message = buildWhatsAppMessage(booking, pdfDownloadUrl);
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Sends notification via backend WhatsApp API endpoint or opens direct link
 */
export async function sendWhatsAppNotification(
  booking: BookingData,
  config: WhatsAppConfig,
  pdfDownloadUrl?: string
): Promise<{ success: boolean; message: string; directUrl?: string }> {
  const directUrl = getWhatsAppDirectUrl(booking, pdfDownloadUrl);

  if (config.mode === 'direct') {
    // Open in new window for direct WhatsApp sending
    window.open(directUrl, '_blank');
    return {
      success: true,
      message: 'Opened WhatsApp Chat with prefilled booking confirmation message.',
      directUrl,
    };
  }

  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        booking,
        config,
        pdfDownloadUrl,
      }),
    });

    const result = await response.json();
    if (response.ok && result.success) {
      return {
        success: true,
        message: result.message || 'WhatsApp message sent successfully via backend API.',
        directUrl,
      };
    } else {
      console.warn('Backend WhatsApp API note:', result.message);
      window.open(directUrl, '_blank');
      return {
        success: true,
        message: `Opened direct WhatsApp Web (Backend API response: ${result.message || 'Fallback mode'})`,
        directUrl,
      };
    }
  } catch (error: any) {
    console.error('WhatsApp API Error:', error);
    window.open(directUrl, '_blank');
    return {
      success: true,
      message: 'Opened WhatsApp Web direct chat fallback.',
      directUrl,
    };
  }
}
