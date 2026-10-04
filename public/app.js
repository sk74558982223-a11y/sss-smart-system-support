async function fetchData(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  return response.json();
}

function displayProducts(products) {
  const list = document.getElementById('productsList');
  list.innerHTML = products.map(p => `
    <div class="item">
      <strong>${p.name}</strong>
      <small>Base: $${p.basePrice} | Margin: ${p.marginPercent}%</small>
    </div>
  `).join('');
}

function displayMessages(messages) {
  const list = document.getElementById('messagesList');
  list.innerHTML = messages.map(m => `
    <div class="item">
      <strong>${m.name}</strong>
      <small>${m.text.substring(0, 50)}...</small>
    </div>
  `).join('');
}

document.getElementById('quoteForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    basePrice: document.getElementById('basePrice').value,
    quantity: document.getElementById('quantity').value,
    marginPercent: document.getElementById('marginPercent').value,
    country: document.getElementById('country').value
  };

  const quote = await fetchData('/api/quote', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (quote.error) {
    alert(quote.error);
    return;
  }

  const result = `
    <strong>Total Price: ${quote.currency} ${quote.totalPrice}</strong>
    <div>Base: ${quote.currency} ${quote.basePrice} | Margin: ${quote.currency} ${quote.margin.toFixed(2)}</div>
    <div>Shipping: ${quote.currency} ${quote.shipping.toFixed(2)} | Tax: ${quote.currency} ${quote.tax.toFixed(2)}</div>
    <div style="color: green; margin-top: 10px;"><strong>Profit: ${quote.currency} ${quote.profit.toFixed(2)}</strong></div>
  `;
  document.getElementById('quoteResult').innerHTML = result;
});

document.getElementById('orderForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const data = {
    customer: document.getElementById('customerName').value,
    product: document.getElementById('productSelect').value,
    quantity: document.getElementById('orderQuantity').value,
    country: document.getElementById('orderCountry').value
  };

  const response = await fetchData('/api/orders', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (response.error) {
    alert(response.error);
    return;
  }

  alert(`Order Created!\n\nOrder ID: ${response.order.orderID}\nTotal: ${response.order.currency} ${response.order.totalPrice}\n\nAuto Message: ${response.autoMessage}`);
  document.getElementById('orderForm').reset();
});

// Load initial data
window.addEventListener('DOMContentLoaded', async () => {
  const [products, messages] = await Promise.all([
    fetchData('/api/products'),
    fetchData('/api/messages')
  ]);
  
  displayProducts(products);
  displayMessages(messages);
});
