const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('nav');
const appointmentForm = document.querySelector('#appointment-form');
const payrollForm = document.querySelector('#payroll-form');

function closeMenu() {
  navigation.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  menuButton.textContent = '☰';
}

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const isOpen = navigation.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    menuButton.textContent = isOpen ? '×' : '☰';
  });

  document.querySelectorAll('nav a').forEach((link) => link.addEventListener('click', closeMenu));
}

if (appointmentForm) {
  appointmentForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const message = form.querySelector('.form-message');
    const formData = Object.fromEntries(new FormData(form));

    if (window.location.protocol === 'file:') {
      const subject = encodeURIComponent(`Gynaecology appointment request — ${formData.name}`);
      const body = encodeURIComponent(`New Gynaecology appointment request\n\nName: ${formData.name}\nPhone: ${formData.phone}\nService: ${formData.service}`);
      window.location.href = `mailto:manibabubendi@gmail.com?subject=${subject}&body=${body}`;
      message.textContent = 'Your email app will open with the appointment request ready to send.';
      form.reset();
      return;
    }

    button.disabled = true;
    button.setAttribute('aria-busy', 'true');
    button.textContent = 'Sending…';
    message.textContent = '';

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || 'Unable to send your request. Please call the hospital directly.');

      message.textContent = 'Thank you. Your appointment request has been sent.';
      form.reset();
    } catch (error) {
      message.textContent = error.message || 'Unable to send your request. Please call the hospital directly.';
    } finally {
      button.disabled = false;
      button.removeAttribute('aria-busy');
      button.innerHTML = 'Request appointment <span>→</span>';
    }
  });
}

if (payrollForm) {
  payrollForm.addEventListener('submit', (event) => {
    event.preventDefault();
    payrollForm.querySelector('.payroll-message').textContent = '';
    payrollForm.reset();
  });
}
