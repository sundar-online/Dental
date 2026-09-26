
// ==========================================================================
// Quick Chat WhatsApp-Style Floating Widget
// ==========================================================================
const quickHelp = document.getElementById('quickHelp');
const quickHelpBtn = document.getElementById('quickHelpBtn');
const quickHelpPanel = document.getElementById('quickHelpPanel');
const quickCloseBtn = document.getElementById('quickCloseBtn');
const quickChatBody = document.getElementById('quickChatBody');
const chatMessagesStream = document.getElementById('chatMessagesStream');
const quickChatForm = document.getElementById('quickChatForm');
const quickChatInput = document.getElementById('quickChatInput');
const chatInitTime = document.getElementById('chatInitTime');
const clinicWhatsAppNumber = '918870677523';

function getFormattedTime() {
  try {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (_) {
    return '';
  }
}

if (chatInitTime) {
  chatInitTime.textContent = getFormattedTime();
}

function scrollChatToBottom() {
  if (quickChatBody) {
    requestAnimationFrame(() => {
      quickChatBody.scrollTop = quickChatBody.scrollHeight;
    });
  }
}

function openQuickHelp() {
  if (!quickHelpPanel) return;
  quickHelpPanel.classList.add('open');
  quickHelpPanel.setAttribute('aria-hidden', 'false');
  if (quickHelpBtn) {
    quickHelpBtn.classList.add('is-active');
    quickHelpBtn.setAttribute('aria-expanded', 'true');
  }
  scrollChatToBottom();
  // Auto-focus input on desktop only (avoids opening virtual keyboard on mobile)
  if (!/Android|iPhone|iPad|iPod/i.test(navigator.userAgent) && quickChatInput) {
    setTimeout(() => {
      try { quickChatInput.focus(); } catch (_) {}
    }, 280);
  }
}

function closeQuickHelp() {
  if (!quickHelpPanel) return;
  quickHelpPanel.classList.remove('open');
  quickHelpPanel.setAttribute('aria-hidden', 'true');
  if (quickHelpBtn) {
    quickHelpBtn.classList.remove('is-active');
    quickHelpBtn.setAttribute('aria-expanded', 'false');
  }
}

function toggleQuickHelp() {
  if (!quickHelpPanel) return;
  if (quickHelpPanel.classList.contains('open')) {
    closeQuickHelp();
  } else {
    openQuickHelp();
  }
}

// Add chat bubble helper
function appendChatBubble(text, sender = 'bot', isHtml = false) {
  if (!chatMessagesStream) return;
  const row = document.createElement('div');
  row.className = `chat-msg-row chat-msg-${sender}`;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble chat-bubble-${sender}`;

  if (isHtml) {
    bubble.innerHTML = text;
  } else {
    const p = document.createElement('p');
    p.style.margin = '0';
    p.textContent = text;
    bubble.appendChild(p);
  }

  const timeSpan = document.createElement('span');
  timeSpan.className = 'chat-msg-time';
  timeSpan.textContent = getFormattedTime();
  bubble.appendChild(timeSpan);

  row.appendChild(bubble);
  chatMessagesStream.appendChild(row);
  scrollChatToBottom();
}

// Safe RFC 3986 URL encoder for full Unicode (Tamil, Hindi, emojis, symbols)
const safeUrlEncode = (str) =>
  encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

// Handle Quick Action Clicks
document.querySelectorAll('[data-chat-action]').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const action = btn.getAttribute('data-chat-action');

    if (action === 'ask') {
      appendChatBubble('Ask a Question', 'user');
      setTimeout(() => {
        appendChatBubble(
          'What would you like to ask? Type your question in the message box below and tap Send to chat with our doctors on WhatsApp!',
          'bot'
        );
        if (quickChatInput) {
          quickChatInput.focus();
          quickChatInput.placeholder = 'e.g. Consultation fee, root canal, braces...';
        }
      }, 250);
    } else if (action === 'location') {
      appendChatBubble('Get Clinic Location', 'user');
      setTimeout(() => {
        const locationHtml = `
          <div class="chat-info-card">
            <div class="chat-info-title">📍 Clinic Location</div>
            <p class="chat-info-desc">
              <strong>Balagam Dental and Medical Clinic</strong><br>
              Porur, Chennai, Tamil Nadu<br>
              <span class="chat-info-sub">Near Sri Ramachandra University</span>
            </p>
            <a href="https://maps.app.goo.gl/dByS6ndvDBBxftf2A" target="_blank" rel="noopener noreferrer" class="chat-map-action-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
              </svg>
              <span>Open in Google Maps ↗</span>
            </a>
          </div>
        `;
        appendChatBubble(locationHtml, 'bot', true);
      }, 250);
    } else if (action === 'timings') {
      appendChatBubble('Clinic Timings', 'user');
      setTimeout(() => {
        const timingsHtml = `
          <div class="chat-info-card">
            <div class="chat-info-title">🕒 Consultation Hours</div>
            <p class="chat-info-desc">
              <strong>Mon – Sat:</strong> 10:00 AM – 1:30 PM &bull; 4:00 PM – 9:00 PM<br>
              <strong>Sunday:</strong> 4:00 PM – 9:00 PM
            </p>
            <div class="chat-timing-badge">Daily &amp; Emergency Slots Available</div>
          </div>
        `;
        appendChatBubble(timingsHtml, 'bot', true);
      }, 250);
    } else if (action === 'book') {
      appendChatBubble('Book an Appointment', 'user');
      setTimeout(() => {
        closeQuickHelp();
        openAppointmentModal();
      }, 350);
    } else if (action === 'whatsapp') {
      appendChatBubble('Talk on WhatsApp', 'user');
      setTimeout(() => {
        const waUrl = `https://wa.me/${clinicWhatsAppNumber}`;
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          window.location.href = waUrl;
        } else {
          window.open(waUrl, '_blank') || (window.location.href = waUrl);
        }
      }, 350);
    }
  });
});

// User custom message submit
if (quickChatForm) {
  quickChatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = String(quickChatInput?.value || '').trim();
    if (!query) return;

    // Show user question bubble
    appendChatBubble(query, 'user');
    if (quickChatInput) quickChatInput.value = '';

    // Show bot transition response
    setTimeout(() => {
      appendChatBubble(
        'Connecting you to Balagam Dental Clinic on WhatsApp with your question...',
        'bot'
      );

      const waUrl = `https://wa.me/${clinicWhatsAppNumber}?text=${safeUrlEncode(query)}`;

      setTimeout(() => {
        if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
          window.location.href = waUrl;
        } else {
          window.open(waUrl, '_blank') || (window.location.href = waUrl);
        }
      }, 400);
    }, 300);
  });
}

