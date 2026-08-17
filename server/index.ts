import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import { BookingData } from '../src/types/booking';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const DATA_DIR = path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read bookings from disk
function readBookings(): BookingData[] {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) {
      // Seed default sample booking matching the invoice image
      const defaultSample: BookingData = {
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
        cabFare: 546.25,
        subtotal: 546.25,
        gstAmount: 0,
        totalPayable: 546.25,
        createdAt: new Date().toISOString(),
      };
      fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([defaultSample], null, 2));
      return [defaultSample];
    }

    const content = fs.readFileSync(BOOKINGS_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading bookings file:', err);
    return [];
  }
}

// Save bookings to disk
function saveBookings(bookings: BookingData[]): void {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error('Error saving bookings file:', err);
  }
}

// API Routes

// 1. Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Tharani Cabs Backend Service', timestamp: new Date() });
});

// 2. Get all bookings
app.get('/api/bookings', (req: Request, res: Response) => {
  const bookings = readBookings();
  res.json({ success: true, count: bookings.length, data: bookings });
});

// 3. Save new booking
app.post('/api/bookings', (req: Request, res: Response) => {
  const newBooking: BookingData = req.body;
  if (!newBooking || !newBooking.customerName || !newBooking.customerPhone) {
    return res.status(400).json({ success: false, message: 'Missing required booking fields.' });
  }

  const bookings = readBookings();
  // Check if invoice ID already exists, if so update it, else append
  const index = bookings.findIndex((b) => b.invoiceId === newBooking.invoiceId);
  if (index >= 0) {
    bookings[index] = newBooking;
  } else {
    bookings.unshift(newBooking);
  }

  saveBookings(bookings);
  return res.json({ success: true, message: 'Booking saved successfully.', data: newBooking });
});

// 4. Delete booking
app.delete('/api/bookings/:invoiceId', (req: Request, res: Response) => {
  const { invoiceId } = req.params;
  let bookings = readBookings();
  const initialCount = bookings.length;
  bookings = bookings.filter((b) => b.invoiceId !== invoiceId);

  if (bookings.length === initialCount) {
    return res.status(404).json({ success: false, message: 'Invoice not found.' });
  }

  saveBookings(bookings);
  return res.json({ success: true, message: `Invoice ${invoiceId} deleted.` });
});

// 6. Distance calculation proxy (Nominatim + OSRM)
// Proxied through backend so proper User-Agent headers can be set
app.get('/api/distance', async (req: Request, res: Response) => {
  const pickup = req.query.pickup as string;
  const drop = req.query.drop as string;

  if (!pickup || !drop) {
    return res.status(400).json({ success: false, message: 'Both pickup and drop query params are required.' });
  }

  const HEADERS = {
    'Accept': 'application/json',
    'User-Agent': 'TharaniCabsBillingEngine/1.0 (contact: Tharanicabs29@gmail.com)',
  };

  try {
    const [pickupRes, dropRes] = await Promise.all([
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(pickup)}&format=json&limit=1`, { headers: HEADERS }),
      fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(drop)}&format=json&limit=1`, { headers: HEADERS }),
    ]);

    if (!pickupRes.ok || !dropRes.ok) {
      return res.status(502).json({ success: false, message: 'Geocoding API error.' });
    }

    const pickupData = await pickupRes.json() as { lat: string; lon: string }[];
    const dropData = await dropRes.json() as { lat: string; lon: string }[];

    if (!pickupData.length || !dropData.length) {
      return res.status(404).json({ success: false, message: 'One or both locations could not be geocoded.' });
    }

    const start = pickupData[0];
    const end = dropData[0];

    const routeRes = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${start.lon},${start.lat};${end.lon},${end.lat}?overview=false`
    );

    if (!routeRes.ok) {
      return res.status(502).json({ success: false, message: 'Routing API error.' });
    }

    const routeData = await routeRes.json() as { routes: { distance: number }[] };

    if (routeData.routes && routeData.routes.length > 0) {
      const km = Math.round((routeData.routes[0].distance / 1000) * 10) / 10;
      return res.json({ success: true, distanceKm: km });
    }

    return res.status(404).json({ success: false, message: 'No route found.' });
  } catch (err) {
    console.error('[Distance API]', err);
    return res.status(500).json({ success: false, message: 'Internal error fetching route.' });
  }
});


app.post('/api/whatsapp/send', (req: Request, res: Response) => {
  const { booking, config } = req.body;

  if (!booking) {
    return res.status(400).json({ success: false, message: 'No booking data provided.' });
  }

  console.log(`[WhatsApp API Trigger] Sending confirmation for ${booking.invoiceId} to ${booking.customerName} (${booking.customerPhone})`);

  // Mock / Webhook / Twilio Payload structure log
  const payload = {
    to: `whatsapp:+${booking.customerPhone.replace(/\D/g, '')}`,
    body: `Hello ${booking.customerName}, thank you for booking with Tharani Cabs. Your trip from ${booking.pickupLocation} to ${booking.dropLocation} is confirmed. Total Payable: ₹${booking.totalPayable}.`,
    timestamp: new Date().toISOString(),
  };

  return res.json({
    success: true,
    message: `WhatsApp notification queued for ${booking.customerPhone}`,
    payload,
  });
});

app.listen(PORT, () => {
  console.log(`Tharani Cabs Backend running on http://localhost:${PORT}`);
});
