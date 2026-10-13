document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const navBackdrop = document.querySelector(".nav-backdrop");
    const navAnchors = document.querySelectorAll(".nav-links a");

    const isMobile = () => window.matchMedia("(max-width: 767px)").matches;

    const setMenu = (open) => {
        if (!hamburger || !navLinks || !navBackdrop) return;
        hamburger.classList.toggle("active", open);
        navLinks.classList.toggle("active", open);
        navBackdrop.classList.toggle("active", open);
        navbar.classList.toggle("menu-open", open);
        hamburger.setAttribute("aria-expanded", String(open));
        hamburger.setAttribute("aria-label", open ? "Close navigation menu" : "Toggle navigation menu");
        document.body.style.overflow = open ? "hidden" : "";
    };

    const isMenuOpen = () =>
        hamburger && hamburger.classList.contains("active");

    if (hamburger) {
        hamburger.addEventListener("click", () => {
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
            if (!isMobile() && isMenuOpen()) {
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
        contactForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const button = contactForm.querySelector(".submit-btn");
            const originalText = button.textContent;
            button.textContent = "Message Sent";
            button.disabled = true;
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                contactForm.reset();
            }, 2000);
        });
    }
});
