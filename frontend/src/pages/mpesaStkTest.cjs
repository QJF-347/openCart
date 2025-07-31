import axios from 'axios';
import { Buffer } from 'buffer';

window.Buffer = window.Buffer || Buffer;

// Set your credentials and parameters
const config = {
  consumerKey: "6U8UmjMUtn7MgUs2FiFEU9wG0GhrSNXSXMaXw5ikxnIzzlaG",
  consumerSecret: "PaM9cBZpk9MC2NEFXQChRmMvS21mebZUMMpRZYdVxUVmrApdkEwvXImJVV8vhxcG",
  shortcode: "174379",
  passkey: "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919",
  phoneNumber: "254703303445",
  callbackURL: "https://webhook.site/1ce723ac-ef61-4f40-95ef-33f7f5c0c28f"
};

export async function initiateSTKPush() {
  try {
    // Get access token
    const authResponse = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        auth: {
          username: config.consumerKey,
          password: config.consumerSecret
        }
      }
    );

    console.log("Auth response:", authResponse.data);

    const accessToken = authResponse.data.access_token;
    if (!accessToken) {
      throw new Error("No access token found in response");
    }
    console.log("Access token:", accessToken);

    // Generate password
    const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
    const dataToEncode = config.shortcode + config.passkey + timestamp;
    const encodedPassword = Buffer.from(dataToEncode).toString('base64');
    console.log(`Encoded Password for: ${dataToEncode} ::> ${encodedPassword}`);

    const headers = {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    };

    const payload = {
      "BusinessShortCode": config.shortcode,
      "Password": encodedPassword,
      "Timestamp": timestamp,
      "TransactionType": "CustomerPayBillOnline",
      "Amount": 1,
      "PartyA": config.phoneNumber,
      "PartyB": config.shortcode,
      "PhoneNumber": config.phoneNumber,
      "CallBackURL": config.callbackURL,
      "AccountReference": "0110186285790",
      "TransactionDesc": "POS payment test"
    };

    const response = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      payload,
      { headers }
    );

    console.log("STK Push response:", response.data);
    return response.data;
    
  } catch (error) {
    console.error("Error:", error.response ? error.response.data : error.message);
    throw error;
  }
}

initiateSTKPush()
  .then(result => console.log("Success:", result))
  .catch(err => console.error("Failed:", err));