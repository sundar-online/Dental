/**
 * Doctor Team Carousel Slider
 * Handles smooth scrolling, arrow navigation, mouse drag, and social sharing pill
 */
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('doctorSliderTrack');
    const viewport = document.getElementById('doctorSliderViewport');
    const prevBtn = document.getElementById('sliderPrevBtn');
    const nextBtn = document.getElementById('sliderNextBtn');

    if (!track) return;

    // Helper: Get card scroll distance (1 card width + gap)
    function getScrollStep() {
        const firstCard = track.querySelector('.doctor-slide-card');
        if (!firstCard) return 360;
        const gap = parseInt(window.getComputedStyle(track).gap) || 26;
        return firstCard.offsetWidth + gap;
    }

    // Update arrow buttons disabled state
    function updateArrowStates() {
        if (!prevBtn || !nextBtn) return;
        const maxScrollLeft = track.scrollWidth - track.clientWidth - 5;
        prevBtn.disabled = track.scrollLeft <= 5;
        nextBtn.disabled = track.scrollLeft >= maxScrollLeft;
    }

    // Click event for Previous Arrow
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const step = getScrollStep();
            track.scrollBy({ left: -step, behavior: 'smooth' });
        });
    }

    // Click event for Next Arrow
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const step = getScrollStep();
            track.scrollBy({ left: step, behavior: 'smooth' });
        });
    }

    track.addEventListener('scroll', updateArrowStates, { passive: true });
    window.addEventListener('resize', updateArrowStates);
    setTimeout(updateArrowStates, 300);

    // Mouse Drag to Scroll
    let isDown = false;
    let startX = 0;
    let scrollStart = 0;
    let hasMoved = false;

    if (viewport) {
        viewport.addEventListener('mousedown', (e) => {
            // Ignore if clicking on buttons or links
            if (e.target.closest('button') || e.target.closest('a')) return;
            isDown = true;
            hasMoved = false;
            viewport.classList.add('is-dragging');
            startX = e.pageX - viewport.offsetLeft;
            scrollStart = track.scrollLeft;
        });

        window.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            viewport.classList.remove('is-dragging');
        });

        viewport.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - viewport.offsetLeft;
            const walk = (x - startX) * 1.5;
            if (Math.abs(x - startX) > 5) hasMoved = true;
            track.scrollLeft = scrollStart - walk;
        });

        // Prevent accidental link click if dragging
        viewport.addEventListener('click', (e) => {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, true);
    }

    // Share Button Popover Logic for mobile / touch devices
    const shareWidgets = document.querySelectorAll('.doctor-share-widget');
    shareWidgets.forEach(widget => {
        const trigger = widget.querySelector('.share-btn-trigger');
        if (!trigger) return;

        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            // Close other widgets
            shareWidgets.forEach(other => {
                if (other !== widget) other.classList.remove('active');
            });

            widget.classList.toggle('active');
        });
    });

    // Close any open share pill on document click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.doctor-share-widget')) {
            shareWidgets.forEach(widget => widget.classList.remove('active'));
        }
    });

    // Copy link helper for copy buttons
    document.querySelectorAll('[data-share-copy]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const url = window.location.origin + window.location.pathname + btn.getAttribute('data-share-copy');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(url).then(() => {
                    const originalTitle = btn.getAttribute('title') || '';
                    btn.setAttribute('title', 'Copied Link!');
                    alert('Profile link copied to clipboard: ' + url);
                });
            } else {
                alert('Profile link: ' + url);
            }
        });
    });
});
