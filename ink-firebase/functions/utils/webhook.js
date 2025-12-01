const { generateHMAC } = require('./crypto');

const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

// Send single webhook request (internal function)
async function sendWebhookRequest(url, signature, payload, attempt = 1) {
  const payloadString = JSON.stringify(payload);
  const timestamp = new Date().toISOString();
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[WEBHOOK REQUEST] Attempt ${attempt} - ${timestamp}`);
  console.log(`${'='.repeat(80)}`);
  console.log(`[WEBHOOK] Method: POST`);
  console.log(`[WEBHOOK] URL: ${url}`);
  console.log(`[WEBHOOK] Headers:`);
  console.log(`  Content-Type: application/json`);
  console.log(`  X-INK-Signature: ${signature}`);
  console.log(`[WEBHOOK] Request Body:`);
  console.log(JSON.stringify(payload, null, 2));
  console.log(`[WEBHOOK] Payload Size: ${payloadString.length} bytes`);
  console.log(`${'='.repeat(80)}\n`);

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-INK-Signature': signature
      },
      body: payloadString
    });

    const responseText = await response.text();
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch (e) {
      responseBody = responseText;
    }

    console.log(`\n${'='.repeat(80)}`);
    console.log(`[WEBHOOK RESPONSE] Attempt ${attempt} - ${new Date().toISOString()}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`[WEBHOOK] Status: ${response.status} ${response.statusText}`);
    console.log(`[WEBHOOK] Response Headers:`);
    const headersObj = {};
    response.headers.forEach((value, key) => {
      headersObj[key] = value;
      console.log(`  ${key}: ${value}`);
    });
    if (Object.keys(headersObj).length === 0) {
      console.log(`  (no headers)`);
    }
    console.log(`[WEBHOOK] Response Body:`);
    if (typeof responseBody === 'object') {
      console.log(JSON.stringify(responseBody, null, 2));
    } else {
      console.log(responseBody);
    }
    console.log(`[WEBHOOK] Response Size: ${responseText.length} bytes`);
    console.log(`${'='.repeat(80)}\n`);

    if (!response.ok) {
      throw new Error(`Webhook failed with status ${response.status}: ${response.statusText}`);
    }

    return response;
  } catch (error) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[WEBHOOK ERROR] Attempt ${attempt} - ${new Date().toISOString()}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`[WEBHOOK] Error Type: ${error.name || 'Unknown'}`);
    console.log(`[WEBHOOK] Error Message: ${error.message}`);
    if (error.code) {
      console.log(`[WEBHOOK] Error Code: ${error.code}`);
    }
    if (error.cause) {
      console.log(`[WEBHOOK] Error Cause:`, error.cause);
    }
    if (error.stack) {
      console.log(`[WEBHOOK] Stack Trace:`);
      console.log(error.stack);
    }
    console.log(`${'='.repeat(80)}\n`);
    throw error;
  }
}

// Send webhook to Shopify endpoint with retry logic
async function sendWebhook(payload) {
  const url = process.env.SHOPIFY_WEBHOOK_URL;
  
  // Skip if webhook URL is not configured
  if (!url) {
    console.log('[WEBHOOK] SHOPIFY_WEBHOOK_URL not set, skipping webhook');
    return { success: true, skipped: true };
  }

  const maxRetries = 3;
  let lastError = null;

  try {
    const timestamp = new Date().toISOString();
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[WEBHOOK INIT] Starting webhook process - ${timestamp}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`[WEBHOOK] Webhook URL: ${url}`);
    console.log(`[WEBHOOK] Max Retries: ${maxRetries}`);
    console.log(`[WEBHOOK] HMAC Secret Configured: ${process.env.HMAC_SECRET ? 'Yes' : 'No'}`);
    
    console.log(`[WEBHOOK] Generating HMAC signature...`);
    const signature = generateHMAC(payload);
    console.log(`[WEBHOOK] HMAC Signature (full): ${signature}`);
    console.log(`[WEBHOOK] HMAC Signature Length: ${signature.length} characters`);
    console.log(`${'='.repeat(80)}\n`);

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await sendWebhookRequest(url, signature, payload, attempt);
        
        // Success
        console.log(`\n${'='.repeat(80)}`);
        console.log(`[WEBHOOK SUCCESS] Webhook delivered successfully!`);
        console.log(`${'='.repeat(80)}`);
        console.log(`[WEBHOOK] Attempt: ${attempt}/${maxRetries}`);
        console.log(`[WEBHOOK] Response Status: ${response.status} ${response.statusText}`);
        console.log(`[WEBHOOK] Timestamp: ${new Date().toISOString()}`);
        console.log(`${'='.repeat(80)}\n`);
        
        return { success: true, attempt, status: response.status };
        
      } catch (error) {
        lastError = error;
        
        if (attempt < maxRetries) {
          // Calculate exponential backoff delay: 2^attempt seconds (2s, 4s, 8s)
          const delaySeconds = Math.pow(2, attempt);
          const delayMs = delaySeconds * 1000;
          
          console.log(`\n${'='.repeat(80)}`);
          console.log(`[WEBHOOK RETRY] Preparing retry - ${new Date().toISOString()}`);
          console.log(`${'='.repeat(80)}`);
          console.log(`[WEBHOOK] Attempt ${attempt}/${maxRetries} failed`);
          console.log(`[WEBHOOK] Error: ${error.message}`);
          console.log(`[WEBHOOK] Waiting ${delaySeconds} seconds before retry...`);
          console.log(`[WEBHOOK] Next attempt will be attempt ${attempt + 1}`);
          console.log(`${'='.repeat(80)}\n`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          // Final attempt failed
          console.log(`\n${'='.repeat(80)}`);
          console.log(`[WEBHOOK FAILED] All ${maxRetries} attempts exhausted`);
          console.log(`${'='.repeat(80)}`);
          console.log(`[WEBHOOK] Final Error: ${error.message}`);
          console.log(`${'='.repeat(80)}\n`);
        }
      }
    }
    
    // All retries exhausted
    throw lastError;
    
  } catch (error) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`[WEBHOOK FINAL ERROR] ${new Date().toISOString()}`);
    console.log(`${'='.repeat(80)}`);
    console.log(`[WEBHOOK] Status: FAILED`);
    console.log(`[WEBHOOK] Total Attempts: ${maxRetries}`);
    console.log(`[WEBHOOK] Error Message: ${error.message}`);
    console.log(`[WEBHOOK] Error Type: ${error.name || 'Unknown'}`);
    if (error.code) {
      console.log(`[WEBHOOK] Error Code: ${error.code}`);
    }
    if (error.stack) {
      console.log(`[WEBHOOK] Stack Trace:`);
      console.log(error.stack);
    }
    console.log(`[WEBHOOK] Original Payload:`);
    console.log(JSON.stringify(payload, null, 2));
    console.log(`${'='.repeat(80)}\n`);
    
    // Return error info instead of throwing (to avoid breaking the verify endpoint)
    return { 
      success: false, 
      error: error.message,
      attempts: maxRetries 
    };
  }
}

module.exports = { sendWebhook };

