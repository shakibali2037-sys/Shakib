// Register ScrollTrigger with GSAP
gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Initial Hero Animations (Slide up & Fade In)
    const tl = gsap.timeline();

    tl.from(".reveal-nav", {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
    })
    .from(".hero-content .reveal", {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out"
    }, "-=0.5");

    // 2. Scroll-to-Reveal Effects for Sections
    // As the user scrolls down, elements slide up from the bottom and fade in from 0% to 100% opacity.
    
    // Select all major sections
    const sections = gsap.utils.toArray('.reveal-section');

    sections.forEach(section => {
        gsap.from(section, {
            scrollTrigger: {
                trigger: section,
                start: "top 85%", // Trigger when top of section hits 85% of viewport
                end: "bottom top", 
                toggleActions: "play reverse play reverse" // play forward on enter, reverse on leave, play on re-enter from top, reverse on leave from bottom. This handles the 'Exit' animation subtly.
            },
            y: 100,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out"
        });
    });

    // 3. Staggered reveal for cards & items inside sections
    // Services, About, Portfolio Grids
    const staggerElements = ['.about-card', '.service-card', '.project-card', '.timeline-item', '.testimonial-card'];
    
    staggerElements.forEach(selector => {
        const elements = gsap.utils.toArray(selector);
        
        elements.forEach(el => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 90%",
                    toggleActions: "play reverse play reverse" 
                },
                y: 60,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out"
            });
        });
    });

    // 4. Client Project Showcase Auto-Slideshow
    const slides = document.querySelectorAll('.client-showcase-media .slide');
    if (slides.length > 0) {
        let currentSlide = 0;
        
        // Change slide every 3 seconds
        setInterval(() => {
            // Remove active class from current slide
            slides[currentSlide].classList.remove('active');
            
            // Move to next slide, wrap around if at the end
            currentSlide = (currentSlide + 1) % slides.length;
            
            // Add active class to new slide
            slides[currentSlide].classList.add('active');
        }, 3000); // 3000ms = 3 seconds
    }

    // 4. Interactive Elements: Hover-triggered motion on project cards
    // When hovering over a project card with a video, play the video automatically
    // 6. Project Carousel Logic
    const carouselContainers = document.querySelectorAll('.carousel-container');

    carouselContainers.forEach(container => {
        const track = container.querySelector('.carousel-track');
        const items = Array.from(track.children);
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');

        if (!track || items.length <= 1) return; // Only process if >1 item

        let currentIndex = 0;

        // Ensure clicking buttons doesn't trigger the modal
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moveToSlide(currentIndex - 1);
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moveToSlide(currentIndex + 1);
        });

        function moveToSlide(index) {
            if (index < 0) index = items.length - 1;
            if (index >= items.length) index = 0;

            track.style.transform = `translateX(-${index * 100}%)`;
            
            // Pause all videos
            items.forEach(v => {
                if(v.tagName === 'VIDEO') v.pause();
                v.classList.remove('active-slide');
            });
            
            // Mark new slide as active
            items[index].classList.add('active-slide');
            currentIndex = index;
        }
    });

    // 7. Interactive Elements: Hover-triggered motion & Click for Modal
    const mediaContainers = document.querySelectorAll('.media-container');
    const modal = document.getElementById('video-modal');
    const modalVideo = document.getElementById('modal-video');
    const closeModal = document.querySelector('.close-modal');

    mediaContainers.forEach(container => {
        // Find if this is a carousel or single video
        const track = container.querySelector('.carousel-track');
        container.addEventListener('mouseenter', () => {
            let activeVideo;
            if (track) {
                activeVideo = track.querySelector('.active-slide');
            } else {
                activeVideo = container.querySelector('video') || container.querySelector('iframe');
            }

            if (activeVideo && activeVideo.tagName === 'VIDEO') {
                activeVideo.play().catch(e => console.log("Video auto-play prevented. User interaction required."));
            }
        });

        container.addEventListener('mouseleave', () => {
             let activeVideo;
             if (track) {
                 activeVideo = track.querySelector('.active-slide');
             } else {
                 activeVideo = container.querySelector('video') || container.querySelector('iframe');
             }

             if (activeVideo && activeVideo.tagName === 'VIDEO') {
                 activeVideo.pause();
             }
        });

        // Click to open modal
        container.addEventListener('click', (e) => {
            // If they clicked a control button, ignore
            if(e.target.closest('.carousel-btn')) return;

            let activeVideo;
            if (track) {
                activeVideo = track.querySelector('.active-slide');
            } else {
                activeVideo = container.querySelector('video') || container.querySelector('iframe');
            }

            if (activeVideo) {
                if (activeVideo.tagName === 'VIDEO') {
                    const sourceElement = activeVideo.querySelector('source');
                    if (sourceElement && sourceElement.src) {
                        modalVideo.style.display = 'block';
                        const modalIframe = document.getElementById('modal-iframe');
                        if (modalIframe) modalIframe.style.display = 'none';
                        
                        modalVideo.querySelector('source').src = sourceElement.src;
                        modalVideo.load();
                        
                        // Show modal
                        modal.classList.add('show');
                        
                        // Attempt to auto play the modal video
                        modalVideo.play().catch(err => console.log(err));
                    }
                } else if (activeVideo.tagName === 'IFRAME') {
                    const iframeSrc = activeVideo.src;
                    if (iframeSrc) {
                        modalVideo.style.display = 'none';
                        modalVideo.pause();
                        
                        const modalIframe = document.getElementById('modal-iframe');
                        if (modalIframe) {
                            modalIframe.style.display = 'block';
                            
                            // Append autoplay to the YouTube URL safely
                            let autoplaySrc = iframeSrc;
                            if (!autoplaySrc.includes('autoplay=1')) {
                                autoplaySrc += (autoplaySrc.includes('?') ? '&' : '?') + 'autoplay=1';
                            }
                            modalIframe.src = autoplaySrc;
                        }
                        
                        // Show modal
                        modal.classList.add('show');
                    }
                }
            }
        });
    });

    function hideModal() {
        modal.classList.remove('show');
        modalVideo.pause();
        modalVideo.currentTime = 0;
        modalVideo.querySelector('source').src = "";
        
        const modalIframe = document.getElementById('modal-iframe');
        if (modalIframe) {
            modalIframe.src = "";
        }
    }

    if (closeModal) {
        closeModal.addEventListener('click', hideModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal();
            }
        });
    }

    // 5. Smooth scrolling for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
