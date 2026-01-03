import React, { useState } from 'react';
import { supabaseHelpers } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const LOGO_OPTIONS = ['🏢', '🚀', '🛒', '🏥', '💼', '🎯', '⚡', '🌟', '🔷', '🏭'];
const TAG_OPTIONS = ['Enterprise', 'Startup', 'Priority', 'Long-term', 'New'];

export default function AddClientModal({ onClose, onClientCreated }) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Company Details
    logo: '🏢',
    logo_color: '#7C3AED',
    name: '',
    industry: '',
    website: '',
    address_street: '',
    address_city: '',
    address_state: '',
    address_zip: '',

    // Step 2: Primary Contact
    contact_name: '',
    contact_title: '',
    contact_email: '',
    contact_phone: '',

    // Step 3: Billing & Notes
    billing_type: 'Net 30',
    billing_currency: 'USD',
    tags: [],
    notes: '',
  });

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const toggleTag = (tag) => {
    if (formData.tags.includes(tag)) {
      handleChange('tags', formData.tags.filter((t) => t !== tag));
    } else {
      handleChange('tags', [...formData.tags, tag]);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return true; // Optional step
      case 3:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);

    // Create client
    const clientData = {
      logo: formData.logo,
      logo_color: formData.logo_color,
      name: formData.name,
      industry: formData.industry || null,
      website: formData.website || null,
      address_street: formData.address_street || null,
      address_city: formData.address_city || null,
      address_state: formData.address_state || null,
      address_zip: formData.address_zip || null,
      billing_type: formData.billing_type,
      billing_currency: formData.billing_currency,
      tags: formData.tags,
      notes: formData.notes || null,
      status: 'active',
      created_by: user.id,
    };

    const { data: client, error: clientError } = await supabaseHelpers.createClient(clientData);

    if (clientError) {
      alert('Failed to create client. Please try again.');
      setLoading(false);
      return;
    }

    // Create primary contact if provided
    if (formData.contact_name) {
      const contactData = {
        client_id: client[0].id,
        full_name: formData.contact_name,
        job_title: formData.contact_title || null,
        email: formData.contact_email || null,
        phone: formData.contact_phone || null,
        is_primary: true,
      };

      await supabaseHelpers.createClientContact(contactData);
    }

    setLoading(false);
    onClientCreated(client[0]);
  };

  const getProgressWidth = () => {
    return `${(currentStep / 3) * 100}%`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>

        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl">
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 rounded-t-xl overflow-hidden">
            <div
              className="h-full bg-purple-600 transition-all duration-300"
              style={{ width: getProgressWidth() }}
            ></div>
          </div>

          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center text-2xl">
                  🏢
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentStep === 1 && 'Company Details'}
                    {currentStep === 2 && 'Primary Contact'}
                    {currentStep === 3 && 'Billing & Notes'}
                  </h2>
                  <p className="text-sm text-gray-600">Step {currentStep} of 3</p>
                </div>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
                ✕
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px]">
            {currentStep === 1 && (
              <Step1CompanyDetails formData={formData} onChange={handleChange} />
            )}
            {currentStep === 2 && (
              <Step2PrimaryContact formData={formData} onChange={handleChange} />
            )}
            {currentStep === 3 && (
              <Step3BillingNotes formData={formData} onChange={handleChange} toggleTag={toggleTag} />
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 flex items-center justify-between bg-gray-50 rounded-b-xl">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-4 py-2 text-gray-700 hover:bg-white rounded-lg border border-gray-300"
                >
                  ← Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Step Indicators */}
              <div className="flex gap-2 mr-4">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`w-2 h-2 rounded-full ${
                      step === currentStep
                        ? 'bg-purple-600'
                        : step < currentStep
                        ? 'bg-purple-300'
                        : 'bg-gray-300'
                    }`}
                  ></div>
                ))}
              </div>

              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-white rounded-lg border border-gray-300"
              >
                Cancel
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading || !canProceed()}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    '✓ Create Client'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step1CompanyDetails({ formData, onChange }) {
  return (
    <div className="space-y-6">
      {/* Logo Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
        <div className="grid grid-cols-10 gap-2">
          {LOGO_OPTIONS.map((logo) => (
            <button
              key={logo}
              onClick={() => onChange('logo', logo)}
              className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-2xl transition-all ${
                formData.logo === logo
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {logo}
            </button>
          ))}
        </div>
      </div>

      {/* Company Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Company Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Acme Corporation"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {/* Industry & Website */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
          <input
            type="text"
            value={formData.industry}
            onChange={(e) => onChange('industry', e.target.value)}
            placeholder="Technology"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => onChange('website', e.target.value)}
            placeholder="https://example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
        <input
          type="text"
          value={formData.address_street}
          onChange={(e) => onChange('address_street', e.target.value)}
          placeholder="Street address"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 mb-3"
        />
        <div className="grid grid-cols-6 gap-3">
          <div className="col-span-2">
            <input
              type="text"
              value={formData.address_city}
              onChange={(e) => onChange('address_city', e.target.value)}
              placeholder="City"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div className="col-span-1">
            <input
              type="text"
              value={formData.address_state}
              onChange={(e) => onChange('address_state', e.target.value)}
              placeholder="State"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <div className="col-span-3">
            <input
              type="text"
              value={formData.address_zip}
              onChange={(e) => onChange('address_zip', e.target.value)}
              placeholder="ZIP Code"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step2PrimaryContact({ formData, onChange }) {
  return (
    <div className="space-y-6">
      {/* Icon */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-4xl">
          👤
        </div>
      </div>

      {/* Name & Title */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
          <input
            type="text"
            value={formData.contact_name}
            onChange={(e) => onChange('contact_name', e.target.value)}
            placeholder="John Smith"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
          <input
            type="text"
            value={formData.contact_title}
            onChange={(e) => onChange('contact_title', e.target.value)}
            placeholder="CTO"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          type="email"
          value={formData.contact_email}
          onChange={(e) => onChange('contact_email', e.target.value)}
          placeholder="john@example.com"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
        <input
          type="tel"
          value={formData.contact_phone}
          onChange={(e) => onChange('contact_phone', e.target.value)}
          placeholder="+1 (555) 123-4567"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <span className="text-blue-600 text-xl">💡</span>
        <p className="text-sm text-blue-900">
          You can add more contacts after creating the client from the client detail page.
        </p>
      </div>
    </div>
  );
}

function Step3BillingNotes({ formData, onChange, toggleTag }) {
  return (
    <div className="space-y-6">
      {/* Payment Terms & Currency */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Payment Terms</label>
          <select
            value={formData.billing_type}
            onChange={(e) => onChange('billing_type', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="Net 15">Net 15</option>
            <option value="Net 30">Net 30</option>
            <option value="Net 45">Net 45</option>
            <option value="Net 60">Net 60</option>
            <option value="Due on Receipt">Due on Receipt</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
          <select
            value={formData.billing_currency}
            onChange={(e) => onChange('billing_currency', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD ($)</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                formData.tags.includes(tag)
                  ? 'border-purple-600 bg-purple-100 text-purple-700'
                  : 'border-gray-200 text-gray-700 hover:border-gray-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          placeholder="Add any important notes about this client..."
          rows={6}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
        ></textarea>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <h4 className="font-semibold text-gray-900 mb-3">Summary</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{formData.logo}</span>
            <span className="font-semibold">{formData.name || 'Company Name'}</span>
          </div>
          {formData.industry && (
            <div className="text-gray-600">Industry: {formData.industry}</div>
          )}
          {formData.contact_name && (
            <div className="text-gray-600">Primary Contact: {formData.contact_name}</div>
          )}
          <div className="text-gray-600">Payment Terms: {formData.billing_type}</div>
        </div>
      </div>
    </div>
  );
}
