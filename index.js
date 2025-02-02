const _BREAKPOINTS = {
    mobile: 768,
    tablet: 1064,
    desktopS: 1440
};

let breakpoint;
let overlay;
let popUp;

document.addEventListener("DOMContentLoaded", function () {
    init();
});

async function init() {
    try {
        $(".input-phone").inputmask("+7 (999) 999 99 99");

        /* Fetch data */
        const data = await fetch("./data.json", {
            method: "GET",
            headers: {
                "Accept": "application/json",
            }
        })
            .then((response) => response.json())
            .catch(() => { throw new Error("Data is not found") })
        const { menu, features, products } = data;

        /* Handle resize */
        handleResize();
        window.addEventListener("resize", handleResize);

        /* Initialize components */
        popUp = new PopUp();

        overlay = document.querySelector(".overlay");

        const Nav = new Navigation(menu);
        Nav.init();

        initFeatures(features);

        initCatalogue(products);

        initOrderForm();

        lightbox.option({
            "resizeDuration": 700,
            "wrapAround": true,
            "showImageNumberLabel": false,
            "fitImagesInViewport": true,
            "positionFromTop": 50,
            alwaysShowNavOnTouchDevices: true,
            disableScrolling: true,
        });

        initSmoothScroll();

        /* Show page */
        document.body.classList.remove("hidden");

    } catch (error) {

    }
}

class Navigation {
    constructor(menu) {
        this.menu = menu;
        this.navDesk = document.querySelector(".nav-desktop");
        this.navMobile = document.querySelector(".nav-mobile");
        this.btnOpen = document.querySelector(".btn-hamburger");
        this.btnClose = this.navMobile.querySelector(".btn-close");
        window.addEventListener("breakpointChange", this.handleBpChange.bind(this));
        this.btnOpen.addEventListener("click", () => {
            fixWindow(true);
            overlay?.classList.remove("hidden");
            this.navMobile.classList.add("slided");
        })
        this.btnClose.addEventListener("click", () => {
            fixWindow(false);
            overlay?.classList.add("hidden");
            this.navMobile.classList.remove("slided");
        })
    }

    init() {
        this.menu.forEach((item) => {
            const a = document.createElement("a");
            a.classList = "nav__item t-small";
            a.href = item.link;
            a.innerText = item.title;
            this.navMobile.appendChild(a);
            this.navDesk.appendChild(a.cloneNode(true));
        });
        if (breakpoint === "mobile" || breakpoint === "tablet") {
            this.showMobileNav();
        } else {
            this.showDesktopNav();
        }
    }

    showMobileNav() {
        this.navDesk.classList.add("hidden");
        this.navMobile.classList.remove("hidden");
    }

    showDesktopNav() {
        this.navMobile.classList.add("hidden");
        this.navDesk.classList.remove("hidden");
    }

    handleBpChange() {
        if (breakpoint === "mobile" || breakpoint === "tablet") {
            this.showMobileNav();
        } else {
            this.showDesktopNav();
        }
    }
}

function getBreakpoint() {
    const width = window.innerWidth;

    if (width <= _BREAKPOINTS.mobile) {
        return "mobile";
    } else if (width <= _BREAKPOINTS.tablet) {
        return "tablet";
    } else if (width <= _BREAKPOINTS.desktopS) {
        return "desktop-s";
    } else {
        return "desktop";
    }
}

function handleResize() {
    const newBreakpoint = getBreakpoint();

    if (newBreakpoint !== breakpoint) {
        breakpoint = newBreakpoint;
        const event = new CustomEvent("breakpointChange");
        window.dispatchEvent(event);
    }

}

function initFeatures(features) {
    const featuresBox = document.querySelector(".features");
    features.forEach(({ title, text, img }) => {
        const item = document.createElement("div");
        item.classList = "feature";
        const image = document.createElement("img")
        image.classList = "feature__img";
        image.src = img;
        image.alt = title;
        const ttl = document.createElement("h3");
        ttl.classList = "feature__title t3";
        ttl.innerHTML = title;
        const description = document.createElement("span");
        description.classList = "feature__description t-body";
        description.innerHTML = text;
        item.append(image, ttl, description);
        featuresBox.appendChild(item);
    })
}


function fixWindow(type) {
    const htmlElement = document.documentElement;
    if (type) {
        htmlElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
        document.body.style.touchAction = "none";
        document.body.style.pointerEvents = "none";
    } else {
        htmlElement.style.height = "";
        document.body.style.height = "";
        htmlElement.style.overflow = "";
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
        document.body.style.pointerEvents = "";
    }
}

function initCatalogue(products) {
    const catalogue = document.querySelector(".catalogue");
    products.forEach(({ img, title, ingredients }) => {
        const item = document.createElement("div");
        item.classList = "product";
        const lb = document.createElement("a");
        lb.href = img;
        lb.dataset.lightbox = "product-gallery";
        lb.dataset.title = title;
        lb.classList = "product__img";
        const image = document.createElement("img");
        image.classList = "img";
        image.src = img;
        image.alt = title;
        lb.append(image);
        const ttl = document.createElement("h4");
        ttl.className = "product__title t4";
        ttl.innerHTML = title;
        const description = document.createElement("span");
        description.classList = "product__ingredient t-small-xs";
        description.innerHTML = ingredients;
        const btn = document.createElement("button")
        btn.classList = "btn btn-primary btn-add-to-cart t-btn";
        btn.type = "button";
        btn.innerText = "В корзину";
        item.append(lb, ttl, description, btn);
        catalogue.appendChild(item);
    });
}

