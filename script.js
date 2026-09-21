window.addEventListener("scroll", function () {
  let header = document.querySelector("header");
  if (header) header.classList.toggle("sticky", window.scrollY > 0);

  let toTop = document.querySelector(".to-top");
  if (toTop) toTop.classList.toggle("show", window.scrollY > 560);
});

// One global inventory array powers search results, stock warnings, and the cart.
const inventory = [
  {
    id: 1,
    name: "Field Notes Set",
    category: "Stationery",
    description: "For bright ideas and quiet mornings.",
    price: 18,
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 2,
    name: "Arc Desk Lamp",
    category: "Workspace",
    description: "A warm glow for focused hours.",
    price: 86,
    stock: 3,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 3,
    name: "Daily Carry Tote",
    category: "Accessories",
    description: "Room for the things that matter.",
    price: 42,
    stock: 8,
    image:
      "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 4,
    name: "Stoneware Cup",
    category: "Home",
    description: "Hand-finished, made for daily use.",
    price: 24,
    stock: 2,
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 5,
    name: "Focus Timer",
    category: "Workspace",
    description: "Make space for one good thing.",
    price: 31,
    stock: 10,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: 6,
    name: "Wool Throw",
    category: "Home",
    description: "Soft texture for slower evenings.",
    price: 110,
    stock: 5,
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80",
  },
];

const heroSlides = [
  {
    title: "Useful things,\nbeautifully found.",
    emphasis: "beautifully found.",
    text: "A considered collection for work, rest, and the spaces between.",
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=85",
  },
  {
    title: "Make room\nfor better days.",
    emphasis: "for better days.",
    text: "Objects with a job to do and a point of view to match.",
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1800&q=85",
  },
  {
    title: "Small details.\nBig difference.",
    emphasis: "Big difference.",
    text: "The desk tools, home comforts, and daily carry essentials you reach for.",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1800&q=85",
  },
  {
    title: "A little less\nlooking. More living.",
    emphasis: "More living.",
    text: "We curate the useful so you can get on with the good stuff.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=85",
  },
];

const popup = [
  {
    id: "Stockroom",
    title: "Useful things,\nbeautifully found.",
    emphasis: "beautifully found.",
    text: "A considered collection for work, rest, and the spaces between.",
    image:
      "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1800&q=85",
  },
  {
    id: "ShelfWise",
    title: "Make room\nfor better days.",
    emphasis: "for better days.",
    text: "Objects with a job to do and a point of view to match.",
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1800&q=85",
  },
  {
    id: "Inventory Hub",
    title: "Small details.\nBig difference.",
    emphasis: "Big difference.",
    text: "The desk tools, home comforts, and daily carry essentials you reach for.",
    image:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1800&q=85",
  },
  {
    id: "Find & Cart",
    title: "A little less\nlooking. More living.",
    emphasis: "More living.",
    text: "We curate the useful so you can get on with the good stuff.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1800&q=85",
  },
];

// ----- Cart with localStorage persistence -----
const CART_KEY = "stockroomCart";
const cart = [];

