document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    const navBackdrop = document.querySelector(".nav-backdrop");
    const navAnchors = document.querySelectorAll(".nav-links a");
    const navItems = document.querySelectorAll(".nav-links li");

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ========================================
    // HERO ENTRANCE ANIMATIONS
    // ========================================
    if (typeof gsap !== "undefined" && !prefersReducedMotion) {
        const heroTl = gsap.timeline({ delay: 0.3, defaults: { ease: "power3.out" } });

        heroTl.from(".brand", { y: -40, opacity: 0, duration: 0.8 }, 0)
            .from(".menu-cluster", { y: -40, opacity: 0, duration: 0.8 }, 0.05)
            .from(".hero-title", { y: 70, opacity: 0, duration: 1.1 }, 0.15)
            .from([".hero-role", ".hero-desc"], { y: 40, opacity: 0, duration: 0.85, stagger: 0.12 }, 0.5)
            .from(".hero-date", { y: 25, opacity: 0, duration: 0.7 }, 0.75)
            .from(".cv-btn", { y: 25, opacity: 0, duration: 0.7 }, 0.9)
            .from(".hero-nav", { y: 70, opacity: 0, duration: 0.9 }, 0.8);

        // Floating red petals: spawned once, drifting down the hero.
        const petalLayer = document.querySelector(".hero-petals");
        if (petalLayer) {
            const petalCount = window.innerWidth < 768 ? 10 : 16;
            for (let i = 0; i < petalCount; i++) {
                const petal = document.createElement("span");
                petal.className = "petal";
                const size = 5 + Math.random() * 7;
                petal.style.left = Math.random() * 100 + "vw";
                petal.style.width = size + "px";
                petal.style.height = size + "px";
                petal.style.opacity = String(0.25 + Math.random() * 0.4);
                petalLayer.appendChild(petal);

                gsap.fromTo(petal,
                    { y: -40, x: 0, rotate: 0 },
                    {
                        y: window.innerHeight + 60,
                        x: (Math.random() - 0.5) * 160,
                        rotate: Math.random() * 540 - 270,
                        duration: 9 + Math.random() * 9,
                        delay: -Math.random() * 12,
                        repeat: -1,
                        ease: "none"
                    }
                );
            }
        }
    }

    gsap.registerPlugin(ScrollTrigger);

    // ========================================
    // DOWNLOAD CV BUTTON - red fill sweeps left to right,
    // then the real PDF download starts.
    // ========================================
    const cvBtn = document.querySelector(".cv-btn");
    if (cvBtn) {
        const FILL_MS = 640; // keep in sync with the CSS transition on .cv-btn-fill
        let animating = false;

        cvBtn.addEventListener("click", (event) => {
            // Let modified clicks (new tab/window) use the browser default.
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
            // Ignore repeat clicks while the sweep is running.
            if (animating) {
                event.preventDefault();
                return;
            }
            event.preventDefault();
            animating = true;
            cvBtn.classList.add("is-filling");
            cvBtn.setAttribute("aria-busy", "true");

            let finished = false;
            const finish = () => {
                if (finished) return;
                finished = true;
                const temp = document.createElement("a");
                temp.href = cvBtn.getAttribute("href");
                temp.setAttribute("download", cvBtn.getAttribute("download") || "");
                document.body.appendChild(temp);
                temp.click();
                temp.remove();
                cvBtn.classList.remove("is-filling");
                cvBtn.removeAttribute("aria-busy");
                animating = false;
            };

            const fill = cvBtn.querySelector(".cv-btn-fill");
            if (fill) {
                fill.addEventListener("transitionend", (e) => {
                    if (e.propertyName === "transform" && e.target === fill) finish();
                }, { once: true });
            }
            setTimeout(finish, FILL_MS + 220);
        });
    }

    const setMenu = (open) => {
        if (!menuToggle || !navLinks || !navBackdrop) return;
        menuToggle.classList.toggle("active", open);
        navLinks.classList.toggle("active", open);
        navBackdrop.classList.toggle("active", open);
        navbar.classList.toggle("menu-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Toggle navigation menu");
        document.body.style.overflow = open ? "hidden" : "";

        if (open) {
            gsap.from(navItems, {
                x: 50,
                opacity: 0,
                duration: 0.5,
                stagger: 0.08,
                ease: "power3.out",
                clearProps: "all"
            });
        }
    };

    const isMenuOpen = () =>
        menuToggle && menuToggle.classList.contains("active");

    if (menuToggle) {
        menuToggle.addEventListener("click", () => {
            setMenu(!isMenuOpen());
        });
    }

    if (navBackdrop) {
        navBackdrop.addEventListener("click", () => setMenu(false));
    }

    navAnchors.forEach((link) => {
        link.addEventListener("click", () => setMenu(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && isMenuOpen()) {
            setMenu(false);
        }
    });

    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (isMenuOpen()) {
                setMenu(false);
            }
        }, 120);
    });

    const onScroll = () => {
        if (!navbar) return;
        navbar.classList.toggle("scrolled", window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        const nameInput = document.getElementById("contact-name");
        const emailInput = document.getElementById("contact-email-input");
        const messageInput = document.getElementById("contact-message");
        const nameError = document.getElementById("contact-name-error");
        const emailError = document.getElementById("contact-email-error");
        const messageError = document.getElementById("contact-message-error");
        const formStatus = document.getElementById("contact-form-status");
        const submitBtn = contactForm.querySelector(".submit-btn");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const setError = (el, msg) => {
            if (!el) return;
            el.textContent = msg;
            const group = el.closest(".form-group");
            if (group) group.classList.toggle("has-error", !!msg);
        };

        const setStatus = (msg, isSuccess = false) => {
            if (!formStatus) return;
            formStatus.textContent = msg;
            formStatus.style.color = isSuccess ? "#4ade80" : "#ff6b6b";
            gsap.fromTo(formStatus,
                { opacity: 0, y: 10 },
                { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
            );
        };

        const setSubmitting = (isSubmitting) => {
            if (!submitBtn) return;
            submitBtn.disabled = isSubmitting;
            if (isSubmitting) {
                submitBtn.innerHTML = 'Sending... <span class="btn-arrow" aria-hidden="true">&#8594;</span>';
            } else {
                submitBtn.innerHTML = 'Send Message <span class="btn-arrow" aria-hidden="true">&#8594;</span>';
            }
        };

        contactForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            if (!nameInput || !emailInput || !messageInput) return;

            let hasError = false;
            setError(nameError, "");
            setError(emailError, "");
            setError(messageError, "");
            if (formStatus) formStatus.textContent = "";

            if (nameInput.value.trim() === "") {
                setError(nameError, "Name is required.");
                hasError = true;
            }

            const emailVal = emailInput.value.trim();
            if (emailVal === "") {
                setError(emailError, "Email is required.");
                hasError = true;
            } else if (!emailRegex.test(emailVal)) {
                setError(emailError, "Please enter a valid email address.");
                hasError = true;
            }

            if (messageInput.value.trim() === "") {
                setError(messageError, "Message is required.");
                hasError = true;
            }

            if (hasError) return;

            setSubmitting(true);

            const formData = new FormData(contactForm);

            try {
                const response = await fetch("https://api.web3forms.com/submit", {
                    method: "POST",
                    body: formData,
                });

                const result = await response.json();

                if (result.success) {
                    setStatus("Message sent successfully!", true);
                    contactForm.reset();
                } else {
                    const msg = result.message || "Unable to send your message. Please try again.";
                    setStatus(msg, false);
                }
            } catch (error) {
                setStatus("Unable to send your message. Please try again.", false);
            } finally {
                setSubmitting(false);
            }
        });
    }

    const copyButtons = document.querySelectorAll(".copy-btn");
    copyButtons.forEach((button) => {
        button.addEventListener("click", async (event) => {
            event.preventDefault();
            const targetId = button.dataset.copyTarget;
            const target = targetId ? document.getElementById(targetId) : null;
            const text = target ? target.textContent.trim() : "";
            if (!text) return;
            try {
                await navigator.clipboard.writeText(text);
            } catch (error) {
                const helper = document.createElement("textarea");
                helper.value = text;
                helper.setAttribute("readonly", "");
                helper.style.position = "fixed";
                helper.style.opacity = "0";
                document.body.appendChild(helper);
                helper.select();
                document.execCommand("copy");
                document.body.removeChild(helper);
            }
            button.classList.add("copied");
            clearTimeout(button._copyTimer);
            button._copyTimer = setTimeout(() => button.classList.remove("copied"), 1600);
        });
    });
});

