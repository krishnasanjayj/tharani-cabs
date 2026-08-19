import React, { useState, useEffect } from 'react';
import { User, MapPin, Car, Calculator, FileCheck, RefreshCw } from 'lucide-react';
import type { BookingData } from '../types/booking';

import { calculateBookingTotals, generateNextInvoiceId, formatCurrency } from '../utils/billing';

interface BookingFormProps {
  onSaveBooking: (booking: BookingData) => void;
  existingBookings: BookingData[];
  initialData?: BookingData | null;
  onLiveUpdate?: (booking: BookingData) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  onSaveBooking,
  existingBookings,
  initialData,
  onLiveUpdate,
}) => {
  const [invoiceId, setInvoiceId] = useState<string>('TC-001');
  const [invoiceDate, setInvoiceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Customer Details
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [personsCount, setPersonsCount] = useState<number>(1);
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [billingAddress, setBillingAddress] = useState<string>('');
  const [customerType, setCustomerType] = useState<'individual' | 'business'>('individual');
  
  // Trip Details
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [dropLocation, setDropLocation] = useState<string>('');
  const [pickupDate, setPickupDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState<string>('');
  const [dropTime, setDropTime] = useState<string>('');
  
  // Driver & Vehicle
  const [driverName, setDriverName] = useState<string>('');
  const [vehicleNumber, setVehicleNumber] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<string>('');
  
  // Financial inputs
  const [distanceKm, setDistanceKm] = useState<number | ''>('');
  const [totalHours, setTotalHours] = useState<number | ''>('');
  const [ratePerKm, setRatePerKm] = useState<number | ''>();
  const [driverBata, setDriverBata] = useState<number>(0);
  const [tollParking, setTollParking] = useState<number>(0);
  const [extraHoursCount, setExtraHoursCount] = useState<number | ''>('');
  const [waitingCharges, setWaitingCharges] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [gstRate, setGstRate] = useState<number | ''>('');

  // Auto-generate invoice ID if creating new
  useEffect(() => {
    if (initialData) {
      setInvoiceId(initialData.invoiceId);
      setInvoiceDate(initialData.invoiceDate);
      setCustomerName(initialData.customerName);
      setCustomerPhone(initialData.customerPhone);
      setPersonsCount(initialData.personsCount || 1);
      setCustomerEmail(initialData.customerEmail || '');
      setBillingAddress(initialData.billingAddress || '');
      setCustomerType(initialData.customerType || 'individual');
      setPickupLocation(initialData.pickupLocation);
      setDropLocation(initialData.dropLocation);
      setPickupDate(initialData.pickupDate);
      setPickupTime(initialData.pickupTime || '');
      setDropTime(initialData.dropTime || '');
      setDriverName(initialData.driverName || '');
      setVehicleNumber(initialData.vehicleNumber || '');
      setVehicleType(initialData.vehicleType || '');
      setDistanceKm(initialData.distanceKm);
      setTotalHours(initialData.totalHours ?? '');
      setRatePerKm(initialData.ratePerKm);
      setDriverBata(initialData.driverBata);
      setTollParking(initialData.tollParking);
      setExtraHoursCount(initialData.extraHoursCount ?? '');
      setWaitingCharges(initialData.waitingCharges);
      setDiscount(initialData.discount);
      setGstRate(initialData.gstRate ?? '');
    } else {
      const nextId = generateNextInvoiceId(existingBookings);
      setInvoiceId(nextId);
      setInvoiceDate(new Date().toISOString().split('T')[0]);
      setCustomerName('');
      setCustomerPhone('');
      setPersonsCount(1);
      setCustomerEmail('');
      setBillingAddress('');
      setCustomerType('individual');
      setPickupLocation('');
      setDropLocation('');
      setPickupDate(new Date().toISOString().split('T')[0]);
      setPickupTime('');
      setDropTime('');
      setDriverName('');
      setVehicleNumber('');
      setVehicleType('');
      setDistanceKm('');
      setTotalHours('');
      setRatePerKm('');
      setDriverBata(0);
      setTollParking(0);
      setExtraHoursCount('');
      setWaitingCharges(0);
      setDiscount(0);
      setGstRate('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  // Live calculation preview
  const liveBookingData = calculateBookingTotals({
    invoiceId,
    invoiceDate,
    customerName,
    customerPhone,
    personsCount,
    customerEmail,
    billingAddress,
    customerType,
    pickupLocation,
    dropLocation,
    pickupDate,
    pickupTime,
    dropTime,
    driverName,
    vehicleNumber,
    vehicleType,
    distanceKm: Number(distanceKm) || 0,
    totalHours: totalHours === '' ? undefined : Number(totalHours),
    ratePerKm: Number(ratePerKm) || 0,
    driverBata,
    tollParking,
    extraHoursCount: extraHoursCount === '' ? undefined : Number(extraHoursCount),
    waitingCharges,
    discount,
    gstRate: gstRate === '' ? 0 : Number(gstRate),
    createdAt: new Date().toISOString(),
  });

  // Sync live booking data back to parent state for instant preview
  useEffect(() => {
    onLiveUpdate?.(liveBookingData);
  }, [
    invoiceId,
    invoiceDate,
    customerName,
    customerPhone,
    personsCount,
    customerEmail,
    billingAddress,
    customerType,
    pickupLocation,
    dropLocation,
    pickupDate,
    pickupTime,
    dropTime,
    driverName,
    vehicleNumber,
    vehicleType,
    distanceKm,
    totalHours,
    ratePerKm,
    driverBata,
    tollParking,
    extraHoursCount,
    waitingCharges,
    discount,
    gstRate,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !pickupLocation || !dropLocation || distanceKm === '' || Number(distanceKm) <= 0 || ratePerKm === '' || Number(ratePerKm) <= 0) {
      alert('Please fill in all required fields, including valid distance and rate per km.');
      return;
    }

    const finalData = calculateBookingTotals({
      invoiceId,
      invoiceDate,
      customerName,
      customerPhone,
      personsCount,
      customerEmail,
      billingAddress,
      customerType,
      pickupLocation,
      dropLocation,
      pickupDate,
      pickupTime,
      dropTime,
      driverName,
      vehicleNumber,
      vehicleType,
      distanceKm: Number(distanceKm) || 0,
      totalHours: totalHours === '' ? undefined : Number(totalHours),
      ratePerKm: Number(ratePerKm) || 0,
      driverBata,
      tollParking,
      extraHoursCount: extraHoursCount === '' ? undefined : Number(extraHoursCount),
      waitingCharges,
      discount,
      gstRate: gstRate === '' ? 0 : Number(gstRate),
      createdAt: new Date().toISOString(),
    });

    onSaveBooking(finalData);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Title & Preset Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
              Invoice #{invoiceId}
            </span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create Cab Booking & Bill</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Fill in the customer details and trip parameters to auto-generate the Tharani Cabs official invoice.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => {
              setInvoiceId(generateNextInvoiceId(existingBookings));
              setInvoiceDate(new Date().toISOString().split('T')[0]);
              setCustomerName('');
              setCustomerPhone('');
              setPersonsCount(1);
              setCustomerEmail('');
              setBillingAddress('');
              setCustomerType('individual');
              setPickupLocation('');
              setDropLocation('');
              setPickupDate(new Date().toISOString().split('T')[0]);
              setPickupTime('');
              setDropTime('');
              setDriverName('');
              setVehicleNumber('');
              setVehicleType('');
              setDistanceKm('');
              setTotalHours('');
              setRatePerKm('');
              setDriverBata(0);
              setTollParking(0);
              setExtraHoursCount('');
              setWaitingCharges(0);
              setDiscount(0);
              setGstRate('');
            }}
            className="flex items-center space-x-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium px-3.5 py-2.5 rounded-xl text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Form</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Input Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Customer Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <User className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">1. Customer Information</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Customer / Company Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  WhatsApp Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 996543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Customer Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCustomerType('individual')}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      customerType === 'individual'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/10'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Individual
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomerType('business')}
                    className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                      customerType === 'business'
                        ? 'border-amber-500 bg-amber-50 text-amber-900 ring-2 ring-amber-500/10'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Business
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Customer Email (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. customer@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Billing Address (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 123 Business Park, Sector 5, Coimbatore"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trip Details */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <MapPin className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">2. Trip Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gandhipuram"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Drop Location *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Coimbatore Airport"
                  value={dropLocation}
                  onChange={(e) => setDropLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Pickup Date
                </label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Pickup Time
                  </label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Drop Time
                  </label>
                  <input
                    type="text"
                    placeholder="06:00 PM"
                    value={dropTime}
                    onChange={(e) => setDropTime(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Driver & Vehicle Selection */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Car className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">3. Vehicle & Driver</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Vehicle Type / Model
                </label>
                <input
                  type="text"
                  placeholder="e.g. Innova Crysta"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Driver Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Nadhagopal"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Vehicle Registration No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. TN37 CE 3466"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-medium transition-all"
                />
              </div>
            </div>

            {/* Distance KM + Total Hours + Rate per KM */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Distance (KM) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={distanceKm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDistanceKm(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-bold transition-all pr-12"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">KM</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Total Hours
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={totalHours}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTotalHours(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-bold transition-all pr-12"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">HRS</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Rate per KM (₹) *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={ratePerKm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setRatePerKm(val === '' ? '' : parseFloat(val));
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-slate-900 text-sm font-bold transition-all pr-12"
                  />
                  <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">₹/KM</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Extra Hours & Discounts */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Calculator className="w-5 h-5 text-amber-600" />
              <h2 className="text-base font-bold text-slate-900">4. Extra Charges & GST</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Driver Bata (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={driverBata}
                  onChange={(e) => setDriverBata(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Toll & Parking (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={tollParking}
                  onChange={(e) => setTollParking(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Extra Hours (HRS)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="e.g. 2"
                  value={extraHoursCount}
                  onChange={(e) => {
                    const val = e.target.value;
                    setExtraHoursCount(val === '' ? '' : parseFloat(val));
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Extra Hours Amt (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={waitingCharges}
                  onChange={(e) => setWaitingCharges(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  GST Rate
                </label>
                <select
                  value={gstRate === '' ? 0 : gstRate}
                  onChange={(e) => setGstRate(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm font-medium bg-white cursor-pointer"
                >
                  <option value={5}>5%</option>
                  <option value={0}>0%</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Fare Summary Card & Submit */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl sticky top-24 space-y-6 border border-slate-800">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <span className="text-xs font-bold tracking-widest text-amber-400 uppercase">
                Fare Summary
              </span>
              <span className="text-xs text-slate-400 font-mono">{liveBookingData.invoiceId}</span>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cab Fare ({distanceKm} km × ₹{ratePerKm})</span>
                <span className="font-bold text-white">{formatCurrency(liveBookingData.cabFare)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Driver Bata</span>
                <span className="font-medium text-white">{formatCurrency(driverBata)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">Toll & Parking</span>
                <span className="font-medium text-white">{formatCurrency(tollParking)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-400">
                  Extra Hours {extraHoursCount ? `(${extraHoursCount} hrs)` : ''}
                </span>
                <span className="font-medium text-white">{formatCurrency(waitingCharges)}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <span className="text-slate-300 font-medium">Subtotal</span>
                <span className="font-bold text-white">{formatCurrency(liveBookingData.subtotal)}</span>
              </div>

              {liveBookingData.gstRate > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">GST ({liveBookingData.gstRate}%)</span>
                  <span className="font-medium text-white">{formatCurrency(liveBookingData.gstAmount)}</span>
                </div>
              )}
            </div>

            {/* Total Payable Box */}
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase block">
                  TOTAL PAYABLE
                </span>
                <span className="text-xs text-amber-200/70">Inclusive of all taxes</span>
              </div>
              <span className="text-2xl font-black text-amber-400 tracking-tight">
                {formatCurrency(liveBookingData.totalPayable)}
              </span>
            </div>

            {/* Main Submit Button */}
            <button
              type="submit"
              className="w-full flex items-center justify-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-base py-3.5 px-6 rounded-2xl transition-all shadow-lg shadow-amber-500/25 active:scale-95"
            >
              <FileCheck className="w-5 h-5" />
              <span>Generate Invoice & Book</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
