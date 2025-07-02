document.addEventListener('DOMContentLoaded', () => {
  const views = document.querySelectorAll('.view');
  const navButtons = document.querySelectorAll('nav button');
  const shoppingListEl = document.getElementById('shopping-list');
  const emptyMsg = document.getElementById('empty-msg');
  const form = document.getElementById('product-form');
  const productNameInput = document.getElementById('product-name');
  const productQtyInput = document.getElementById('product-qty');

  function showView(viewId) {
    views.forEach(view => view.hidden = (view.id !== viewId));
  }

  async function renderList() {
    const products = await getAllProducts();
    shoppingListEl.innerHTML = '';

    if (products.length === 0) {
      emptyMsg.style.display = 'block';
      return;
    } else {
      emptyMsg.style.display = 'none';
    }

    products.forEach(product => {
      const li = document.createElement('li');
      li.textContent = `${product.name} - ilość: ${product.qty}`;

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Usuń';
      delBtn.addEventListener('click', async () => {
        await deleteProduct(product.id);
        renderList();
      });

      li.appendChild(delBtn);
      shoppingListEl.appendChild(li);
    });
  }

  async function fetchWeather(city = 'Warsaw') {
    const apiKey = 'b6907d289e10d714a6e88b30761fae22'; // klucz demo OpenWeather
    const url = `https://openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pl`;

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Błąd sieci');
      const data = await response.json();
      await saveWeatherData(data); // zapis do IndexedDB
      return data;
    } catch (err) {
      console.warn('Błąd pobierania pogody, używam danych z IndexedDB:', err);
      const cachedData = await getWeatherData();
      return cachedData;
    }
  }

  async function showWeather() {
    const weatherData = await fetchWeather();
    const infoDiv = document.getElementById('weather-info');
    if (!weatherData) {
      infoDiv.textContent = 'Brak danych pogodowych (sprawdź połączenie).';
      return;
    }
    infoDiv.innerHTML = `
      <p><strong>Miasto:</strong> ${weatherData.name}</p>
      <p><strong>Warunki:</strong> ${weatherData.weather[0].description}</p>
      <p><strong>Temperatura:</strong> ${weatherData.main.temp} °C</p>
      <p><strong>Wilgotność:</strong> ${weatherData.main.humidity}%</p>
      <p><strong>Wiatr:</strong> ${weatherData.wind.speed} m/s</p>
    `;
  }

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showView(btn.dataset.view);
      if (btn.dataset.view === 'list') renderList();
      if (btn.dataset.view === 'weather') showWeather();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = productNameInput.value.trim();
    const qty = parseInt(productQtyInput.value);

    if (!name || qty <= 0) return alert('Podaj poprawne dane');

    await addProduct({ name, qty });
    productNameInput.value = '';
    productQtyInput.value = 1;

    alert('Produkt dodany!');
  });

  showView('home');

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('js/service-worker.js')
      .then(() => console.log('Service Worker zarejestrowany'))
      .catch(err => console.error('Błąd rejestracji SW:', err));
  }
});
