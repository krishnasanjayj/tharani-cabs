import React, { useState } from 'react';
import { Search, FileText, Send, Trash2, Phone, Car } from 'lucide-react';
import type { BookingData, WhatsAppConfig } from '../types/booking';
import { formatCurrency, formatDate } from '../utils/billing';
import { sendWhatsAppNotification } from '../utils/whatsapp';

interface BookingHistoryProps {
  bookings: BookingData[];
  onSelectBooking: (booking: BookingData) => void;
  onDeleteBooking: (invoiceId: string) => void;
  whatsappConfig: WhatsAppConfig;
}

export const BookingHistory: React.FC<BookingHistoryProps> = ({
  bookings,
  onSelectBooking,
  onDeleteBooking,
  whatsappConfig,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const term = searchTerm.toLowerCase();
    return (
      b.invoiceId.toLowerCase().includes(term) ||
      b.customerName.toLowerCase().includes(term) ||
      b.customerPhone.toLowerCase().includes(term) ||
      b.pickupLocation.toLowerCase().includes(term) ||
      b.dropLocation.toLowerCase().includes(term) ||
      b.vehicleType.toLowerCase().includes(term)
    );
  });

  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalPayable, 0);
  const totalKm = bookings.reduce((sum, b) => sum + b.distanceKm, 0);

  const handleSendWhatsApp = async (booking: BookingData, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationStatus(`Sending WhatsApp to ${booking.customerName}...`);
    const res = await sendWhatsAppNotification(booking, whatsappConfig);
    setNotificationStatus(res.message);
    setTimeout(() => setNotificationStatus(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header & Stats Cards */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Booking & Invoice History</h1>
          <p className="text-sm text-slate-500 mt-1">
            Track past cab trips, inspect invoices, re-send WhatsApp billing confirmations, and export reports.
          </p>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(totalRevenue)}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 font-bold">
            ₹
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Bookings</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{bookings.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Distance Covered</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{totalKm} KM</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Car className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* WhatsApp Status Alert */}
      {notificationStatus && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-sm font-medium">
          {notificationStatus}
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by Invoice ID (e.g. TC-001), Customer Name, Phone, or Location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-slate-900 text-sm focus:outline-none placeholder-slate-400 font-medium"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 bg-slate-100 rounded-md"
          >
            Clear
          </button>
        )}
      </div>

      {/* Invoices Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredBookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FileText className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-base font-semibold">No booking records found.</p>
            <p className="text-xs text-slate-400">Try adjusting your search filter or create a new booking.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Invoice ID</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Route</th>
                  <th className="py-3.5 px-4">Vehicle</th>
                  <th className="py-3.5 px-4">Trip Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredBookings.map((b) => (
                  <tr
                    key={b.invoiceId}
                    onClick={() => onSelectBooking(b)}
                    className="hover:bg-amber-50/50 cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-4 font-bold text-amber-600">
                      {b.invoiceId}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-slate-900">{b.customerName}</div>
                      <div className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{b.customerPhone}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-xs font-semibold text-slate-800">{b.pickupLocation}</div>
                      <div className="text-xs text-slate-400">to {b.dropLocation}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-800">{b.vehicleType}</div>
                      <div className="text-xs text-slate-500">{b.distanceKm} km × ₹{b.ratePerKm}</div>
                    </td>
                    <td className="py-4 px-4 text-slate-600 text-xs font-medium">
                      {formatDate(b.pickupDate)}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900">
                      {formatCurrency(b.totalPayable)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectBooking(b);
                          }}
                          title="View Invoice Preview"
                          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => handleSendWhatsApp(b, e)}
                          title="Send WhatsApp Confirmation"
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete invoice ${b.invoiceId}?`)) {
                              onDeleteBooking(b.invoiceId);
                            }
                          }}
                          title="Delete Booking"
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