// Restore any previously saved cart when the page loads.
try {
  const savedCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  if (Array.isArray(savedCart)) cart.push(...savedCart);
} catch (error) {
  /* ignore corrupted saved data and start fresh */
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

const $ = (selector) => document.querySelector(selector);
const resultsBox = $("#results-box");
let toastTimer;

function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function renderResults(items = inventory) {
  $("#item-count").textContent =
    `${items.length} item${items.length === 1 ? "" : "s"} in stock`;
  if (!items.length) {
    resultsBox.innerHTML =
      '<p class="no-results">Nothing here yet. Try a different search term.</p>';
    return;
  }
  resultsBox.innerHTML = items
    .map(
      (item) => `
        <article class="product-card">
          <div class="product-top">
            <span class="product-category">${item.category}</span>
            ${item.stock <= 3 ? '<span class="low-stock">Low stock</span>' : ""}
          </div>
          <div class="product-image" aria-hidden="true">
            <img src="${item.image}" alt="${item.name}" />
          </div>
          <h3>${item.name}</h3>
          <p class="product-meta">${item.description}</p>
          <div class="product-bottom">
            <span class="price">$${item.price}</span>
            <button class="add-button" type="button" data-id="${item.id}">Add to cart +</button>
          </div>
        </article>`,
    )
    .join("");
  document
    .querySelectorAll(".add-button")
    .forEach((button) =>
      button.addEventListener("click", () =>
        addToCart(Number(button.dataset.id)),
      ),
    );
}

function addToCart(id) {
  const item = inventory.find((product) => product.id === id);
  if (!item) return;
  if (!cart.some((cartItem) => cartItem.id === id)) cart.push(item);
  renderCart();
  showToast(`${item.name} added to your cart.`);
}

function renderCart() {
  const cartCount = $("#cart-count");
  const cartHeadingCount = $("#cart-heading-count");
  const cartItemsBox = $("#cart-items");
  if (!cartItemsBox) return;

  if (cartCount) cartCount.textContent = cart.length;
  if (cartHeadingCount) cartHeadingCount.textContent = `(${cart.length})`;

  cartItemsBox.innerHTML = cart.length
    ? cart
        .map(
          (item) =>
            `<div class="cart-line">
              <div class="cart-info">
                <img src="${item.image}"/>
                <div>
                  <h3>${item.name}</h3>
                  <p>${item.category} · $${item.price}</p>
                </div>
              </div>
              <button class="remove-button" type="button" data-remove="${item.id}">Remove ×</button>
            </div>`,
        )
        .join("")
    : '<p class="empty-state">Your cart is Empty.</p>';

  document.querySelectorAll("[data-remove]").forEach((button) =>
    button.addEventListener("click", () => {
      const index = cart.findIndex(
        (item) => item.id === Number(button.dataset.remove),
      );
      cart.splice(index, 1);
      renderCart();
    }),
  );

  // Keep the total price in the drawer in sync too.
  const totalPrice = document.querySelector(".total-price");
  if (totalPrice)
    totalPrice.textContent = `$${cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}`;

  // Persist the cart so checkout.html can read it.
  saveCart();
}

function runSearch() {
  const term = $("#search-input").value.trim().toLowerCase();
  const matches = inventory.filter((item) =>
    `${item.name} ${item.category} ${item.description}`
      .toLowerCase()
      .includes(term),
  );
  renderResults(matches);
}

function renderHero() {
  $("#hero-slides").innerHTML = heroSlides
    .map(
      (slide, index) =>
        `<article class="hero-slide ${index === 0 ? "active" : ""}" style="background-image: url('${slide.image}')">
            <div class="hero-copy">
                <p class="eyebrow">Stockroom / 0${index + 1}</p>
                <h1>${slide.title.replace(slide.emphasis, `<em>${slide.emphasis}</em>`).replace("\n", "<br>")}</h1>
                <p>${slide.text}</p>
            </div>
        </article>`,
    )
    .join("");
  $("#hero-dots").innerHTML = heroSlides
    .map(
      (_, index) =>
        `<button type="button" class="${index === 0 ? "active" : ""}" data-slide="${index}" aria-label="Show slide ${index + 1}"></button>`,
    )
    .join("");
  let current = 0;
  const goToSlide = (index) => {
    current = (index + heroSlides.length) % heroSlides.length;
    document
      .querySelectorAll(".hero-slide")
      .forEach((slide, i) => slide.classList.toggle("active", i === current));
    document
      .querySelectorAll(".hero-dots button")
      .forEach((dot, i) => dot.classList.toggle("active", i === current));
  };
  $("#hero-dots").addEventListener("click", (event) => {
    if (event.target.dataset.slide)
      goToSlide(Number(event.target.dataset.slide));
  });
  $(".hero-prev").addEventListener("click", () => goToSlide(current - 1));
  $(".hero-next").addEventListener("click", () => goToSlide(current + 1));
  setInterval(() => goToSlide(current + 1), 6500);
}

function renderAbout() {
  $("#about-content").innerHTML = `<p class="eyebrow">About Stockroom</p>
        <h2>We look for the things that make <em>everyday life</em> feel considered.</h2>
        <p>Stockroom is a tiny independent edit of objects we use, love, and keep close. We believe useful can still be joyful, and that the best finds are the ones that stay with you.</p>`;
}

function validateField(field) {
  const error = $(`#${field.id}-error`);
  let message = "";
  if (field.id === "name" && field.value.trim().length < 2)
    message = "Please enter your full name.";
  if (field.id === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value))
    message = "Please enter a valid email.";
  if (
    field.id === "password" &&
    !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}/.test(field.value)
  )
    message = "Use 8+ chars with upper, lower, number, and symbol.";
  if (field.id === "confirm-password" && field.value !== $("#password").value)
    message = "Passwords must match.";
  error.textContent = message;
  return !message;
}