// Trigger button toggles panel
if (quickHelpBtn) {
  quickHelpBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleQuickHelp();
  });
}

// Close button
if (quickCloseBtn) {
  quickCloseBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    closeQuickHelp();
  });
}

// Close on outside click
document.addEventListener('click', (e) => {
  if (
    quickHelp &&
    quickHelpPanel &&
    quickHelpPanel.classList.contains('open') &&
    !quickHelp.contains(e.target) &&
    !e.target.closest('#quickHelp')
  ) {
    closeQuickHelp();
  }
});

// Close on Escape key
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && quickHelpPanel?.classList.contains('open')) {
    closeQuickHelp();
  }
});

// ==========================================================================
// Appointment Booking Modal & Form Handling (Universal Cross-Browser)
// ==========================================================================
const appointmentModal = document.getElementById('appointmentModal');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const appointmentForm = document.getElementById('appointmentForm');
const formSuccessMsg = document.getElementById('formSuccessMsg');
const appSubmitBtn = document.getElementById('appSubmitBtn');

function openAppointmentModal() {
  const modal = document.getElementById('appointmentModal');
  if (!modal) return;

  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  document.documentElement.classList.add('modal-open');
  document.body.style.overflow = 'hidden';

  // Ensure minimum selectable date is today
  const dateInput = document.getElementById('appDate');
  if (dateInput && !dateInput.min) {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      dateInput.min = todayStr;
    } catch (_) {}
  }

  // Safe focus to first field for keyboard & screen reader accessibility
  const firstInput = document.getElementById('appFullName');
  if (firstInput) {
    setTimeout(() => {
      try {
        firstInput.focus();
      } catch (_) {}
    }, 150);
  }
}

function closeAppointmentModal() {
  const modal = document.getElementById('appointmentModal');
  if (!modal) return;

  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  document.documentElement.classList.remove('modal-open');
  document.body.style.overflow = '';
}

// 1. Direct event attachment to all booking triggers
const bookingSelectors = [
  '#bannerBookBtn',
  '#pillBookBtn',
  '.book-btn',
  '#navBookBtn',
  '#footerBookBtn',
  'a[href="#contact"].footer-highlight-link',
  '[data-trigger="booking"]'
];

bookingSelectors.forEach((selector) => {
  document.querySelectorAll(selector).forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openAppointmentModal();
    });
  });
});

// 2. Document-level delegation for 100% reliability across dynamic changes, touch devices, and nested spans
document.addEventListener('click', (e) => {
  // Close button trigger
  if (e.target.closest('#modalCloseBtn') || e.target.closest('.modal-close-btn')) {
    e.preventDefault();
    e.stopPropagation();
    closeAppointmentModal();
    return;
  }

  // Backdrop trigger
  if (e.target.id === 'modalBackdrop' || e.target.classList.contains('modal-backdrop')) {
    e.preventDefault();
    e.stopPropagation();
    closeAppointmentModal();
    return;
  }

  // Any booking trigger
  const trigger = e.target.closest('#bannerBookBtn, #pillBookBtn, .book-btn, #navBookBtn, #footerBookBtn, a[href="#contact"].footer-highlight-link, [data-option="book"], [data-trigger="booking"], a[href="#appointment"], a[href="#book"]');
  if (trigger) {
    e.preventDefault();
    e.stopPropagation();
    openAppointmentModal();
  }
});

// Direct close bindings
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeAppointmentModal();
  });
}

if (modalBackdrop) {
  modalBackdrop.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeAppointmentModal();
  });
}

// Escape key to close
window.addEventListener('keydown', (e) => {
  if ((e.key === 'Escape' || e.key === 'Esc') && appointmentModal?.classList.contains('open')) {
    closeAppointmentModal();
  }
});

// Form submission & WhatsApp automation
if (appointmentForm) {
  // Reset submit state if user edits the form
  appointmentForm.addEventListener('input', () => {
    if (appSubmitBtn && appSubmitBtn.disabled) {
      appSubmitBtn.disabled = false;
      appSubmitBtn.style.opacity = '';
      appSubmitBtn.innerHTML = '<span>REQUEST APPOINTMENT</span><span class="btn-arrow">&rarr;</span>';
      if (formSuccessMsg) formSuccessMsg.style.display = 'none';
    }
  });

  const waOpenAppBtn = document.getElementById('waOpenAppBtn');
  const waContinueWebBtn = document.getElementById('waContinueWebBtn');

  // Handle direct click on Open App button
  if (waOpenAppBtn) {
    waOpenAppBtn.addEventListener('click', (e) => {
      const href = waOpenAppBtn.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
        if (appointmentForm.reportValidity && !appointmentForm.reportValidity()) return;
        appointmentForm.requestSubmit ? appointmentForm.requestSubmit() : appointmentForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
  }

  // Handle direct click on Continue to WhatsApp Web button
  if (waContinueWebBtn) {
    waContinueWebBtn.addEventListener('click', (e) => {
      const href = waContinueWebBtn.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
        if (appointmentForm.reportValidity && !appointmentForm.reportValidity()) return;
        appointmentForm.requestSubmit ? appointmentForm.requestSubmit() : appointmentForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    });
  }

  appointmentForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const fullName = String(document.getElementById('appFullName')?.value || '').trim();
    const phone = String(document.getElementById('appPhone')?.value || '').trim();
    const treatment = String(document.getElementById('appTreatment')?.value || 'General Consultation & X-ray').trim();
    const rawDate = String(document.getElementById('appDate')?.value || '').trim();
    const note = String(document.getElementById('appMessage')?.value || '').trim() || 'None';

    if (!fullName || !phone) return;

    // Format readable preferred date safely
    let formattedDate = 'Flexible / Earliest Available';
    if (rawDate) {
      try {
        const parts = rawDate.split('-');
        if (parts.length === 3) {
          const y = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const d = parseInt(parts[2], 10);
          const dateObj = new Date(y, m, d);
          if (!isNaN(dateObj.getTime())) {
            formattedDate = dateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            });
          } else {
            formattedDate = rawDate;
          }
        } else {
          formattedDate = rawDate;
        }
      } catch (_) {
        formattedDate = rawDate;
      }
    }

    // Construct structured pre-filled booking message
    const messageLines = [
      '*New Appointment Request - Balagam Dental Clinic*',
      '',
      '*Patient Name:* ' + fullName,
      '*Phone Number:* ' + phone,
      '*Treatment:* ' + treatment,
      '*Preferred Date:* ' + formattedDate,
      '*Additional Note:* ' + note,
      '',
      'Please confirm my appointment slot. Thank you!'
    ];
    const messageText = messageLines.join('\n');

    // Safe RFC 3986 URL encoder for full Unicode (Tamil, Hindi, emojis, symbols)
    const safeUrlEncode = (str) =>
      encodeURIComponent(str).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());

    const clinicWhatsAppNumber = '918870677523';
    const encodedMessage = safeUrlEncode(messageText);

    // Both buttons share the exact same dynamically generated booking message:
    // 1. WhatsApp app link (triggers mobile/desktop app)
    const appUrl = `https://wa.me/${clinicWhatsAppNumber}?text=${encodedMessage}`;
    // 2. Direct WhatsApp Web chat link (bypasses broken intermediate redirects and prevents landing on homepage)
    const webUrl = `https://web.whatsapp.com/send?phone=${clinicWhatsAppNumber}&text=${encodedMessage}`;

    // Update both action buttons with the dynamically generated message
    if (waOpenAppBtn) {
      waOpenAppBtn.href = appUrl;
    }
    if (waContinueWebBtn) {
      waContinueWebBtn.href = webUrl;
    }

    // Cross-platform direct dispatch:
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = appUrl;
    } else {
      // Desktop: directly open WhatsApp Web chat without broken intermediate redirect
      const win = window.open(webUrl, '_blank');
      if (!win) {
        window.location.href = webUrl;
      }
    }

    // Update UI state
    if (appSubmitBtn) {
      appSubmitBtn.disabled = true;
      appSubmitBtn.style.opacity = '0.9';
      appSubmitBtn.innerHTML = '<span>Appointment Request Ready \u2713</span>';
    }

    if (formSuccessMsg) {
      formSuccessMsg.style.display = 'flex';
      formSuccessMsg.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });
}

