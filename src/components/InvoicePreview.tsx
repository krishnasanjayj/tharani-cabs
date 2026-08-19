import React, { useState } from 'react';
import { Download, Printer, Send, Edit, CheckCircle, Copy } from 'lucide-react';
import type { BookingData, WhatsAppConfig } from '../types/booking';
import { COMPANY_INFO } from '../types/booking';
import { formatCurrency, formatDate } from '../utils/billing';
import { downloadInvoicePDF, printInvoice } from '../utils/pdfGenerator';
import { sendWhatsAppNotification, buildWhatsAppMessage } from '../utils/whatsapp';

interface InvoicePreviewProps {
  booking: BookingData;
  whatsappConfig: WhatsAppConfig;
  onEdit: () => void;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({
  booking,
  whatsappConfig,
  onEdit,
}) => {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadInvoicePDF('invoice-render-target', booking.invoiceId);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendWhatsApp = async () => {
    setWhatsappStatus('Dispatching WhatsApp notification...');
    const res = await sendWhatsAppNotification(booking, whatsappConfig);
    setWhatsappStatus(res.message);
    setTimeout(() => setWhatsappStatus(null), 5000);
  };

  const handleCopySummary = () => {
    const msg = buildWhatsAppMessage(booking);
    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Action Control Bar */}
      <div className="mb-6 bg-slate-900 text-white rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500 text-slate-950 text-xs font-extrabold px-2.5 py-0.5 rounded-full uppercase">
              Live Invoice
            </span>
            <h2 className="text-lg font-bold text-white">Invoice #{booking.invoiceId}</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Customer: {booking.customerName} ({booking.customerPhone})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{isGeneratingPdf ? 'Generating PDF...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={printInvoice}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-all border border-slate-700"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>

          <button
            onClick={handleSendWhatsApp}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-all shadow-md active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Send WhatsApp</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-sm transition-all border border-slate-700"
            title="Copy Text Summary"
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>

          <button
            onClick={onEdit}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2 rounded-xl text-sm transition-all border border-slate-700"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>
      </div>

      {/* WhatsApp Status Alert */}
      {whatsappStatus && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center justify-between no-print">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{whatsappStatus}</span>
          </div>
        </div>
      )}

      {/* INVOICE CANVAS DOCUMENT - EXACT REPLICA OF ATTACHED SCREENSHOT */}
      <div className="bg-slate-100 p-2 sm:p-6 rounded-2xl flex justify-center">
        <div
          id="invoice-render-target"
          className="invoice-container bg-white w-full max-w-[790px] p-8 sm:p-12 shadow-xl border border-slate-200 text-slate-900 rounded-sm font-sans"
          style={{ minHeight: '1050px' }}
        >
          {/* Header Row */}
          <div className="flex justify-between items-start pt-2">
            {/* Company Details */}
            <div className="flex items-start space-x-4">
              <img src="/logo_transparent.png" alt="Tharani Cabs Logo" className="w-20 h-20 object-contain mt-1" />
              <div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {COMPANY_INFO.name}
                </h1>
                <p className="text-sm text-slate-600 mt-2 font-normal">
                  {COMPANY_INFO.address}
                </p>
                <p className="text-sm text-slate-600 font-normal">
                  Phone: <span className="text-slate-800 font-medium">{COMPANY_INFO.phone}</span> | Email: <span className="text-slate-800 font-medium">{COMPANY_INFO.email}</span>
                </p>
                <p className="text-sm text-slate-600 font-normal">
                  GSTIN: <span className="text-slate-800 font-medium">{COMPANY_INFO.gstin}</span>
                </p>
              </div>
            </div>

            {/* Invoice Tag and Number */}
            <div className="text-right">
              <span className="text-xs font-semibold tracking-widest text-slate-500 uppercase">
                INVOICE
              </span>
              <div className="text-3xl font-extrabold text-[#ca8a04] mt-1 tracking-tight">
                {booking.invoiceId}
              </div>
              <div className="text-sm text-slate-600 mt-2 font-normal">
                <span className="font-semibold text-slate-900">Date:</span> {formatDate(booking.invoiceDate)}
              </div>
            </div>
          </div>

          <hr className="my-8 border-slate-200" />

          {/* Billed To Section */}
          <div className="mb-8">
            <span className="text-xs font-bold tracking-widest text-[#ca8a04] uppercase">
              BILLED TO
            </span>
            <div className="flex items-center space-x-2 mt-2">
              <h2 className="text-base font-bold text-slate-900">
                {booking.customerName}
              </h2>
              {booking.customerType === 'business' && (
                <span className="bg-slate-100 text-slate-700 text-[10px] font-extrabold px-2 py-0.5 rounded border border-slate-200 uppercase tracking-wider">
                  Corporate
                </span>
              )}
            </div>
            <p className="text-sm text-slate-700 mt-0.5">
              Phone: {booking.customerPhone}
              {booking.customerEmail && ` · Email: ${booking.customerEmail}`}
            </p>
            {booking.billingAddress && (
              <p className="text-sm text-slate-600 mt-1 font-normal max-w-md">
                Address: {booking.billingAddress}
              </p>
            )}
          </div>

