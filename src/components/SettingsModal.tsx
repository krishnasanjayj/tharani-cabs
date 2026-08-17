import React, { useState } from 'react';
import { Car, MessageSquare, Save, CheckCircle } from 'lucide-react';
import type { WhatsAppConfig } from '../types/booking';
import { COMPANY_INFO, DEFAULT_VEHICLE_RATES } from '../types/booking';

interface SettingsModalProps {
  whatsappConfig: WhatsAppConfig;
  onSaveWhatsAppConfig: (config: WhatsAppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  whatsappConfig,
  onSaveWhatsAppConfig,
}) => {
  const [mode, setMode] = useState<'direct' | 'twilio' | 'webhook'>(whatsappConfig.mode || 'direct');
  const [accountSid, setAccountSid] = useState(whatsappConfig.accountSid || '');
  const [authToken, setAuthToken] = useState(whatsappConfig.authToken || '');
  const [fromNumber, setFromNumber] = useState(whatsappConfig.fromNumber || '');
  const [webhookUrl, setWebhookUrl] = useState(whatsappConfig.webhookUrl || '');
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWhatsAppConfig({
      mode,
      accountSid,
      authToken,
      fromNumber,
      webhookUrl,
    });
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Settings & Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage WhatsApp API credentials, company branding info, and vehicle rate cards.
        </p>
      </div>

      {savedStatus && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-2 text-sm font-medium">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* 1. WhatsApp API Integration Settings */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
          <MessageSquare className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">1. WhatsApp API Dispatch Integration</h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
              Dispatch Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'direct'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="direct"
                  checked={mode === 'direct'}
                  onChange={() => setMode('direct')}
                  className="sr-only"
                />
                <div className="font-bold text-slate-900 text-sm">Direct WhatsApp Web API</div>
                <div className="text-xs text-slate-500 mt-1">
                  1-click instant launcher (wa.me) with pre-filled customer confirmation message. No key required.
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'twilio'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="twilio"
                  checked={mode === 'twilio'}
                  onChange={() => setMode('twilio')}
                  className="sr-only"
                />
                <div className="font-bold text-slate-900 text-sm">Twilio WhatsApp API</div>
                <div className="text-xs text-slate-500 mt-1">
                  Programmatic WhatsApp messaging via Twilio account SID and Auth Token.
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  mode === 'webhook'
                    ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="mode"
                  value="webhook"
                  checked={mode === 'webhook'}
                  onChange={() => setMode('webhook')}
                  className="sr-only"
                />
                <div className="font-bold text-slate-900 text-sm">Custom Webhook API</div>
                <div className="text-xs text-slate-500 mt-1">
                  Post JSON booking payload to external WhatsApp gateway / Meta Cloud API webhook.
                </div>
              </label>
            </div>
          </div>

          {mode === 'twilio' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Account SID
                </label>
                <input
                  type="text"
                  placeholder="ACxxxxxxxxxxxxxxxx"
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Auth Token
                </label>
                <input
                  type="password"
                  placeholder="••••••••••••••••"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  From Number (WhatsApp)
                </label>
                <input
                  type="text"
                  placeholder="+14155238886"
                  value={fromNumber}
                  onChange={(e) => setFromNumber(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>
            </div>
          )}

          {mode === 'webhook' && (
            <div className="pt-2 border-t border-slate-100">
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Webhook URL
              </label>
              <input
                type="url"
                placeholder="https://your-webhook.com/whatsapp-send"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Vehicle Rate Cards */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Car className="w-5 h-5 text-amber-600" />
          <h2 className="text-base font-bold text-slate-900">2. Default Vehicle Tariff Cards</h2>
        </div>

        <div className="divide-y divide-slate-100 text-sm">
          {DEFAULT_VEHICLE_RATES.map((rate) => (
            <div key={rate.id} className="py-3 flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-900">{rate.name}</div>
                <div className="text-xs text-slate-500">{rate.description}</div>
              </div>
              <div className="text-right">
                <span className="font-black text-amber-600 text-base">₹{rate.ratePerKm}/km</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Company Branding Info */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
          3. Company Branding Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block">Company Name</span>
            <span className="font-bold text-slate-900">{COMPANY_INFO.name}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block">GSTIN</span>
            <span className="font-bold text-slate-900">{COMPANY_INFO.gstin}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block">Address</span>
            <span className="font-medium text-slate-700">{COMPANY_INFO.address}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase block">Contact Phone & Email</span>
            <span className="font-medium text-slate-700">{COMPANY_INFO.phone} | {COMPANY_INFO.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