// ==========================================================================
// Navigation Active State Tracking & Smooth Spy
// ==========================================================================
(function initNavScrollSpy() {
  const navLinks = document.querySelectorAll('.nav-links .nav-link, .mobile-nav-links .mobile-nav-link');
  if (!navLinks.length) return;

  const sectionIds = ['home', 'treatments', 'team', 'aftercare', 'reviews', 'contact'];
  let isManualClick = false;
  let clickTimeout = null;

  function setActiveLink(activeId) {
    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      link.classList.toggle('active', href === `#${activeId}`);
    });
  }

  function getSectionTop(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return rect.top + window.pageYOffset;
  }

  function updateActiveNav() {
    if (isManualClick) return;

    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // If scrolled to near the bottom of the page, activate Contact
    if (scrollY + windowHeight >= docHeight - 80) {
      setActiveLink('contact');
      return;
    }

    // Viewport threshold line (approx 160px from top, below sticky header)
    const triggerLine = scrollY + 160;

    const treatmentsTop = getSectionTop('treatments') || Infinity;
    const teamTop = getSectionTop('team') || Infinity;
    const aftercareTop = getSectionTop('aftercare') || Infinity;
    const reviewsTop = getSectionTop('reviews') || Infinity;
    const contactTop = getSectionTop('contact') || Infinity;

    if (triggerLine >= contactTop) {
      setActiveLink('contact');
    } else if (triggerLine >= reviewsTop) {
      setActiveLink('reviews');
    } else if (triggerLine >= aftercareTop) {
      setActiveLink('aftercare');
    } else if (triggerLine >= teamTop) {
      setActiveLink('team');
    } else if (triggerLine >= treatmentsTop) {
      setActiveLink('treatments');
    } else {
      setActiveLink('home');
    }
  }

  // Instant active state feedback on nav link click
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        if (sectionIds.includes(targetId)) {
          setActiveLink(targetId);
          isManualClick = true;
          if (clickTimeout) clearTimeout(clickTimeout);
          clickTimeout = setTimeout(() => {
            isManualClick = false;
            updateActiveNav();
          }, 850);
        }
      }
    });
  });

  // Listen to scroll and resize
  window.addEventListener('scroll', updateActiveNav, { passive: true });
  window.addEventListener('resize', updateActiveNav, { passive: true });

  // Initial check on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateActiveNav);
  } else {
    updateActiveNav();
  }
})();

// ==========================================================================
// Mobile Hamburger Menu & Animated Drawer
// ==========================================================================
(function initMobileHamburgerMenu() {
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const mobileDrawer = document.getElementById('mobileMenuDrawer');
  const mobileBackdrop = document.getElementById('mobileMenuBackdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-menu-cta, .mobile-action-pill');

  if (!hamburgerBtn || !mobileDrawer || !mobileBackdrop) return;

  let isOpen = false;

  function openMenu() {
    isOpen = true;
    hamburgerBtn.classList.add('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    mobileDrawer.classList.add('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    mobileBackdrop.classList.add('is-open');
    mobileBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    if (!isOpen) return;
    isOpen = false;
    hamburgerBtn.classList.remove('is-active');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    mobileBackdrop.classList.remove('is-open');
    mobileBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function toggleMenu() {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  hamburgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  mobileBackdrop.addEventListener('click', closeMenu);

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      setTimeout(closeMenu, 150);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      closeMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 991 && isOpen) {
      closeMenu();
    }
  }, { passive: true });
})();


