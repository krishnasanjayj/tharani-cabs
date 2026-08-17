export interface VehicleRate {
  id: string;
  name: string;
  ratePerKm: number;
  description: string;
}

export interface BookingData {
  id?: string;
  invoiceId: string;
  invoiceDate: string; // YYYY-MM-DD or DD/MM/YYYY
  customerName: string;
  customerPhone: string;
  personsCount: number;
  customerEmail?: string;
  billingAddress?: string;
  customerType?: 'individual' | 'business';
  
  // Trip details
  pickupLocation: string;
  dropLocation: string;
  pickupDate: string; // YYYY-MM-DD
  pickupTime: string; // e.g. "09:00 AM"
  dropTime: string;   // e.g. "06:00 PM"
  
  // Driver & Vehicle details
  driverName: string;
  vehicleNumber: string;
  vehicleType: string;
  
  // Financial calculation inputs
  distanceKm: number;
  ratePerKm: number;
  driverBata: number;
  tollParking: number;
  waitingCharges: number;
  discount: number;
  gstRate: number; // default 0 (%)
  
  // Computed values
  cabFare: number;
  subtotal: number;
  gstAmount: number;
  totalPayable: number;
  
  createdAt: string;
}

export interface WhatsAppConfig {
  mode: 'direct' | 'twilio' | 'webhook';
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  webhookUrl?: string;
}

export const DEFAULT_VEHICLE_RATES: VehicleRate[] = [
  { id: 'innova-crysta', name: 'Innova Crysta', ratePerKm: 47.5, description: 'Premium 7-seater MPV with luxury seating' },
  { id: 'sedan', name: 'Sedan (Dzire / Etios)', ratePerKm: 18.0, description: 'Comfortable 4-seater executive sedan' },
  { id: 'suv', name: 'SUV (Ertiga / Marazzo)', ratePerKm: 24.0, description: 'Spacious 6-seater family SUV' },
  { id: 'tempo', name: 'Tempo Traveller', ratePerKm: 32.0, description: '12-16 seater group vehicle' },
];

export const COMPANY_INFO = {
  name: 'Tharani Cabs',
  address: '5/49 Pillaiyar Kovil Street, Gengampalayam',
  phone: '6374152636',
  email: 'Tharanicabs29@gmail.com',
  gstin: '33HFRPD6541G1ZB',
};
