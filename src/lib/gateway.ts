/**
 * BizSuite WhatsApp Gateway Client for EventPix
 */

const GATEWAY_URL = process.env.BIZSUITE_GATEWAY_URL || 'https://www.cliniqcare.co.in/api/gateway';
const GATEWAY_KEY = process.env.BIZSUITE_GATEWAY_KEY || 'bs_live_5aa91306d4ee1bd8e1414f14a75cde326d6165ee0026e624';

export const gateway = {
  /**
   * Request an OTP to be sent via WhatsApp
   */
  async requestOTP(phone: string) {
    // Clean the phone number (ensure country code)
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const response = await fetch(`${GATEWAY_URL}/otp/request`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: cleanPhone })
    });

    return response.json();
  },

  /**
   * Verify an OTP code
   */
  async verifyOTP(phone: string, code: string) {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;

    const response = await fetch(`${GATEWAY_URL}/otp/verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GATEWAY_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ phone: cleanPhone, code })
    });

    return response.json();
  }
};
