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

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showView(btn.dataset.view);
      if (btn.dataset.view === 'list') {
        renderList();
      }
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
