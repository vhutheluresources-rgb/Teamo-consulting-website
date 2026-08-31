const workingSlots = [
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00"
];

let currentRating = 5;

document.addEventListener('DOMContentLoaded', function () {
    setMinimumBookingDate();
    loadSavedTheme();
    setRating(5);
    renderTestimonials();
});

function setMinimumBookingDate() {
    const dateInput = document.getElementById('b_date');

    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.setAttribute('min', today);
    }
}

function toggleMenu() {
    document.getElementById('navLinks').classList.toggle('active');
}

function closeMenu() {
    document.getElementById('navLinks').classList.remove('active');
}

function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    updateThemeIcons(newTheme);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme);
}

function updateThemeIcons(theme) {
    const sunIcon = document.getElementById('sunIcon');
    const moonIcon = document.getElementById('moonIcon');

    if (!sunIcon || !moonIcon) return;

    sunIcon.style.display = theme === 'dark' ? 'none' : 'inline';
    moonIcon.style.display = theme === 'dark' ? 'inline' : 'none';
}

function setRating(rating) {
    currentRating = rating;

    document.querySelectorAll('#rating span').forEach((star, index) => {
        star.classList.toggle('active', index < rating);
    });
}

async function submitTestimonial() {
    const name = document.getElementById('name').value.trim();
    const title = document.getElementById('title').value.trim();
    const company = document.getElementById('company').value.trim();
    const message = document.getElementById('message').value.trim();

    if (!name || !title || !company || !message) {
        showCustomAlert('Please fill in all fields.', 'error');
        return;
    }

    const testimonial = {
        name: name,
        title: title,
        company: company,
        message: message,
        rating: currentRating
    };

    try {
        const response = await fetch('/api/testimonials', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testimonial)
        });

        if (!response.ok) {
            throw new Error('Failed to submit testimonial');
        }

        clearTestimonialForm();
        showCustomAlert('Thank you! Your testimonial has been submitted for approval.', 'success');

    } catch (error) {
        console.error(error);
        showCustomAlert('Error submitting testimonial. Please try again.', 'error');
    }
}

function clearTestimonialForm() {
    document.getElementById('name').value = '';
    document.getElementById('title').value = '';
    document.getElementById('company').value = '';
    document.getElementById('message').value = '';

    setRating(5);
}

