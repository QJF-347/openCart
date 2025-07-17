const fetch = require('node-fetch');

async function testOrderCreation() {
  try {
    const orderData = {
      products: [
        {
          id: "6861a84982462f318f856b92",
          quantity: 1,
          price: 1299.99
        }
      ],
      customerInfo: {
        name: "Test Customer",
        email: "test@example.com"
      }
    };

    const response = await fetch('http://localhost:3001/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error:', response.status, errorText);
    } else {
      const result = await response.json();
      console.log('Success:', result);
    }
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testOrderCreation(); 