// ==========================================================================
// Cinematic Reviews Carousel
// ==========================================================================
(function () {
  const track = document.getElementById('reviewsCarouselTrack');
  const prevBtn = document.getElementById('carouselPrev');
  const nextBtn = document.getElementById('carouselNext');
  const originalCards = Array.from(document.querySelectorAll('#reviewsCarouselTrack .review-card'));
  const treatCards = document.querySelectorAll('.treatment-card');

  if (!track || !prevBtn || !nextBtn || !originalCards.length) return;

  const N = originalCards.length; // 6 review cards

  // Clone cards before and after for seamless, continuous infinite looping
  const cloneBefore = originalCards.map((card, i) => {
    const clone = card.cloneNode(true);
    clone.classList.add('carousel-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('data-original-index', i);
    return clone;
  });

  const cloneAfter = originalCards.map((card, i) => {
    const clone = card.cloneNode(true);
    clone.classList.add('carousel-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.setAttribute('data-original-index', i);
    return clone;
  });

  // Mark original cards with their indices
  originalCards.forEach((card, i) => {
    card.setAttribute('data-original-index', i);
  });

  // Insert clones into track
  cloneBefore.forEach(clone => track.insertBefore(clone, originalCards[0]));
  cloneAfter.forEach(clone => track.appendChild(clone));

  const allTrackCards = Array.from(track.querySelectorAll('.review-card'));
  let currentTrackIndex = N; // Start on original card 0 (index N in cloned track)
  let isDragging = false;
  let dragStartX = 0;
  let dragDeltaX = 0;



  // Compute card width + gap (reads live from DOM)
  function getCardStep() {
    if (!allTrackCards.length) return 0;
    const card = allTrackCards[0];
    const style = window.getComputedStyle(track);
    const gap = parseFloat(style.gap) || 24;
    return card.offsetWidth + gap;
  }

  // Apply position & visual states
  function applyCarousel(animate = true) {
    if (!allTrackCards.length) return;

    const step = getCardStep();
    const carouselEl = document.getElementById('reviewsCarouselWrap') || track.parentElement;
    const wrapWidth = carouselEl.offsetWidth;
    const centerCard = allTrackCards[currentTrackIndex];
    if (!centerCard) return;

    const cardCenter = currentTrackIndex * step + centerCard.offsetWidth / 2;
    const offset = wrapWidth / 2 - cardCenter;

    if (!animate) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
    }

    track.style.setProperty('--carousel-offset', `${offset}px`);

    // Highlight center active card and side adjacent cards
    allTrackCards.forEach((card, i) => {
      card.classList.remove('carousel-active', 'carousel-adjacent');
      if (i === currentTrackIndex) {
        card.classList.add('carousel-active');
      } else if (Math.abs(i - currentTrackIndex) === 1) {
        card.classList.add('carousel-adjacent');
      }
    });
  }

  // Step to a track index with boundary jump handling
  function stepTo(nextIndex) {
    if (currentTrackIndex >= 2 * N) {
      currentTrackIndex -= N;
      applyCarousel(false);
      track.offsetHeight;
    } else if (currentTrackIndex < N) {
      currentTrackIndex += N;
      applyCarousel(false);
      track.offsetHeight;
    }

    requestAnimationFrame(() => {
      currentTrackIndex = nextIndex;
      applyCarousel(true);
    });
  }

  track.addEventListener('transitionend', (e) => {
    if (e.target !== track) return;
    if (currentTrackIndex >= 2 * N) {
      currentTrackIndex -= N;
      applyCarousel(false);
    } else if (currentTrackIndex < N) {
      currentTrackIndex += N;
      applyCarousel(false);
    }
  });

  // Navigate by real index (0 to N - 1) taking shortest smooth path
  function goToRealIndex(targetRealIdx) {
    const currentRealIdx = ((currentTrackIndex - N) % N + N) % N;
    let diff = targetRealIdx - currentRealIdx;
    if (diff > N / 2) diff -= N;
    if (diff < -N / 2) diff += N;
    stepTo(currentTrackIndex + diff);
  }

  let userStoppedAuto = false;

  function stopAutoByUser() {
    userStoppedAuto = true;
    stopAuto();
  }

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    stopAutoByUser();
    stepTo(currentTrackIndex - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    stopAutoByUser();
    stepTo(currentTrackIndex + 1);
  });

  // Keyboard support
  document.addEventListener('keydown', e => {
    const wrap = document.getElementById('reviewsCarouselWrap');
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const inView = rect.top < window.innerHeight && rect.bottom > 0;
    if (!inView) return;
    if (e.key === 'ArrowLeft') {
      stopAutoByUser();
      stepTo(currentTrackIndex - 1);
    }
    if (e.key === 'ArrowRight') {
      stopAutoByUser();
      stepTo(currentTrackIndex + 1);
    }
  });

  // Touch / pointer swipe support
  track.addEventListener('pointerdown', e => {
    isDragging = true;
    dragStartX = e.clientX;
    dragDeltaX = 0;
    stopAuto();
    track.setPointerCapture(e.pointerId);
  });

  track.addEventListener('pointermove', e => {
    if (!isDragging) return;
    dragDeltaX = e.clientX - dragStartX;
  });

  track.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    const threshold = 50;
    stopAutoByUser();
    if (dragDeltaX < -threshold) {
      stepTo(currentTrackIndex + 1);
    } else if (dragDeltaX > threshold) {
      stepTo(currentTrackIndex - 1);
    } else {
      applyCarousel(true);
    }
  });

  allTrackCards.forEach((card, idx) => {
    card.addEventListener('click', () => {
      stopAutoByUser();
      if (idx !== currentTrackIndex) {
        stepTo(idx);
      }
    });
  });

  treatCards.forEach(tCard => {
    const handleClick = () => {
      stopAutoByUser();
      const type = tCard.getAttribute('data-treatment');
      const sec = document.getElementById('reviews');
      if (sec) {
        sec.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          const targetIdx = originalCards.findIndex(c => c.getAttribute('data-category') === type);
          if (targetIdx !== -1) {
            goToRealIndex(targetIdx);
          }
        }, 420);
      }
    };
    tCard.addEventListener('click', handleClick);
    tCard.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick();
      }
    });
  });

  const AUTO_INTERVAL = 3800;
  let autoTimer = null;

  function startAuto() {
    if (userStoppedAuto) return;
    stopAuto();
    autoTimer = setInterval(() => {
      stepTo(currentTrackIndex + 1);
    }, AUTO_INTERVAL);
  }

  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  const carouselWrap = document.getElementById('reviewsCarouselWrap');
  if (carouselWrap) {
    carouselWrap.addEventListener('mouseenter', stopAuto);
    carouselWrap.addEventListener('mouseleave', () => {
      if (!userStoppedAuto) startAuto();
    });
    carouselWrap.addEventListener('touchstart', stopAuto, { passive: true });
    carouselWrap.addEventListener('touchend', () => {
      if (!userStoppedAuto) startAuto();
    }, { passive: true });
    carouselWrap.addEventListener('click', stopAutoByUser);
  }

  const reviewsSection = document.getElementById('reviews');
  if (reviewsSection) {
    reviewsSection.addEventListener('click', stopAutoByUser);
  }

  window.addEventListener('resize', () => {
    requestAnimationFrame(() => applyCarousel(false));
  }, { passive: true });

  applyCarousel(false);
  requestAnimationFrame(() => {
    applyCarousel(false);
    if (!userStoppedAuto) {
      startAuto();
    }
  });

  // Pause when review section is off-screen, resume when on-screen if not stopped by user
  if ('IntersectionObserver' in window && reviewsSection) {
    const reviewsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!userStoppedAuto) startAuto();
        } else {
          stopAuto();
        }
      });
    }, { threshold: 0.15 });
    reviewsObserver.observe(reviewsSection);
  }
})();

