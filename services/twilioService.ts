
/**
 * Twilio Verify API Service
 * 
 * IMPORTANT: This client-side implementation uses your provided credentials.
 * In production, you must move this to a server-side endpoint (Node.js/Python/Go)
 * to prevent leaking your Auth Token.
 */

const TWILIO_ACCOUNT_SID = 'AC207672336abc680357c854fe583cf6ba';
const TWILIO_AUTH_TOKEN = '760edfc7a5c6edfe799955aaa7f8107f';
const TWILIO_VERIFY_SERVICE_SID = 'VAbf7024ff033fa0512405d604e6d76c3f';

// Base64 encoding for Basic Auth
const getAuthHeader = () => {
    return 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
};

/**
 * Normalizes phone numbers to E.164 format.
 * Automatically adds +1 for 10-digit North American numbers.
 */
const formatE164 = (phoneNumber: string): string => {
    if (phoneNumber.startsWith('+')) return phoneNumber;
    
    const digits = phoneNumber.replace(/\D/g, '');
    
    // If user entered 10 digits (e.g. 5551234567), prepend +1
    if (digits.length === 10) {
        return `+1${digits}`;
    }
    
    // If user entered 11 digits starting with 1 (e.g. 15551234567), prepend +
    if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
    }
    
    // Fallback: just prepend + to whatever digits they provided
    return `+${digits}`;
};

/**
 * Sends a verification code to the provided phone number via SMS.
 */
export const sendVerificationCode = async (phoneNumber: string): Promise<boolean> => {
    const formattedPhone = formatE164(phoneNumber);
    
    const url = `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/Verifications`;
    
    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('Channel', 'sms');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': getAuthHeader(),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error('Twilio Error:', errData);
            return false;
        }

        const data = await response.json();
        return data.status === 'pending';
    } catch (error) {
        console.error('Network Error calling Twilio:', error);
        return false;
    }
};

/**
 * Checks the verification code entered by the user.
 */
export const checkVerificationCode = async (phoneNumber: string, code: string): Promise<boolean> => {
    const formattedPhone = formatE164(phoneNumber);
    const url = `https://verify.twilio.com/v2/Services/${TWILIO_VERIFY_SERVICE_SID}/VerificationCheck`;
    
    const params = new URLSearchParams();
    params.append('To', formattedPhone);
    params.append('Code', code);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': getAuthHeader(),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            const errData = await response.json();
            console.error('Twilio Verification Error:', errData);
            return false;
        }

        const data = await response.json();
        // data.status will be 'approved' if successful
        return data.status === 'approved';
    } catch (error) {
        console.error('Network Error checking Twilio code:', error);
        return false;
    }
};