async function renderTestimonials() {
    const container = document.getElementById('testimonialsList');

    if (!container) return;

    try {
        const response = await fetch('/api/testimonials/approved');

        if (!response.ok) {
            throw new Error('Failed to load testimonials');
        }

        const testimonials = await response.json();

        if (testimonials.length === 0) {
            container.innerHTML = '<p class="empty-message">No approved testimonials yet.</p>';
            return;
        }

        container.innerHTML = testimonials.map(testimonial => `
            <div class="testimonial">
                <div class="stars">${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</div>
                <p>"${escapeHTML(testimonial.message)}"</p>
                <strong>
                    — ${escapeHTML(testimonial.name)}, ${escapeHTML(testimonial.title)}
                    <br>
                    <small>${escapeHTML(testimonial.company)}</small>
                </strong>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="empty-message">Testimonials could not be loaded.</p>';
    }
}

function updateTimeSlots() {
    const dateInput = document.getElementById('b_date');
    const timeSelect = document.getElementById('b_time');
    const notice = document.getElementById('bookingNotice');
    const submitButton = document.querySelector('#bookingForm button[type="submit"]');

    timeSelect.innerHTML = '';
    resetBookingNotice(notice);

    if (submitButton) submitButton.disabled = false;

    if (!dateInput.value) {
        timeSelect.innerHTML = '<option value="">Select a date first</option>';
        return;
    }

    const selectedDate = new Date(dateInput.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showErrorNotice(notice, 'This date has already passed. Please choose a future date.');
        timeSelect.innerHTML = '<option value="">Invalid date selected</option>';

        if (submitButton) submitButton.disabled = true;
        return;
    }

    const day = selectedDate.getDay();

    if (day === 0 || day === 6) {
        showErrorNotice(notice, 'We are closed on weekends. Please select a weekday, Monday to Friday.');
        timeSelect.innerHTML = '<option value="">Weekend not available</option>';

        if (submitButton) submitButton.disabled = true;
        return;
    }

    timeSelect.innerHTML = '<option value="">Select a time slot</option>';

    workingSlots.forEach(slot => {
        const option = document.createElement('option');
        option.value = slot;
        option.textContent = slot;
        timeSelect.appendChild(option);
    });

    if (submitButton) submitButton.disabled = false;
}

function sendBooking(event) {
    event.preventDefault();

    const name = document.getElementById('b_name').value.trim();
    const email = document.getElementById('b_email').value.trim();
    const phone = document.getElementById('b_phone').value.trim();
    const dateValue = document.getElementById('b_date').value;
    const timeValue = document.getElementById('b_time').value;
    const service = document.getElementById('b_service').value;
    const message = document.getElementById('b_message').value.trim();
    const notice = document.getElementById('bookingNotice');

    resetBookingNotice(notice);

    if (!dateValue) {
        showErrorNotice(notice, 'Please select a date.');
        return;
    }

    const selectedDate = new Date(dateValue);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
        showErrorNotice(notice, 'The selected date has already passed. Please choose a future date.');
        return;
    }

    const day = selectedDate.getDay();

    if (day === 0 || day === 6) {
        showErrorNotice(notice, 'We are closed on weekends. Please select a weekday, Monday to Friday.');
        return;
    }

    let responseNote = 'Your booking request has been received. We will contact you shortly to confirm. Thank you for reaching out to Teamo Consulting!';
    let noticeColor = '#0d9488';

    if (!timeValue) {
        responseNote = 'Your request has been received. Please select a valid working-hour time slot.';
        noticeColor = '#b45309';
    }

    notice.style.display = 'block';
    notice.style.color = noticeColor;
    notice.style.textContent = responseNote;

    const whatsappMessage = encodeURIComponent(
        `📌 *New Consultation Booking*

────────────────────
*Name:* ${name}
*Email:* ${email}
*Phone:* ${phone}
*Preferred Date:* ${dateValue}
*Time Slot:* ${timeValue}
*Service:* ${service}
────────────────────
*Message:*
${message}`
    );

    window.open(`https://wa.me/27738884764?text=${whatsappMessage}`, '_blank');
}

function resetBookingNotice(noticeElement) {
    noticeElement.style.display = 'none';
    noticeElement.style.color = '';
    noticeElement.style.background = '';
    noticeElement.style.padding = '';
    noticeElement.style.borderRadius = '';
    noticeElement.style.margin = '';
    noticeElement.textContent = '';
}

function showErrorNotice(noticeElement, message) {
    noticeElement.style.display = 'block';
    noticeElement.style.color = '#ef4444';
    noticeElement.style.background = 'rgba(239, 68, 68, 0.1)';
    noticeElement.style.padding = '12px';
    noticeElement.style.borderRadius = '8px';
    noticeElement.style.margin = '12px 0';
    noticeElement.textContent = message;
}

function showCustomAlert(message, type = 'success') {
    const existing = document.getElementById('custom-alert');

    if (existing) {
        existing.remove();
    }

    const alertDiv = document.createElement('div');

    alertDiv.id = 'custom-alert';
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.padding = '16px 32px';
    alertDiv.style.borderRadius = '12px';
    alertDiv.style.color = 'white';
    alertDiv.style.fontWeight = '500';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.boxShadow = '0 8px 30px rgba(0,0,0,0.25)';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.textAlign = 'center';
    alertDiv.style.opacity = '0';
    alertDiv.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
    alertDiv.style.background = type === 'success' ? '#10b981' : '#ef4444';

    alertDiv.textContent = message;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.style.opacity = '1';
        alertDiv.style.transform = 'translate(-50%, 0)';
    }, 100);

    setTimeout(() => {
        alertDiv.style.opacity = '0';
        alertDiv.style.transform = 'translate(-50%, -20px)';

        setTimeout(() => alertDiv.remove(), 400);
    }, 4000);
}

function escapeHTML(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

document.addEventListener('click', function (event) {
    const navLinks = document.getElementById('navLinks');
    const menuIcon = document.querySelector('.mobile-menu');

    if (!navLinks || !menuIcon) return;

    const clickedInsideMenu = navLinks.contains(event.target);
    const clickedMenuIcon = menuIcon.contains(event.target);

    if (!clickedInsideMenu && !clickedMenuIcon) {
        navLinks.classList.remove('active');
    }
});

window.addEventListener('scroll', function () {
    const navLinks = document.getElementById('navLinks');

    if (navLinks) {
        navLinks.classList.remove('active');
    }
});
function goToLogin() {
    window.location.href = "/login";
}