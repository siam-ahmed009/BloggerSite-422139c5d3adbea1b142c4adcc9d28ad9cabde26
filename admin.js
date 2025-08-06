document.addEventListener('DOMContentLoaded', () => {
  const page = window.location.pathname.split("/").pop();

  if (page === 'index.html' || page === '') {
    handleLoginPage();
  } else if (page === 'dashboard.html') {
    handleDashboardPage();
  } else if (page === 'edit-article.html') {
    handleEditArticlePage();
  }
});

// --- LOGIN PAGE ---
function handleLoginPage() {
  const loginForm = document.getElementById('login-form');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorP = document.getElementById('login-error');

    try {
      const res = await fetch('http://localhost:5000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) throw new Error('Login failed. Please check credentials.');

      const data = await res.json();
      localStorage.setItem('authToken', data.token);
      window.location.href = 'dashboard.html';
    } catch (error) {
      errorP.textContent = error.message;
      errorP.style.display = 'block';
    }
  });
}

// --- DASHBOARD PAGE ---
function handleDashboardPage() {
  const token = localStorage.getItem('authToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('authToken');
      window.location.href = 'index.html';
    });
  }

   showSection('hero');
  loadSiteContentForDashboard();  // Load existing content into forms
  setupSiteContentFormHandlers(); // <-- Call the working form logic
  loadArticlesForDashboard();
  fetchMessages();
}

// --- DROPDOWN + NAVIGATION ---
function toggleDropdown() {
  const dropdown = document.getElementById('site-content-dropdown');
  dropdown.style.display = dropdown.style.display === 'flex' ? 'none' : 'flex';
}

function showSection(id) {
  document.querySelectorAll('.admin-section').forEach(section => {
    section.style.display = 'none';
  });
  const sectionToShow = document.getElementById(id);
  if (sectionToShow) sectionToShow.style.display = 'block';
}

// --- HERO IMAGE PREVIEW ---
const heroImageInput = document.getElementById('heroImage');
if (heroImageInput) {
  heroImageInput.addEventListener('change', function (e) {
    const file = e.target.files[0];
    const preview = document.getElementById('hero-preview');
    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        preview.src = evt.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = 'none';
    }
  });
}

// --- SITE CONTENT LOAD ---
// Load site content on dashboard
async function loadSiteContentForDashboard() {
  try {
    const res = await fetch('http://localhost:5000/api/content');
    const content = await res.json();

    document.getElementById('heroTitle').value = content.heroTitle || '';
    document.getElementById('heroDescription').value = content.heroDescription || '';
    document.getElementById('aboutTitle').value = content.aboutTitle || '';
    document.getElementById('aboutDescription1').value = content.aboutDescription1 || '';
    document.getElementById('aboutDescription2').value = content.aboutDescription2 || '';
    document.getElementById('footerAboutImage').value = content.footerAboutImage || '';
    document.getElementById('footerAboutText').value = content.footerAboutText || '';
  } catch (error) {
    console.error('❌ Failed to load site content:', error);
  }
}

// Save logic for each individual section
function setupSiteContentFormHandlers() {
  const token = localStorage.getItem('authToken');

  // HERO FORM
  const heroForm = document.getElementById('hero-form');
  if (heroForm) {
    heroForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        heroTitle: document.getElementById('heroTitle').value,
        heroDescription: document.getElementById('heroDescription').value
      };

      try {
        const res = await fetch('http://localhost:5000/api/content', {
          method: 'PUT', // CHANGED from PATCH to PUT
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to update hero section');
        alert('✅ Hero section updated!');
      } catch (err) {
        alert('❌ Error updating Hero: ' + err.message);
      }
    });
  }

  // ABOUT FORM
  const aboutForm = document.getElementById('about-form');
  if (aboutForm) {
    aboutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        aboutTitle: document.getElementById('aboutTitle').value,
        aboutDescription1: document.getElementById('aboutDescription1').value,
        aboutDescription2: document.getElementById('aboutDescription2').value
      };

      try {
        const res = await fetch('http://localhost:5000/api/content', {
          method: 'PUT', // CHANGED from PATCH to PUT
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to update about section');
        alert('✅ About section updated!');
      } catch (err) {
        alert('❌ Error updating About: ' + err.message);
      }
    });
  }

  // FOOTER FORM
  const footerForm = document.getElementById('footer-form');
  if (footerForm) {
    footerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        footerAboutImage: document.getElementById('footerAboutImage').value,
        footerAboutText: document.getElementById('footerAboutText').value
      };

      try {
        const res = await fetch('http://localhost:5000/api/content', {
          method: 'PUT', // CHANGED from PATCH to PUT
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error('Failed to update footer section');
        alert('✅ Footer section updated!');
      } catch (err) {
        alert('❌ Error updating Footer: ' + err.message);
      }
    });
  }
}