// ========================================
// GSAP SCROLL ANIMATIONS
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    // Respect users who prefer reduced motion: no scroll animations at all.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Runs on desktop AND mobile (the CSS breakpoint is 768px).
    // gsap.matchMedia() automatically kills/reverts these animations when the
    // query no longer matches, so each layout stays clean on resize.
    const mm = gsap.matchMedia();

    // Shared About-section animations. withImage is true on desktop only,
    // because mobile hides .about-image and shows the artwork as a background.
    const buildAboutAnimations = (withImage) => {
        const SCRUB = 1; // seconds of catch-up smoothing; reverses on scroll up

        // 1. SAMURAI PARALLAX (desktop only - image is display:none on mobile)
        // Stronger left/up movement with a matching scale-up so the artwork
        // always covers its column (no empty edges, no horizontal overflow).
        if (withImage) {
            gsap.to(".about-image", {
                xPercent: -12,
                yPercent: -12,
                scale: 1.3,
                ease: "none",
                scrollTrigger: {
                    trigger: ".about-section",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: SCRUB
                }
            });
        }

        // Shared scrubbed timeline for the About section reveals.
        // start: when the section top reaches 85% of the viewport.
        // end:   when the section top reaches 25% of the viewport.
        const aboutTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".about-section",
                start: "top 85%",
                end: "top 25%",
                scrub: SCRUB
            }
        });

        // 2. HEADING REVEAL - clipping-mask reveal (font/typography untouched,
        // no layout shift because clip-path never changes the box model).
        aboutTl.fromTo(".about-content h2",
            { clipPath: "inset(0% 100% 0% 0%)", y: 45 },
            { clipPath: "inset(0% 0% 0% 0%)", y: 0, ease: "none", duration: 1 },
            0
        );

        // 3. CONTENT REVEAL - paragraph + tagline rise and fade in.
        aboutTl.fromTo(".about-description",
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, ease: "none", duration: 1 },
            0.35
        );

        aboutTl.fromTo(".about-content h3",
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, ease: "none", duration: 1 },
            0.5
        );

        // 4. FEATURE STAGGER - the four feature items arrive one by one.
        aboutTl.fromTo(".feature",
            { y: 80, opacity: 0, scale: 0.9 },
            { y: 0, opacity: 1, scale: 1, ease: "none", duration: 1, stagger: 0.2 },
            0.65
        );

        // 5a. ABOUT -> PROJECTS: the About content settles as it scrolls away.
        gsap.to(".about-content", {
            y: -60,
            opacity: 0.3,
            ease: "none",
            scrollTrigger: {
                trigger: ".about-section",
                start: "top 20%",
                end: "bottom 60%",
                scrub: SCRUB
            }
        });

        // 5b. ABOUT -> PROJECTS: the Projects heading enters naturally.
        gsap.fromTo(".projects-header",
            { y: 90, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                scale: 1,
                ease: "none",
                scrollTrigger: {
                    trigger: ".projects-section",
                    start: "top 85%",
                    end: "top 50%",
                    scrub: SCRUB
                }
            }
        );

        return () => {
            gsap.set([
                ".about-image",
                ".about-content",
                ".about-content h2",
                ".about-description",
                ".about-content h3",
                ".feature",
                ".projects-header"
            ], { clearProps: "all" });
        };
    };

    // Desktop (>=769px): full set including the samurai parallax.
    mm.add("(min-width: 769px)", () => buildAboutAnimations(true));

    // Mobile (<=768px): all content animations, image parallax excluded.
    mm.add("(max-width: 768px)", () => buildAboutAnimations(false));

    // ========================================
    // TOOLS & STACKS: alternating left/right entrance
    // Runs on mobile, tablet and desktop alike.
    // ========================================
    if (document.querySelector(".tools-section")) {
        const toolCards = gsap.utils.toArray(".tool-card");

        // Scroll-gated: starts only when the section enters the viewport
        // (progress 0 = cards off-screen/invisible), completes when the
        // section has fully scrolled past. Scrolling back up reverses it.
        const toolsTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".tools-section",
                start: "top 65%",
                end: "bottom 75%",
                scrub: 1
            }
        });

        // Header settles in first.
        toolsTl.fromTo(".tools-header",
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, ease: "none", duration: 0.7, clearProps: "transform, opacity" },
            0
        );

        // Cards alternate: 1st/3rd/5th from the left, 2nd/4th/6th from the right.
        toolCards.forEach((card, i) => {
            const fromX = i % 2 === 0 ? -110 : 110;
            toolsTl.fromTo(card,
                { x: fromX, opacity: 0 },
                {
                    x: 0,
                    opacity: 1,
                    ease: "none",
                    duration: 0.85,
                    clearProps: "transform, opacity"
                },
                0.3 + i * 0.45
            );
        });
    }

    // ========================================
    // SECTION REVEALS: Home / Projects / Contact / Footer
    // Same scrubbed style as the About section, all viewports.
    // ========================================

    // HOME - restrained parallax on the samurai background; hero content
    // drifts up and fades as the page scrolls away.
    if (document.querySelector("#home")) {
        if (document.querySelector(".hero-bg")) {
            gsap.to(".hero-bg", {
                scale: 1.12,
                yPercent: 5,
                ease: "none",
                scrollTrigger: {
                    trigger: "#home",
                    start: "top top",
                    end: "bottom top",
                    scrub: 1
                }
            });
        }
        gsap.timeline({
            scrollTrigger: {
                trigger: "#home",
                start: "top top",
                end: "bottom top",
                scrub: 1
            }
        }).fromTo(".hero-content",
            { y: 0, opacity: 1 },
            { y: -50, opacity: 0, ease: "none" }
        ).fromTo(".hero-nav",
            { y: 0, opacity: 1 },
            { y: 60, opacity: 0, ease: "none" },
            0
        );
    }

    // PROJECTS - cards rise and fade in one by one
    // (the Projects heading itself is handled by the About -> Projects transition).
    if (document.querySelector("#projects")) {
        const projectCards = gsap.utils.toArray(".project-card");
        if (projectCards.length) {
            gsap.timeline({
                scrollTrigger: {
                    trigger: "#projects",
                    start: "top 70%",
                    end: "top 15%",
                    scrub: 1
                }
            }).fromTo(projectCards,
                { y: 60, opacity: 0 },
                { y: 0, opacity: 1, ease: "none", duration: 0.8, stagger: 0.2, clearProps: "transform, opacity" }
            );
        }
    }

    // CONTACT section intentionally has no scroll animations.

    // FOOTER - gentle settle-in.
    if (document.querySelector(".footer")) {
        gsap.fromTo(".footer",
            { y: 30, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                ease: "none",
                duration: 0.7,
                clearProps: "transform, opacity",
                scrollTrigger: {
                    trigger: ".footer",
                    start: "top 92%",
                    end: "top 70%",
                    scrub: 1
                }
            }
        );
    }
});