          {/* Trip Section */}
          <div className="mb-10">
            <span className="text-xs font-bold tracking-widest text-[#ca8a04] uppercase">
              TRIP
            </span>
            <div className="mt-2 space-y-1">
              <p className="text-xs font-normal text-slate-500">Pickup</p>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>{booking.pickupLocation}</span>
                {booking.pickupTime && (
                  <span className="text-sm font-normal text-slate-500">
                    ({booking.pickupTime})
                  </span>
                )}
              </div>
              <p className="text-xs font-normal text-slate-500 pt-2">Drop</p>
              <div className="text-base font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                <span>{booking.dropLocation}</span>
                {booking.dropTime && (
                  <span className="text-sm font-normal text-slate-500">
                    ({booking.dropTime})
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-3 text-xs font-bold tracking-wider text-slate-500 uppercase w-1/4">
                    DESCRIPTION
                  </th>
                  <th className="py-3 text-xs font-bold tracking-wider text-slate-500 uppercase w-1/2">
                    DETAILS
                  </th>
                  <th className="py-3 text-xs font-bold tracking-wider text-slate-500 uppercase text-right w-1/4">
                    AMOUNT (₹)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {/* Row 1: Cab Fare */}
                <tr>
                  <td className="py-4 font-bold text-slate-900">Cab Fare</td>
                  <td className="py-4 text-slate-700 font-medium">
                    {booking.vehicleType || 'Innova Crysta'} · {booking.distanceKm} km × ₹{booking.ratePerKm}/km
                    {booking.totalHours ? ` · Total Hours: ${booking.totalHours} hrs` : ''}
                  </td>
                  <td className="py-4 text-right font-bold text-slate-900">
                    {formatCurrency(booking.cabFare)}
                  </td>
                </tr>

                {/* Row 2: Driver / Vehicle with Pickup & Drop Time per prompt specs */}
                <tr>
                  <td className="py-4 font-bold text-slate-900">Driver / Vehicle</td>
                  <td className="py-4 text-slate-700 font-medium">
                    Driver: {booking.driverName || 'Nadhagopal'} · Vehicle: {booking.vehicleNumber || 'TN37 CE 3466'} · Trip Date: {formatDate(booking.pickupDate)}
                    {booking.pickupTime || booking.dropTime ? (
                      ` · Time: ${booking.pickupTime || ''}${booking.dropTime ? ` - ${booking.dropTime}` : ''}`
                    ) : ''}
                  </td>
                  <td className="py-4 text-right text-slate-400 font-normal">—</td>
                </tr>

                {/* Row 3: Driver Bata */}
                <tr>
                  <td className="py-4 font-bold text-slate-900">Driver Bata</td>
                  <td className="py-4 text-slate-700 font-medium">Allowance</td>
                  <td className="py-4 text-right font-bold text-slate-900">
                    {formatCurrency(booking.driverBata)}
                  </td>
                </tr>

                {/* Row 4: Toll & Parking */}
                <tr>
                  <td className="py-4 font-bold text-slate-900">Toll & Parking</td>
                  <td className="py-4 text-slate-700 font-medium">As applicable</td>
                  <td className="py-4 text-right font-bold text-slate-900">
                    {formatCurrency(booking.tollParking)}
                  </td>
                </tr>

                {/* Row 5: Extra Hours */}
                <tr>
                  <td className="py-4 font-bold text-slate-900">Extra Hours</td>
                  <td className="py-4 text-slate-700 font-medium">
                    {booking.extraHoursCount ? `${booking.extraHoursCount} hrs` : 'As applicable'}
                  </td>
                  <td className="py-4 text-right font-bold text-slate-900">
                    {formatCurrency(booking.waitingCharges)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Subtotal & Totals Summary Block */}
          <div className="flex justify-end mb-16 pt-2">
            <div className="w-72 space-y-3 text-sm">
              <div className="flex justify-between items-center text-slate-700">
                <span className="font-medium text-slate-600">Subtotal</span>
                <span className="font-bold text-slate-900">{formatCurrency(booking.subtotal)}</span>
              </div>

              <div className="flex justify-between items-center text-slate-700">
                <span className="font-medium text-slate-600">GST ({booking.gstRate}%)</span>
                <span className="font-bold text-slate-900">{formatCurrency(booking.gstAmount)}</span>
              </div>

              <div className="pt-4 flex justify-between items-baseline border-t-0">
                <span className="text-sm font-bold tracking-widest text-[#ca8a04] uppercase">
                  TOTAL PAYABLE
                </span>
                <span className="text-2xl font-extrabold text-[#ca8a04] tracking-tight">
                  {formatCurrency(booking.totalPayable)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Section */}
          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-end gap-6 text-xs text-slate-500">
            {/* Thank you note */}
            <div className="max-w-md space-y-1 text-slate-600 leading-relaxed font-normal">
              <p>
                Thank you for choosing Tharani Cabs. Fare is inclusive of driver bata, toll
                and parking as listed above. For any billing queries, reach us at
              </p>
              <p className="font-medium text-slate-800">
                {COMPANY_INFO.email} or {COMPANY_INFO.phone}.
              </p>
            </div>

            {/* Authorised Signatory */}
            <div className="text-center sm:text-right space-y-12">
              <p className="font-semibold text-slate-800">For Tharani Cabs</p>
              <div>
                <div className="w-48 border-b border-slate-300 mx-auto sm:ml-auto mb-2"></div>
                <p className="font-medium text-slate-600">Authorised Signatory</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
