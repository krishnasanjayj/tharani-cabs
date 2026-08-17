import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BookingForm } from './components/BookingForm';
import { InvoicePreview } from './components/InvoicePreview';
import { BookingHistory } from './components/BookingHistory';
import { SettingsModal } from './components/SettingsModal';
import type { BookingData, WhatsAppConfig } from './types/booking';
import { calculateBookingTotals } from './utils/billing';

const SAMPLE_BOOKING_TC001: BookingData = calculateBookingTotals({
  invoiceId: 'TC-001',
  invoiceDate: '13/08/2026',
  customerName: 'Dummy Customer',
  customerPhone: '996543210',
  personsCount: 1,
  customerEmail: 'dummy@example.com',
  billingAddress: 'Dummy Billing Address',
  customerType: 'individual',
  pickupLocation: 'Gandhipuram',
  dropLocation: 'Coimbatore Airport',
  pickupDate: '2026-08-14',
  pickupTime: '12:00 PM',
  dropTime: '01:00 PM',
  driverName: 'Nadhagopal',
  vehicleNumber: 'TN37CE3466',
  vehicleType: 'Innova Crysta',
  distanceKm: 11.5,
  ratePerKm: 47.5,
  driverBata: 0,
  tollParking: 0,
  waitingCharges: 0,
  discount: 0,
  gstRate: 0,
  createdAt: new Date().toISOString(),
});

export function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'preview' | 'history' | 'settings'>('create');
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [activeBooking, setActiveBooking] = useState<BookingData>(SAMPLE_BOOKING_TC001);
  const [editingBooking, setEditingBooking] = useState<BookingData | null>(null);

  const handleTabChange = (tab: 'create' | 'preview' | 'history' | 'settings') => {
    if (tab === 'create') {
      setEditingBooking(null);
    }
    setActiveTab(tab);
  };
  const [whatsappConfig, setWhatsappConfig] = useState<WhatsAppConfig>({
    mode: 'direct',
  });

  // Load initial bookings from localStorage or Backend API
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.length > 0) {
            setBookings(json.data);
            // Default active booking to latest or sample
            setActiveBooking(json.data[0]);
            return;
          }
        }
      } catch (err) {
        console.warn('Backend API offline, using LocalStorage fallback:', err);
      }

      // LocalStorage fallback
      const saved = localStorage.getItem('tharani_cabs_bookings');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) {
            setBookings(parsed);
            setActiveBooking(parsed[0]);
            return;
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Default sample if no bookings exist
      setBookings([SAMPLE_BOOKING_TC001]);
      setActiveBooking(SAMPLE_BOOKING_TC001);
    };

    fetchBookings();
  }, []);

  // Save booking (update state, sync to local storage & backend API)
  const handleSaveBooking = async (booking: BookingData) => {
    setActiveBooking(booking);
    
    // Update local bookings array
    setBookings((prev) => {
      const idx = prev.findIndex((b) => b.invoiceId === booking.invoiceId);
      let updated: BookingData[];
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = booking;
      } else {
        updated = [booking, ...prev];
      }
      localStorage.setItem('tharani_cabs_bookings', JSON.stringify(updated));
      return updated;
    });

    // Sync with Express backend API
    try {
      await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });
    } catch (err) {
      console.warn('API sync warning:', err);
    }

    // Switch to preview tab to immediately display the generated invoice
    setEditingBooking(null);
    setActiveTab('preview');
  };

  // Delete booking
  const handleDeleteBooking = async (invoiceId: string) => {
    setBookings((prev) => {
      const filtered = prev.filter((b) => b.invoiceId !== invoiceId);
      localStorage.setItem('tharani_cabs_bookings', JSON.stringify(filtered));
      if (activeBooking.invoiceId === invoiceId) {
        if (filtered.length > 0) {
          setActiveBooking(filtered[0]);
        } else {
          setActiveBooking(SAMPLE_BOOKING_TC001);
        }
      }
      return filtered;
    });

    try {
      await fetch(`/api/bookings/${invoiceId}`, { method: 'DELETE' });
    } catch (err) {
      console.warn(err);
    }
  };


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

      <main className="flex-1 pb-16">
        {activeTab === 'create' && (
          <BookingForm
            onSaveBooking={handleSaveBooking}
            existingBookings={bookings}
            initialData={editingBooking}
            onLiveUpdate={setActiveBooking}
          />
        )}

        {activeTab === 'preview' && (
          <InvoicePreview
            booking={activeBooking}
            whatsappConfig={whatsappConfig}
            onEdit={() => {
              setEditingBooking(activeBooking);
              setActiveTab('create');
            }}
          />
        )}

        {activeTab === 'history' && (
          <BookingHistory
            bookings={bookings}
            onSelectBooking={(b) => {
              setActiveBooking(b);
              setActiveTab('preview');
            }}
            onDeleteBooking={handleDeleteBooking}
            whatsappConfig={whatsappConfig}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsModal
            whatsappConfig={whatsappConfig}
            onSaveWhatsAppConfig={(cfg) => setWhatsappConfig(cfg)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800 text-xs no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-2">
          <p className="font-semibold text-slate-300">
            Tharani Cabs Automated Booking & Billing Platform
          </p>
          <p className="text-slate-500">
            GSTIN: 33HFRPD6541G1ZB | Phone: 6374152636 | Email: Tharanicabs29@gmail.com
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
