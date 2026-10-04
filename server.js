const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Sample data for 5 countries (demo)
const countries = [
  { code: 'US', name: 'United States', currency: 'USD', taxRate: 8.5, shippingBase: 10 },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', taxRate: 20, shippingBase: 12 },
  { code: 'IN', name: 'India', currency: 'INR', taxRate: 18, shippingBase: 150 },
  { code: 'DE', name: 'Germany', currency: 'EUR', taxRate: 19, shippingBase: 8 },
  { code: 'AU', name: 'Australia', currency: 'AUD', taxRate: 10, shippingBase: 15 }
];

const products = [
  { id: 1, name: 'T-Shirt', basePrice: 100, marginPercent: 40, category: 'Apparel' },
  { id: 2, name: 'Board/Banner', basePrice: 250, marginPercent: 35, category: 'Print' },
  { id: 3, name: 'Hoodie', basePrice: 200, marginPercent: 45, category: 'Apparel' },
  { id: 4, name: 'Cap', basePrice: 80, marginPercent: 50, category: 'Apparel' },
  { id: 5, name: 'Mug', basePrice: 120, marginPercent: 40, category: 'Drinkware' }
];

const messageTemplates = [
  { id: 1, name: 'Order Confirmation', text: 'Hi {name}, your order {orderID} has been confirmed!' },
  { id: 2, name: 'Payment Received', text: 'Payment received for order {orderID}. Printing will start soon!' },
  { id: 3, name: 'Printing Started', text: 'Hi {name}, your design is now being printed.' },
  { id: 4, name: 'Quality Check', text: 'Quality check completed for order {orderID}.' },
  { id: 5, name: 'Shipped', text: 'Your order {orderID} has been shipped! Tracking: {tracking}' },
  { id: 6, name: 'Delivered', text: 'Delivered! Thank you for your purchase, {name}!' },
  { id: 7, name: 'Design Approval', text: 'Please approve your design for order {orderID}.' },
  { id: 8, name: 'Payment Reminder', text: 'Payment pending for order {orderID}. Please complete payment.' },
  { id: 9, name: 'Return Request', text: 'Return approved for order {orderID}.' },
  { id: 10, name: 'Feedback', text: 'How was your experience? Rate your order {orderID}.' }
];

function calculatePrice(basePrice, quantity, marginPercent, country) {
  const selectedCountry = countries.find(c => c.code === country);
  if (!selectedCountry) return null;

  const margin = (basePrice * marginPercent) / 100;
  const subtotal = basePrice + margin;
  const shipping = selectedCountry.shippingBase * Math.ceil(quantity / 5);
  const taxAmount = (subtotal + shipping) * (selectedCountry.taxRate / 100);
  const totalPrice = subtotal + shipping + taxAmount;

  return {
    basePrice,
    margin,
    subtotal,
    shipping,
    tax: taxAmount,
    totalPrice: Math.round(totalPrice * 100) / 100,
    currency: selectedCountry.currency,
    country: selectedCountry.name,
    profit: margin - (shipping * 0.3)
  };
}

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'SSS Smart System Support' });
});

app.get('/api/countries', (req, res) => {
  res.json(countries);
});

app.get('/api/products', (req, res) => {
  res.json(products);
});

app.get('/api/messages', (req, res) => {
  res.json(messageTemplates);
});

app.post('/api/quote', (req, res) => {
  const { basePrice, quantity, marginPercent, country } = req.body;
  
  if (!basePrice || !quantity || !marginPercent || !country) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const quote = calculatePrice(Number(basePrice), Number(quantity), Number(marginPercent), country);
  
  if (!quote) {
    return res.status(404).json({ error: 'Country not found' });
  }

  res.json(quote);
});

app.post('/api/orders', (req, res) => {
  const { customer, product, quantity, country, design } = req.body;

  if (!customer || !product || !quantity || !country) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const selectedProduct = products.find(p => p.name === product);
  if (!selectedProduct) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const quote = calculatePrice(selectedProduct.basePrice, Number(quantity), selectedProduct.marginPercent, country);
  const orderID = 'SSS-' + Date.now();

  const order = {
    orderID,
    customer,
    product,
    quantity: Number(quantity),
    country: quote.country,
    currency: quote.currency,
    basePrice: quote.basePrice,
    margin: quote.margin,
    shipping: quote.shipping,
    tax: quote.tax,
    totalPrice: quote.totalPrice,
    profit: quote.profit,
    status: 'Confirmed',
    design: design || 'Default',
    createdAt: new Date().toISOString()
  };

  const autoMessage = `Hi ${customer}, your order ${orderID} has been confirmed! Total: ${quote.currency} ${quote.totalPrice}`;

  res.json({
    order,
    autoMessage,
    messageTemplate: messageTemplates[0]
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🚀 SSS Smart System Support running at http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard`);
  console.log(`🌍 Supporting 200+ countries with AI automation\n`);
});
