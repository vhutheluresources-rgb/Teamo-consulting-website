document.addEventListener('DOMContentLoaded', loadPendingTestimonials);

async function loadPendingTestimonials() {
    const container = document.getElementById('pendingTestimonials');

    if (!container) return;

    try {
        const response = await fetch('/api/testimonials/pending', {
            method: 'GET',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to load pending testimonials');
        }

        const testimonials = await response.json();

        if (testimonials.length === 0) {
            container.innerHTML = '<p class="empty-message">No pending testimonials.</p>';
            return;
        }

        container.innerHTML = testimonials.map(testimonial => `
          <div class="testimonial-card">
                <div class="stars">
                    ${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}
                </div>

               <p class="testimonial-message">
    "${escapeHTML(testimonial.message)}"
</p>

              <div class="client-info">
    <h3>${escapeHTML(testimonial.name)}</h3>

    <p>
        ${escapeHTML(testimonial.title)}
        <br>
        ${escapeHTML(testimonial.company)}
    </p>
</div>

              <div class="button-group">

    <button
        class="approve-btn"
        onclick="approveTestimonial(${testimonial.id})">
        Approve
    </button>

    <button
        class="reject-btn"
        onclick="rejectTestimonial(${testimonial.id})">
        Reject
    </button>

</div>
            </div>
        `).join('');

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="empty-message">Could not load pending testimonials.</p>';
    }
}

async function approveTestimonial(id) {
    try {
        const response = await fetch(`/api/testimonials/${id}/approve`, {
            method: 'PUT',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to approve testimonial');
        }

        loadPendingTestimonials();

    } catch (error) {
        console.error(error);
        alert('Could not approve testimonial. Please try again.');
    }
}

async function rejectTestimonial(id) {
    try {
        const response = await fetch(`/api/testimonials/${id}/reject`, {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to reject testimonial');
        }

        loadPendingTestimonials();

    } catch (error) {
        console.error(error);
        alert('Could not reject testimonial. Please try again.');
    }
}

function escapeHTML(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}