function setupForm() {
  const form = $("#registration-form");
  ["name", "email", "password", "confirm-password"].forEach((id) => {
    const field = $(`#${id}`);
    field.onkeydown = () => validateField(field);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = ["name", "email", "password", "confirm-password"]
      .map((id) => validateField($(`#${id}`)))
      .every(Boolean);
    if (valid) {
      $("#form-status").textContent =
        "You are on the list. Welcome to Stockroom.";
      form.reset();
    } else
      $("#form-status").textContent = "Please check the highlighted fields.";
  });
}

// Used by the sidebar wheel on index.html (inline onclick="hoverPop(...)").
function hoverPop(section) {
  const selectBox = $("#select");
  if (!selectBox) return;
  selectBox.innerHTML = popup
    .map(
      (pop, index) =>
        `<div class="Popup ${pop.id == section ? "active" : ""}" style="background-image: url('${pop.image}')">
            <div class="pop-copy">
                <p class="eyebrow">Stockroom / 0${index + 1}</p>
                <h1>${pop.title.replace(pop.emphasis, `<em>${pop.emphasis}</em>`).replace("\n", "<br>")}</h1>
                <p>${pop.text}</p>
            </div>
        </div>`,
    )
    .join("");
}

// ----- Page-specific wiring -----
// The shop UI below only exists on index.html, so guard every binding
// (script.js is also loaded by form.html / checkout.html).
if (document.getElementById("search-button")) {
  $("#search-button").addEventListener("click", runSearch);
  $("#search-input").addEventListener("keydown", (event) => {
    if (event.key === "Enter") runSearch();
  });
  $("#clear-search").addEventListener("click", () => {
    $("#search-input").value = "";
    renderResults();
    $("#search-input").focus();
  });
  $("#see-more").addEventListener("click", () => {
    const menu = $("#see-more-menu");
    const shouldShow = menu.hidden;
    menu.hidden = !shouldShow;
    $("#see-more").setAttribute("aria-expanded", shouldShow);
    $("#see-more span").textContent = shouldShow ? "−" : "+";
  });

  document.querySelectorAll(".main-nav a").forEach((link) =>
    link.addEventListener("click", () => {
      document
        .querySelectorAll(".main-nav a")
        .forEach((item) => item.classList.remove("active"));
      link.classList.add("active");
    }),
  );

  renderHero();
  renderResults();
  renderCart();
  renderAbout();

  const cartBtn = document.getElementById("nav-cart");
  const cartBody = document.getElementById("cart");
  const closeCart = document.getElementById("close-cart");

  cartBtn.addEventListener("click", () => {
    cartBody.classList.add("show");
  });

  closeCart.addEventListener("click", () => {
    cartBody.classList.remove("show");
  });

  // Low-stock promo modal
  const buyNow = document.getElementById("buyNow");
  const lowStockItems = inventory.filter((item) => item.stock <= 3);
  const promoItem = lowStockItems[lowStockItems.length - 1]; // last low-stock item wins

  if (promoItem) {
    buyNow.classList.add("show");
    buyNow.innerHTML = `
      <div class="buy-now-container">
        <button class="close-modal-btn" id="closeModal">&times;</button>
        <div class="buy-now-image">
          <img src="${promoItem.image}" alt="${promoItem.name}">
        </div>
        <div class="buy-now-content">
          <div>
            <h3 class="buy-title">limited <em>stock</em></h3>
            <p class="category">${promoItem.category}</p>
            <h2 class="item-name">${promoItem.name}</h2>
            <p class="buy-price">$${promoItem.price}.00</p>
          </div>
          <div class="buy-now-buttons">
            <button type="button" id="promo-add-cart">Add to Cart</button>
            <button type="button" id="buy-now-btn">Buy Now</button>
          </div>
        </div>
      </div>
    `;

    document
      .getElementById("promo-add-cart")
      .addEventListener("click", () => addToCart(promoItem.id));
    document
      .getElementById("buy-now-btn")
      .addEventListener(
        "click",
        () => (window.location.href = "checkout.html"),
      );
  }

  // Close modal when the backdrop or the close button is clicked
  buyNow.addEventListener("click", (e) => {
    if (e.target === buyNow || e.target.id === "closeModal") {
      buyNow.classList.remove("show");
    }
  });
}

// The registration form lives on index.html (drawer) and form.html (page).
if (document.getElementById("registration-form")) setupForm();

function swipe(a) {
  const allForm = document.querySelectorAll(".form-body form");
  const formBody = document.querySelector(".form-body");
  const selectedForm = document.querySelector(`.${a}`);

  allForm.forEach(form => {
    form.classList.remove('active');
  });

  if (a == "register-form") {
    formBody.classList.add("active");
    selectedForm.classList.add("active");
  } else {
    formBody.classList.remove("active");
    selectedForm.classList.remove("active");
  }
}