// ==========================================================================
// Global Interactive Animation & Traction Engine
// ==========================================================================
(function initAnimationsAndTraction() {
  const siteHeader = document.querySelector('header.site-header') || document.querySelector('.site-header');
  function handleNavbarScroll() {
    if (!siteHeader) return;
    if (window.scrollY > 40) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  const counterElements = document.querySelectorAll('.dr-stat-val');

  function parseCounterTarget(text) {
    const cleanText = text.trim();
    const match = cleanText.match(/^([^\d]*)([\d,]+(?:\.\d+)?)([^\d]*)$/);
    if (!match) return null;
    const prefix = match[1] || '';
    const numStr = match[2].replace(/,/g, '');
    const target = parseFloat(numStr);
    if (isNaN(target)) return null;
    const suffix = match[3] || '';
    const isComma = match[2].includes(',');
    return { prefix, target, suffix, isComma };
  }

  const animatedCounters = new Set();

  function animateCounter(el) {
    if (animatedCounters.has(el)) return;
    const data = parseCounterTarget(el.textContent);
    if (!data) return;

    animatedCounters.add(el);
    const { prefix, target, suffix, isComma } = data;
    const duration = 1800;
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const currentVal = Math.floor(ease * target);
      const formatted = isComma ? currentVal.toLocaleString('en-US') : currentVal;
      el.textContent = `${prefix}${formatted}${suffix}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        const finalFormatted = isComma ? target.toLocaleString('en-US') : target;
        el.textContent = `${prefix}${finalFormatted}${suffix}`;
      }
    }
    requestAnimationFrame(update);
  }

  const revealTargets = [
    { selector: '.section-tag', class: 'reveal-up' },
    { selector: '.treatments-header', class: 'reveal-up' },
    { selector: '.team-header', class: 'reveal-up' },
    { selector: '.reviews-intro-wrap', class: 'reveal-up' },
    { selector: '.contact-banner-card', class: 'reveal-up' },
    { selector: '.highlights-container', class: 'reveal-up' }
  ];

  revealTargets.forEach(target => {
    document.querySelectorAll(target.selector).forEach(el => {
      el.classList.add(target.class);
    });
  });

  document.querySelectorAll('.treatments-grid .treatment-card').forEach((card, i) => {
    card.classList.add('reveal-up');
    card.style.transitionDelay = `${(i % 4) * 85}ms`;
  });

  document.querySelectorAll('.team-grid .team-card').forEach((card, i) => {
    card.classList.add('reveal-up');
    card.style.transitionDelay = `${i * 120}ms`;
  });

  document.querySelectorAll('.dr-stats-row .dr-stat-card').forEach((card, i) => {
    card.classList.add('reveal-up');
    card.style.transitionDelay = `${i * 90}ms`;
  });

  document.querySelectorAll('.contact-info-pills .contact-pill-card').forEach((pill, i) => {
    pill.classList.add('reveal-up');
    pill.style.transitionDelay = `${i * 85}ms`;
  });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');

          if (entry.target.classList.contains('dr-stat-card')) {
            const valEl = entry.target.querySelector('.dr-stat-val');
            if (valEl) animateCounter(valEl);
          } else {
            entry.target.querySelectorAll('.dr-stat-val').forEach(animateCounter);
          }

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right, .reveal-scale, .dr-slide-left, .dr-slide-right, .team-slide-left, .team-slide-right').forEach(el => {
      revealObserver.observe(el);
    });

    counterElements.forEach(el => {
      const parentCard = el.closest('.dr-stat-card');
      if (parentCard) {
        revealObserver.observe(parentCard);
      } else {
        revealObserver.observe(el);
      }
    });
  } else {
    document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right, .reveal-scale, .dr-slide-left, .dr-slide-right, .team-slide-left, .team-slide-right').forEach(el => {
      el.classList.add('is-revealed');
    });
    counterElements.forEach(animateCounter);
  }
})();

// ==========================================================================
// Contact Section - Clinic Image 5-Second Auto-Switcher
// ==========================================================================
(function initClinicImageSwitcher() {
  const visual = document.getElementById('contactBannerVisual');
  if (!visual) return;

  const images = visual.querySelectorAll('.contact-banner-img');
  const dots = visual.querySelectorAll('.clinic-dot');
  if (images.length < 2) return;

  let currentIndex = 0;
  const intervalTime = 5000;
  let switchTimer = null;

  function showImage(index) {
    images.forEach((img, i) => {
      img.classList.toggle('active', i === index);
    });
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
    currentIndex = index;
  }

  function nextImage() {
    const nextIndex = (currentIndex + 1) % images.length;
    showImage(nextIndex);
  }

  function startTimer() {
    stopTimer();
    switchTimer = setInterval(nextImage, intervalTime);
  }

  function stopTimer() {
    if (switchTimer) {
      clearInterval(switchTimer);
      switchTimer = null;
    }
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetIdx = parseInt(dot.getAttribute('data-index'), 10);
      if (!isNaN(targetIdx) && targetIdx !== currentIndex) {
        showImage(targetIdx);
        startTimer();
      }
    });
  });

  visual.addEventListener('mouseenter', stopTimer);
  visual.addEventListener('mouseleave', startTimer);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopTimer();
    } else {
      startTimer();
    }
  });

  startTimer();
})();

// ==========================================================================
// Hero Video Autoplay, Speed & Smooth Playback Management
// ==========================================================================
(function initHeroBackgroundVideo() {
  const heroVideo = document.querySelector('.hero-video, .hero-video-bg');
  if (!heroVideo) return;

  heroVideo.muted = true;
  heroVideo.defaultMuted = true;

  const TARGET_SPEED = .5;

  function applyPlaybackSpeed() {
    if (heroVideo.playbackRate !== TARGET_SPEED) {
      heroVideo.playbackRate = TARGET_SPEED;
      heroVideo.defaultPlaybackRate = TARGET_SPEED;
    }
  }

  applyPlaybackSpeed();
  heroVideo.addEventListener('loadedmetadata', applyPlaybackSpeed);
  heroVideo.addEventListener('play', applyPlaybackSpeed);
  heroVideo.addEventListener('playing', applyPlaybackSpeed);
  heroVideo.addEventListener('ratechange', () => {
    if (heroVideo.playbackRate !== TARGET_SPEED) {
      heroVideo.playbackRate = TARGET_SPEED;
    }
  });

  function markLoaded() {
    heroVideo.classList.add('is-loaded');
    applyPlaybackSpeed();
  }

  if (heroVideo.readyState >= 2) {
    markLoaded();
  } else {
    heroVideo.addEventListener('loadeddata', markLoaded, { once: true });
    heroVideo.addEventListener('canplay', markLoaded, { once: true });
  }

  function startHeroVideo() {
    heroVideo.muted = true;
    applyPlaybackSpeed();
    const playPromise = heroVideo.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        heroVideo.classList.add('is-playing');
        applyPlaybackSpeed();
      }).catch(() => {
        const retryAutoplay = () => {
          heroVideo.play().then(() => {
            heroVideo.classList.add('is-playing');
            applyPlaybackSpeed();
          }).catch(() => { });
          window.removeEventListener('click', retryAutoplay);
          window.removeEventListener('touchstart', retryAutoplay);
          window.removeEventListener('scroll', retryAutoplay);
        };
        window.addEventListener('click', retryAutoplay, { once: true, passive: true });
        window.addEventListener('touchstart', retryAutoplay, { once: true, passive: true });
        window.addEventListener('scroll', retryAutoplay, { once: true, passive: true });
      });
    }
  }

  heroVideo.addEventListener('ended', () => {
    heroVideo.currentTime = 0;
    applyPlaybackSpeed();
    heroVideo.play().catch(() => { });
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startHeroVideo);
  } else {
    startHeroVideo();
  }
})();

/* ==========================================================================
   GALLERY LIGHTBOX
   ========================================================================== */
(function () {
  var lightbox   = document.getElementById('lightbox');
  var lbImg      = document.getElementById('lightboxImg');
  var lbClose    = document.getElementById('lightboxClose');
  var lbBackdrop = document.getElementById('lightboxBackdrop');

  if (!lightbox || !lbImg) return;

  function openLightbox(src, caption) {
    lbImg.src = src;
    lbImg.alt = caption || '';
    lightbox.hidden = false;
    void lightbox.offsetHeight;
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  document.querySelectorAll('[data-lightbox]').forEach(function (item) {
    item.addEventListener('click', function () {
      openLightbox(item.dataset.lightbox, item.dataset.caption);
    });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(item.dataset.lightbox, item.dataset.caption);
      }
    });
  });

  lbClose.addEventListener('click', closeLightbox);
  lbBackdrop.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !lightbox.hidden) closeLightbox();
  });
})();

/* ==========================================================================
   OUR CLINIC REAL PATIENT OUTCOMES CONTROLLER (ALL 8 CASES)
   ========================================================================== */
(function initClinicShowcase() {
  var wrapper = document.getElementById('clinicShowcaseWrapper');
  var stage = document.getElementById('clinicStage');

  var featuredCase = document.getElementById('featuredCase');
  var featuredImg = document.getElementById('featuredImg');
  var featuredTitle = document.getElementById('featuredTitle');
  var featuredDesc = document.getElementById('featuredDesc');

  var casesGrid = document.getElementById('clinicCasesGrid');
  var gridCards = casesGrid ? Array.from(casesGrid.querySelectorAll('.clinic-grid-case')) : [];

  var mobileNav = document.getElementById('clinicMobileNav');
  var mobilePrevBtn = document.getElementById('clinicMobilePrev');
  var mobileNextBtn = document.getElementById('clinicMobileNext');
  var mobileCounter = document.getElementById('clinicMobileCounter');

  var arrowLeft = document.getElementById('clinicArrowLeft');
  var arrowRight = document.getElementById('clinicArrowRight');

  if (!featuredCase || !featuredImg || gridCards.length !== 4) return;

  var ALL_CASES = [
    {
      img: 'img/Gallery-1.png',
      alt: 'Cosmetic Smile Makeover Before and After',
      title: 'Cosmetic Smile Makeover',
      desc: 'Diastema space closure & aesthetic ceramic veneers'
    },
    {
      img: 'img/Gallery-2.png',
      alt: 'Midline Gap Closure Before and After',
      title: 'Midline Gap Closure',
      desc: 'Composite bonding & aesthetic spacing correction'
    },
    {
      img: 'img/Gallery-3.png',
      alt: 'Deep Dental Scaling Before and After',
      title: 'Deep Ultrasonic Scaling',
      desc: 'Ultrasonic airflow scaling & plaque stain removal'
    },
    {
      img: 'img/Gallery-4.png',
      alt: 'Arch Rehabilitation Before and After',
      title: 'Arch Rehabilitation',
      desc: 'Full dental arch alignment & restorative bridge'
    },
    {
      img: 'img/Gallery-1.png',
      alt: 'Fracture Restoration Before and After',
      title: 'Fracture Restoration',
      desc: 'Anterior composite repair & incisal edge matching'
    },
    {
      img: 'img/Gallery-2.png',
      alt: 'Ceramic Laminate Veneers Before and After',
      title: 'Ceramic Veneer Makeover',
      desc: 'Laminate porcelain veneers for smile aesthetics'
    },
    {
      img: 'img/Gallery-3.png',
      alt: 'Diastema Spacing Closure Before and After',
      title: 'Diastema Spacing Closure',
      desc: 'Micro-invasive anterior composite realignment'
    },
    {
      img: 'img/Gallery-4.png',
      alt: 'Periodontal Stain Removal Before and After',
      title: 'Subgingival Stain Removal',
      desc: 'Periodontal therapy & airflow cosmetic polish'
    }
  ];

  ALL_CASES.forEach(function (c) {
    var preloadImg = new Image();
    preloadImg.src = c.img;
  });

  var currentSetStart = 0;
  var featuredIndex = 0;
  var autoTimer = null;
  var AUTO_INTERVAL = 6500;

  function renderAll() {
    var fCase = ALL_CASES[featuredIndex];
    if (fCase) {
      featuredImg.src = fCase.img;
      featuredImg.alt = fCase.alt;
      if (featuredTitle) featuredTitle.textContent = fCase.title;
      if (featuredDesc) featuredDesc.textContent = fCase.desc;
    }

    for (var i = 0; i < 4; i++) {
      var caseIdx = currentSetStart + i;
      var cData = ALL_CASES[caseIdx];
      var card = gridCards[i];
      if (card && cData) {
        card.setAttribute('data-case-index', caseIdx);
        card.setAttribute('aria-label', cData.title);

        var img = card.querySelector('.clinic-case-img');
        var title = card.querySelector('.clinic-case-title');

        if (img) {
          img.src = cData.img;
          img.alt = cData.alt;
        }
        if (title) title.textContent = cData.title;

        var isFeatured = (caseIdx === featuredIndex);
        card.classList.toggle('is-active', isFeatured);
      }
    }

    if (mobileCounter) {
      mobileCounter.textContent = (featuredIndex + 1) + ' / ' + ALL_CASES.length;
    }
  }

  function promoteCaseByIndex(index) {
    if (index < 0 || index >= ALL_CASES.length) return;
    featuredIndex = index;
    renderAll();
  }

  function nextSet() {
    var oldStart = currentSetStart;
    currentSetStart = (currentSetStart + 4) % ALL_CASES.length;
    if (currentSetStart === oldStart && ALL_CASES.length <= 4) return;
    featuredIndex = currentSetStart;
    renderAll();
    resetAutoPlay();
  }

  function prevSet() {
    var oldStart = currentSetStart;
    currentSetStart = (currentSetStart - 4 + ALL_CASES.length) % ALL_CASES.length;
    if (currentSetStart === oldStart && ALL_CASES.length <= 4) return;
    featuredIndex = currentSetStart;
    renderAll();
    resetAutoPlay();
  }

  function nextCase() {
    featuredIndex = (featuredIndex + 1) % ALL_CASES.length;
    currentSetStart = featuredIndex < 4 ? 0 : 4;
    renderAll();
  }

  function prevCase() {
    featuredIndex = (featuredIndex - 1 + ALL_CASES.length) % ALL_CASES.length;
    currentSetStart = featuredIndex < 4 ? 0 : 4;
    renderAll();
  }

  function startAutoPlay() {
    stopAutoPlay();
    autoTimer = setInterval(nextCase, AUTO_INTERVAL);
  }

  function stopAutoPlay() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  function resetAutoPlay() {
    stopAutoPlay();
    startAutoPlay();
  }

  gridCards.forEach(function (card) {
    function handleCardClick() {
      var cIdx = parseInt(card.getAttribute('data-case-index'), 10);
      if (!isNaN(cIdx)) {
        promoteCaseByIndex(cIdx);
        resetAutoPlay();
      }
    }
    card.addEventListener('click', handleCardClick);
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleCardClick();
      }
    });
  });

  if (arrowLeft) {
    arrowLeft.addEventListener('click', function () {
      prevSet();
    });
  }

  if (arrowRight) {
    arrowRight.addEventListener('click', function () {
      nextSet();
    });
  }

  if (mobileNextBtn) {
    mobileNextBtn.addEventListener('click', function (e) {
      e.preventDefault();
      nextCase();
      resetAutoPlay();
    });
  }

  if (mobilePrevBtn) {
    mobilePrevBtn.addEventListener('click', function (e) {
      e.preventDefault();
      prevCase();
      resetAutoPlay();
    });
  }

  if (wrapper) {
    wrapper.addEventListener('mouseenter', stopAutoPlay);
    wrapper.addEventListener('mouseleave', startAutoPlay);
  }

  var touchStartX = 0;
  var touchEndX = 0;

  featuredCase.addEventListener('touchstart', function (e) {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  featuredCase.addEventListener('touchend', function (e) {
    touchEndX = e.changedTouches[0].screenX;
    var diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextCase();
      } else {
        prevCase();
      }
      resetAutoPlay();
    }
  }, { passive: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  renderAll();
  startAutoPlay();
})();

// ==========================================================================
// DYNAMIC 3D TILT HOVER SYSTEM (Book Appointment, Instagram, Facebook)
// ==========================================================================
(function () {
  const tiltSelectors = [
    '.book-btn',
    '.contact-btn-dark',
    '.form-submit-btn',
    '.footer-social-btn',
    '.contact-social-pill',
    '#footerBookBtn'
  ];

  const tiltElements = document.querySelectorAll(tiltSelectors.join(', '));

  tiltElements.forEach((el) => {
    let bounds = null;

    function onMouseEnter() {
      bounds = el.getBoundingClientRect();
      el.style.transition = 'transform 0.12s ease-out, box-shadow 0.25s ease';
    }

    function onMouseMove(e) {
      if (!bounds) bounds = el.getBoundingClientRect();
      const mouseX = e.clientX - bounds.left;
      const mouseY = e.clientY - bounds.top;
      const xPct = (mouseX / bounds.width) - 0.5;
      const yPct = (mouseY / bounds.height) - 0.5;

      const isSocial = el.classList.contains('footer-social-btn') || el.classList.contains('contact-social-pill');
      const maxRotX = isSocial ? 14 : 7;
      const maxRotY = isSocial ? 16 : 8;
      const maxRotZ = isSocial ? (el.classList.contains('footer-social-fb') || el.classList.contains('contact-social-fb') ? 8 : -8) : -1.8;
      const scaleVal = isSocial ? 1.14 : 1.04;

      const rotX = (-yPct * maxRotX).toFixed(2);
      const rotY = (xPct * maxRotY).toFixed(2);

      el.style.transform = `perspective(400px) translateY(-3px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${maxRotZ}deg) scale(${scaleVal})`;
    }

    function onMouseLeave() {
      el.style.transition = 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease';
      el.style.transform = '';
      bounds = null;
    }

    el.addEventListener('mouseenter', onMouseEnter, { passive: true });
    el.addEventListener('mousemove', onMouseMove, { passive: true });
    el.addEventListener('mouseleave', onMouseLeave, { passive: true });
  });
})();

// ==========================================================================
// TREATMENT SECTION MAGNETIC MOTION ENGINE
// ==========================================================================
(function () {
  const treatSection = document.getElementById('treatments');
  const cards = document.querySelectorAll('.treatments-grid .treatment-card');
  const sectionTag = treatSection ? treatSection.querySelector('.section-tag') : null;

  if (!treatSection || !cards.length) return;

  // 1. Ambient Section Spotlight Tracker
  let secRafId = null;
  treatSection.addEventListener('pointermove', function (e) {
    if (secRafId) cancelAnimationFrame(secRafId);
    secRafId = requestAnimationFrame(function () {
      const rect = treatSection.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      treatSection.style.setProperty('--sec-mouse-x', x.toFixed(1) + '%');
      treatSection.style.setProperty('--sec-mouse-y', y.toFixed(1) + '%');

      // Subtle magnetic drift on the section tag
      if (sectionTag) {
        const tagRect = sectionTag.getBoundingClientRect();
        const tagDistX = (e.clientX - (tagRect.left + tagRect.width / 2)) / 30;
        const tagDistY = (e.clientY - (tagRect.top + tagRect.height / 2)) / 30;
        if (Math.abs(tagDistX) < 8 && Math.abs(tagDistY) < 8) {
          sectionTag.style.transform = `translate3d(${tagDistX.toFixed(1)}px, ${tagDistY.toFixed(1)}px, 0)`;
        }
      }
    });
  }, { passive: true });

  treatSection.addEventListener('pointerleave', function () {
    if (sectionTag) {
      sectionTag.style.transition = 'transform 0.4s ease';
      sectionTag.style.transform = '';
      setTimeout(function () {
        if (sectionTag) sectionTag.style.transition = '';
      }, 400);
    }
  });

  // 2. Interactive Magnetic Card Physics & 3D Layered Depth
  cards.forEach(function (card) {
    const badge = card.querySelector('.treatment-card-badge');
    const arrow = card.querySelector('.treatment-arrow-btn');
    const img = card.querySelector('.treatment-card-img');

    let cardRect = null;
    let cardRaf = null;
    let releaseTimer = null;

    function onPointerEnter() {
      if (releaseTimer) clearTimeout(releaseTimer);
      card.classList.remove('is-releasing');
      card.classList.add('is-magnetic');
      cardRect = card.getBoundingClientRect();
    }

    function onPointerMove(e) {
      if (!cardRect) cardRect = card.getBoundingClientRect();

      if (cardRaf) cancelAnimationFrame(cardRaf);
      cardRaf = requestAnimationFrame(function () {
        const centerX = cardRect.left + cardRect.width / 2;
        const centerY = cardRect.top + cardRect.height / 2;
        const relX = (e.clientX - centerX) / (cardRect.width / 2); // -1 to 1
        const relY = (e.clientY - centerY) / (cardRect.height / 2); // -1 to 1

        // Clamped values for natural physical bounds
        const cX = Math.max(-1, Math.min(1, relX));
        const cY = Math.max(-1, Math.min(1, relY));

        // Magnetic Card Pull (translates up to ±10px, tilts up to ±8deg)
        const moveX = (cX * 10).toFixed(2);
        const moveY = (cY * 10).toFixed(2);
        const tiltX = (-cY * 8).toFixed(2);
        const tiltY = (cX * 8).toFixed(2);

        card.style.transform = `perspective(1000px) translate3d(${moveX}px, ${moveY}px, 12px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.025)`;

        // Specular Glare Follow
        const glareX = ((e.clientX - cardRect.left) / cardRect.width * 100).toFixed(1);
        const glareY = ((e.clientY - cardRect.top) / cardRect.height * 100).toFixed(1);
        card.style.setProperty('--magnetic-glare-x', glareX + '%');
        card.style.setProperty('--magnetic-glare-y', glareY + '%');

        // Badge Magnetic Extrusion (moves faster outward in 3D)
        if (badge) {
          const bX = (cX * 10).toFixed(2);
          const bY = (cY * 10).toFixed(2);
          badge.style.transform = `scale(1.06) translate3d(${bX}px, ${bY}px, 26px)`;
        }

        // Action Arrow Magnetic Pull
        if (arrow) {
          const aX = (cX * 8).toFixed(2);
          const aY = (cY * 8).toFixed(2);
          arrow.style.transform = `translate3d(${aX}px, ${aY}px, 20px)`;
        }

        // Card Image Subtle Inverse Depth
        if (img) {
          const iX = (-cX * 6).toFixed(2);
          const iY = (-cY * 6).toFixed(2);
          img.style.transform = `scale(1.08) translate3d(${iX}px, ${iY}px, 0)`;
        }
      });
    }

    function onPointerLeave() {
      if (cardRaf) cancelAnimationFrame(cardRaf);
      card.classList.remove('is-magnetic');
      card.classList.add('is-releasing');

      card.style.transform = '';
      if (badge) badge.style.transform = '';
      if (arrow) arrow.style.transform = '';
      if (img) img.style.transform = '';

      cardRect = null;

      releaseTimer = setTimeout(function () {
        card.classList.remove('is-releasing');
      }, 500);
    }

    card.addEventListener('pointerenter', onPointerEnter);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerleave', onPointerLeave);
  });
})();

// ==========================================================================
// DOCTOR SECTION — PARALLAX & INTERACTIVE SLIDE MOTION
// ==========================================================================
(function initDoctorSlideMotion() {
  const drSection = document.getElementById('stack');
  const drRight = document.querySelector('.dr-profile-right');
  const photoFrame = document.querySelector('.dr-photo-frame');

  if (!drSection || !drRight || !photoFrame) return;

  // 1. Subtle Scroll Parallax Slide for Doctor Photo Frame
  let isTicking = false;

  function updateScrollSlide() {
    if (photoFrame.dataset.hovered === 'true') {
      isTicking = false;
      return;
    }
    const rect = drSection.getBoundingClientRect();
    const windowH = window.innerHeight || document.documentElement.clientHeight;

    if (rect.bottom > 0 && rect.top < windowH) {
      const centerY = rect.top + rect.height / 2;
      const progress = (centerY - windowH / 2) / (windowH / 2);
      const clamped = Math.max(-1.5, Math.min(1.5, progress));
      const frameY = (clamped * 18).toFixed(1);
      photoFrame.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      photoFrame.style.transform = `translate3d(0, ${frameY}px, 0)`;
    }
    isTicking = false;
  }

  window.addEventListener('scroll', function () {
    if (!isTicking) {
      window.requestAnimationFrame(updateScrollSlide);
      isTicking = true;
    }
  }, { passive: true });

  // 2. Interactive Pointer Slide Motion for Doctor Photo Frame on Desktop
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;
  if (!isFinePointer) return;

  let pointerRaf = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function animatePointerSlide() {
    currentX += (targetX - currentX) * 0.075;
    currentY += (targetY - currentY) * 0.075;

    const rotX = (-currentY * 4.5).toFixed(2);
    const rotY = (currentX * 5.5).toFixed(2);
    const transX = (currentX * 14).toFixed(2);
    const transY = (currentY * 12).toFixed(2);

    photoFrame.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate3d(${transX}px, ${transY}px, 14px)`;

    if (photoFrame.dataset.hovered === 'true') {
      pointerRaf = requestAnimationFrame(animatePointerSlide);
    }
  }

  drRight.addEventListener('pointerenter', function () {
    photoFrame.dataset.hovered = 'true';
    photoFrame.style.transition = 'box-shadow 0.4s ease';
    if (pointerRaf) cancelAnimationFrame(pointerRaf);
    pointerRaf = requestAnimationFrame(animatePointerSlide);
  });

  drRight.addEventListener('pointermove', function (e) {
    const rect = drRight.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = Math.max(-0.5, Math.min(0.5, x)) * 2;
    targetY = Math.max(-0.5, Math.min(0.5, y)) * 2;
  });

  drRight.addEventListener('pointerleave', function () {
    delete photoFrame.dataset.hovered;
    if (pointerRaf) cancelAnimationFrame(pointerRaf);
    targetX = 0;
    targetY = 0;

    photoFrame.style.transition = 'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)';
    photoFrame.style.transform = '';

    setTimeout(function () {
      photoFrame.style.transition = '';
      updateScrollSlide();
    }, 1150);
  });
})();



