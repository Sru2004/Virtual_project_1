/**
 * Review & Rating System
 * Vanilla JS - localStorage only (no backend)
 * - Only verified buyers can submit reviews
 * - Buyers can edit/delete only their own review
 * - Artists cannot edit or delete reviews
 */

(function () {
  'use strict';

  // ----- Config -----
  const PRODUCT_ID = 'artwork-sunset-serenity-001';
  const ARTIST_ID = 'artist-ravi-sharma';
  const STORAGE_KEYS = {
    reviews: `reviews_${PRODUCT_ID}`,
    purchases: `purchases_${PRODUCT_ID}`,
    currentUser: 'review_demo_current_user',
  };

  // ----- State -----
  let state = {
    currentUserId: null,
    currentUserName: '',
    isArtist: false,
    hasPurchased: false,
    selectedRating: 0,
    hoveredRating: 0,
    editingReviewId: null,
  };

  // ----- DOM Refs -----
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ----- Storage Helpers -----
  function getReviews() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.reviews);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function setReviews(reviews) {
    localStorage.setItem(STORAGE_KEYS.reviews, JSON.stringify(reviews));
  }

  function getPurchases() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.purchases);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  function setPurchases(buyerIds) {
    localStorage.setItem(STORAGE_KEYS.purchases, JSON.stringify(buyerIds));
  }

  function getCurrentUser() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.currentUser);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  function setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
    }
  }

  // ----- State Sync -----
  function syncState() {
    const user = getCurrentUser();
    const purchases = getPurchases();

    state.currentUserId = user?.id ?? null;
    state.currentUserName = user?.name ?? '';
    state.isArtist = user?.role === 'artist';
    state.hasPurchased = user?.role === 'buyer' && purchases.includes(user?.id);
  }

  // ----- Rating Calculation -----
  function getAverageRating(reviews) {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / reviews.length) * 10) / 10; // 1 decimal
  }

  function renderStarsDisplay(container, rating, interactive = false) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let html = '';

    for (let i = 1; i <= 5; i++) {
      const filled = i <= full || (i === full + 1 && half);
      html += `<span class="star ${filled ? 'filled' : ''}" ${interactive ? `data-value="${i}"` : ''}>★</span>`;
    }
    container.innerHTML = html;
  }

  // ----- UI: Rating Summary -----
  function renderRatingSummary() {
    const reviews = getReviews();
    const avg = getAverageRating(reviews);
    const count = reviews.length;

    const starsEl = $('#starsDisplay');
    const avgEl = $('#avgRating');
    const countEl = $('#reviewCount');

    if (!starsEl) return;

    renderStarsDisplay(starsEl, avg);
    if (avgEl) avgEl.textContent = avg.toFixed(1);
    if (countEl) countEl.textContent = `(${count} review${count !== 1 ? 's' : ''})`;
  }

  // ----- UI: Review Form Visibility -----
  function updateFormVisibility() {
    const writeReview = $('#writeReview');
    const purchaseRequired = $('#purchaseRequired');
    const artistViewMsg = $('#artistViewMsg');

    syncState();

    if (state.isArtist) {
      if (writeReview) writeReview.hidden = true;
      if (purchaseRequired) purchaseRequired.hidden = true;
      if (artistViewMsg) artistViewMsg.hidden = false;
    } else if (state.hasPurchased) {
      if (writeReview) writeReview.hidden = false;
      if (purchaseRequired) purchaseRequired.hidden = true;
      if (artistViewMsg) artistViewMsg.hidden = true;
    } else {
      if (writeReview) writeReview.hidden = true;
      if (purchaseRequired) purchaseRequired.hidden = false;
      if (artistViewMsg) artistViewMsg.hidden = true;
    }
  }

  // ----- Star Input -----
  function initStarInput() {
    const container = $('#starInput');
    const form = $('#reviewForm');
    if (!container || !form) return;

    const stars = $$('.star-btn', container);

    function setSelected(value) {
      state.selectedRating = value;
      stars.forEach((btn, i) => {
        btn.classList.toggle('selected', i < value);
        btn.classList.toggle('hovered', false);
      });
    }

    stars.forEach((btn, i) => {
      const value = i + 1;
      btn.addEventListener('click', () => setSelected(value));
      btn.addEventListener('mouseenter', () => {
        state.hoveredRating = value;
        stars.forEach((b, j) => {
          b.classList.toggle('hovered', j < value);
        });
      });
      btn.addEventListener('mouseleave', () => {
        state.hoveredRating = 0;
        stars.forEach((b, j) => {
          b.classList.toggle('hovered', false);
          b.classList.toggle('selected', j < state.selectedRating);
        });
      });
    });

    form.addEventListener('reset', () => {
      state.selectedRating = 0;
      state.editingReviewId = null;
      stars.forEach((b) => {
        b.classList.remove('selected', 'hovered');
      });
    });
  }

  // ----- Submit Review -----
  function submitReview(e) {
    e.preventDefault();
    syncState();

    const commentEl = $('#reviewComment');
    const comment = commentEl?.value?.trim() || '';

    if (state.selectedRating < 1) {
      alert('Please select a star rating.');
      return;
    }
    if (comment.length < 5) {
      alert('Please write at least 5 characters in your review.');
      return;
    }
    if (!state.hasPurchased || state.isArtist) {
      alert('Only verified buyers can submit reviews.');
      return;
    }

    const reviews = getReviews();
    const existingIndex = state.editingReviewId
      ? reviews.findIndex((r) => r.id === state.editingReviewId)
      : -1;

    const review = {
      id: state.editingReviewId || 'rev_' + Date.now() + '_' + Math.random().toString(36).slice(2),
      buyerId: state.currentUserId,
      buyerName: state.currentUserName,
      rating: state.selectedRating,
      comment,
      date: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      reviews[existingIndex] = { ...reviews[existingIndex], ...review };
    } else {
      const hasExisting = reviews.some((r) => r.buyerId === state.currentUserId);
      if (hasExisting) {
        alert('You have already reviewed this artwork.');
        return;
      }
      reviews.push(review);
    }

    setReviews(reviews);
    $('#reviewForm')?.reset();
    state.selectedRating = 0;
    state.editingReviewId = null;

    updateFormVisibility();
    renderRatingSummary();
    renderReviewsList();
  }

  function editReview(reviewId) {
    syncState();
    const reviews = getReviews();
    const r = reviews.find((x) => x.id === reviewId);
    if (!r || r.buyerId !== state.currentUserId) return;

    state.editingReviewId = reviewId;
    state.selectedRating = r.rating;

    const stars = $$('.star-btn', $('#starInput'));
    stars.forEach((btn, i) => {
      btn.classList.toggle('selected', i < r.rating);
    });
    const commentEl = $('#reviewComment');
    if (commentEl) commentEl.value = r.comment;

    const cancelBtn = $('#cancelEdit');
    if (cancelBtn) cancelBtn.hidden = false;

    $('#writeReview')?.scrollIntoView({ behavior: 'smooth' });
  }

  function deleteReview(reviewId) {
    syncState();
    const reviews = getReviews();
    const r = reviews.find((x) => x.id === reviewId);
    if (!r || r.buyerId !== state.currentUserId) return;
    if (!confirm('Delete your review?')) return;

    setReviews(reviews.filter((x) => x.id !== reviewId));
    state.editingReviewId = null;
    $('#reviewForm')?.reset();

    renderRatingSummary();
    renderReviewsList();
    updateFormVisibility();
  }

  // ----- Reviews List -----
  function renderReviewsList() {
    const container = $('#reviewsList');
    if (!container) return;

    const reviews = getReviews();
    syncState();

    if (reviews.length === 0) {
      container.innerHTML = '<div class="empty-reviews">No reviews yet. Be the first to review!</div>';
      return;
    }

    const sorted = [...reviews].sort((a, b) => new Date(b.date) - new Date(a.date));

    container.innerHTML = sorted
      .map(
        (r) => {
          const canEdit = !state.isArtist && r.buyerId === state.currentUserId;
          const dateStr = new Date(r.date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          const starsHtml = [1, 2, 3, 4, 5]
            .map((i) => `<span class="star ${i <= r.rating ? 'filled' : ''}">★</span>`)
            .join('');

          return `
          <div class="review-card" data-id="${r.id}">
            <div class="review-header">
              <span class="buyer-name">${escapeHtml(r.buyerName)}</span>
              <span class="review-date">${dateStr}</span>
            </div>
            <div class="review-stars">${starsHtml}</div>
            <p class="review-comment">${escapeHtml(r.comment)}</p>
            ${canEdit ? `
            <div class="review-actions">
              <button type="button" class="btn-edit" data-id="${r.id}">Edit</button>
              <button type="button" class="btn-delete" data-id="${r.id}">Delete</button>
            </div>
            ` : ''}
          </div>
        `;
        }
      )
      .join('');

    container.querySelectorAll('.btn-edit').forEach((btn) => {
      btn.addEventListener('click', () => editReview(btn.dataset.id));
    });
    container.querySelectorAll('.btn-delete').forEach((btn) => {
      btn.addEventListener('click', () => deleteReview(btn.dataset.id));
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ----- User Toggle & Purchase -----
  function initUserToggle() {
    const toggles = $$('.btn-toggle');
    toggles.forEach((btn) => {
      btn.addEventListener('click', () => {
        toggles.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const role = btn.dataset.role;
        const name = $('#buyerName')?.value?.trim() || 'Buyer';
        const id = role === 'artist' ? ARTIST_ID : normalizeBuyerId(name);

        setCurrentUser({
          id,
          name: role === 'artist' ? 'Ravi Sharma' : name,
          role,
        });

        updateFormVisibility();
        renderReviewsList();
      });
    });
  }

  function initSimulatePurchase() {
    const btn = $('#simulatePurchase');
    const nameInput = $('#buyerName');

    if (!btn) return;

    btn.addEventListener('click', () => {
      const name = nameInput?.value?.trim();
      if (!name) {
        alert('Please enter your name first.');
        return;
      }

      const id = normalizeBuyerId(name);
      const purchases = getPurchases();
      if (!purchases.includes(id)) {
        purchases.push(id);
        setPurchases(purchases);
      }

      setCurrentUser({ id, name, role: 'buyer' });
      updateFormVisibility();
      renderReviewsList();
      alert('Purchase simulated! You can now leave a review.');
    });
  }

  function initForm() {
    const form = $('#reviewForm');
    const cancelBtn = $('#cancelEdit');

    if (form) {
      form.addEventListener('submit', submitReview);
    }
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        form?.reset();
        state.editingReviewId = null;
        state.selectedRating = 0;
        cancelBtn.hidden = true;
        $$('.star-btn', $('#starInput')).forEach((b) => b.classList.remove('selected', 'hovered'));
      });
    }
  }

  function initBuyerNameSync() {
    const input = $('#buyerName');
    if (!input) return;

    input.addEventListener('change', () => {
      const user = getCurrentUser();
      if (user?.role === 'buyer') {
        const name = input.value?.trim() || 'Buyer';
        const id = normalizeBuyerId(name);
        setCurrentUser({ ...user, id, name });
      }
    });
  }

  function normalizeBuyerId(name) {
    return 'user_' + (name || 'buyer').toLowerCase().replace(/\s+/g, '_');
  }

  // ----- Init -----
  function init() {
    const defaultId = normalizeBuyerId('Jane Doe');
    const purchases = getPurchases();
    if (!purchases.includes(defaultId)) {
      setPurchases([...purchases, defaultId]);
    }
    setCurrentUser({
      id: defaultId,
      name: 'Jane Doe',
      role: 'buyer',
    });
    syncState();

    initUserToggle();
    initSimulatePurchase();
    initStarInput();
    initForm();
    initBuyerNameSync();

    updateFormVisibility();
    renderRatingSummary();
    renderReviewsList();
  }

  init();
})();