function initOrderForm() {
    const form = document.querySelector(".form-order");
    const nameInput = form.querySelector(".input-name");
    const nameInputError = form.querySelector(".input-error-name");
    const addressInput = form.querySelector(".input-address");
    const addressInputError = form.querySelector(".input-error-address");
    const phoneInput = form.querySelector(".input-phone");
    const phoneInputError = form.querySelector(".input-error-phone");

    const formInputError = form.querySelector(".input-error-form");
    const btnSubmit = form.querySelector(".btn-submit");

    nameInput.addEventListener("input", function () {
        nameInput.value = nameInput.value.replace(/[.\d]/g, "");
        nameInputError.classList.add("hidden");
    });

    nameInput.addEventListener("blur", () => {
        const result = validateName(nameInput.value);
        if (!result.isValid) {
            nameInputError.innerText = result.message ?? "";
            nameInputError.classList.remove("hidden");
        }
    })

    addressInput.addEventListener("input", function () {
        addressInputError.classList.add("hidden");
    });

    addressInput.addEventListener("blur", () => {
        const result = validateAddress(addressInput.value);
        if (!result.isValid) {
            addressInputError.innerText = result.message ?? "";
            addressInputError.classList.remove("hidden");
        }
    })

    $(".input-phone").on("input", function () {
        phoneInputError.classList.add("hidden");
    });

    phoneInput.addEventListener("blur", () => {
        const result = validatePhone();
        if (!result.isValid) {
            phoneInputError.innerText = result.message ?? "";
            phoneInputError.classList.remove("hidden");
        }
    })

    form.addEventListener("input", () => {
        formInputError.classList.add("hidden");
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const result = validateForm(formData);
        
        if (result.isValid) {
            try {
                btnSubmit.disabled = true;
                const pendingRequest = () => new Promise((res) => {
                    setTimeout(() => res({ status: "success" }), 1000);
                }, (rej) => {
                    setTimeout(() => res({ status: "error" }), 1000);
                });

                const response = await pendingRequest();


                if (response.status === "error") {
                    popUp.open("Ошибка. Заказ не был оформлен.");
                } else {
                    popUp.open("Спасибо за заказ");
                }

            } catch (error) {
                formInputError.innerText = "Ошибка сети. Заказ не был оформлен.";
                formInputError.classList.remove("hidden");
            } finally {
                form.reset();
                btnSubmit.disabled = false;
            }
        }
    })
}

function validateForm(formData) {
    const data = Object.fromEntries(formData);
    const validatedName = validateName(data.name);
    const validatedAddress = validateAddress(data.address);
    const validatedPhone = validatePhone(data.phone);
    return {
        isValid: [validatedName.isValid, validatedAddress.isValid, validatedPhone.isValid].some((item) => !!item),
        details: {
            name: validatedName,
            address: validatedAddress,
            phone: validatedPhone
        }
    };
}

function isInputEmpty(value) {
    return value.replace(/\s/g, "") === "";
}

function validateName(value) {
    return !isInputEmpty(value) ? { isValid: true } : { isValid: false, message: "Введите имя" };
}

function validateAddress(value) {
    return !isInputEmpty(value) ? { isValid: true } : { isValid: false, message: "Введите адрес" };
}

function validatePhone() {
    const rawPhone = $(".input-phone").inputmask("unmaskedvalue");
    return !isInputEmpty(rawPhone) ? { isValid: true } : { isValid: false, message: "Введите телефон" };
}


class PopUp {
    constructor() {
        this.popup = document.querySelector(".pop-up");
        this.messageBox = this.popup.querySelector(".pop-up__message");
        this.btnClose = this.popup.querySelector(".btn-close");
        this.btnClose.addEventListener("click", () => this.close());
        this.boundedClose = this.close.bind(this);
    }

    open(message) {
        fixWindow(true);
        overlay.style.pointerEvents = "all";
        overlay.addEventListener("click", this.boundedClose);
        overlay?.classList.remove("hidden");
        this.popup.classList.add("active");
        setTimeout(() => {
            this.messageBox.innerHTML = message;
            this.popup.classList.add("animated");
        }, 50);
    }

    close() {
        fixWindow(false);
        overlay.removeEventListener("click", this.boundedClose);
        overlay.style.pointerEvents = "none";
        overlay?.classList.add("hidden");
        this.popup.classList.remove("animated");
        setTimeout(() => {
            this.messageBox.innerHTML = "";
            this.popup.classList.remove("active");
        }, 250);
    }
}

function smoothScroll(e) {
    e.preventDefault();
    let target = "";
    if (e.currentTarget.href) {
        target = e.currentTarget.href.substring(2);
    } else {
        target = e.currentTarget.dataset.anchor ?? "";
    }
    if (!target) { return; }
    const scrollTarget = document.querySelector(target);

    if (scrollTarget === null) return;
    const elementPosition = scrollTarget.getBoundingClientRect().top;

    window.scrollBy({
        top: elementPosition,
        behavior: "smooth",
    });
};

function initSmoothScroll() {
    const elementsWithAnchor = document.querySelectorAll("[data-anchor]");
    elementsWithAnchor.forEach((el) => {
        el.addEventListener("click", (e) => smoothScroll(e))
    });
}