// --- ARTICLES DASHBOARD ---
async function loadArticlesForDashboard() {
  const container = document.getElementById('dashboard-articles-container');
  try {
    const res = await fetch('http://localhost:5000/api/articles');
    const articles = await res.json();

    let html = `
      <table class="admin-table">
        <thead><tr><th>Title</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>`;

    articles.forEach(article => {
      html += `
        <tr>
          <td>${article.title}</td>
          <td>${new Date(article.date).toLocaleDateString()}</td>
          <td>${article.status}</td>
          <td>
            <a href="edit-article.html?id=${article._id}" class="btn-edit">Edit</a>
            <button onclick="deleteArticle('${article._id}')" class="btn-delete">Delete</button>
          </td>
        </tr>`;
    });

    html += '</tbody></table>';
    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p>Error loading articles.</p>';
  }
}

async function deleteArticle(id) {
  if (!confirm('Delete this article?')) return;

  const token = localStorage.getItem('authToken');
  try {
    const res = await fetch(`http://localhost:5000/api/articles/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error('Failed to delete article');
    loadArticlesForDashboard();
  } catch (err) {
    alert('Error deleting: ' + err.message);
  }
}

// --- FETCH + MODAL REPLY TO MESSAGES ---
async function fetchMessages() {
  const container = document.getElementById('messages-container');
  if (!container) return;

  try {
    const res = await fetch('http://localhost:5000/api/messages');
    const messages = await res.json();

    container.innerHTML = '';

    messages.reverse().forEach(msg => {
      const card = document.createElement('div');
      card.className = 'message-card';
      card.style = 'border: 1px solid #ccc; padding: 1rem; margin-bottom: 1rem;';
      card.innerHTML = `
        <p><strong>Name:</strong> ${msg.name}</p>
        <p><strong>Email:</strong> ${msg.email}</p>
        <p><strong>Subject:</strong> ${msg.subject}</p>
        <p><strong>Message:</strong> ${msg.message}</p>
        <p><strong>Status:</strong> ${msg.replied ? '✅ Replied' : '⏳ Not Replied'}</p>
        <button class="reply-button" data-id="${msg._id}" data-name="${msg.name}" data-email="${msg.email}" data-subject="${msg.subject}" data-message="${msg.message}">
          Reply
        </button>`;
      container.appendChild(card);
    });
  } catch (err) {
    console.error('Error loading messages:', err);
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('reply-button')) {
    const { id, name, email, subject, message } = e.target.dataset;

    document.getElementById('replyModal').style.display = 'flex';
    document.getElementById('modal-name').textContent = name;
    document.getElementById('modal-email').textContent = email;
    document.getElementById('modal-subject').textContent = subject;
    document.getElementById('modal-message').textContent = message;
    document.getElementById('modal-reply-text').value = '';
    document.getElementById('send-reply-modal-btn').dataset.messageId = id;
  }
});

document.getElementById('send-reply-modal-btn').addEventListener('click', async () => {
  const id = document.getElementById('send-reply-modal-btn').dataset.messageId;
  const reply = document.getElementById('modal-reply-text').value.trim();

  if (!reply) return alert('Reply cannot be empty.');

  try {
    const res = await fetch(`http://localhost:5000/api/messages/${id}/reply`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply })
    });

    if (!res.ok) throw new Error('Reply failed');
    alert('Reply sent!');
    closeModal();
    fetchMessages();
  } catch (err) {
    alert('Error: ' + err.message);
  }
});

function closeModal() {
  document.getElementById('replyModal').style.display = 'none';
}
