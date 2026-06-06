// Variabili globali
let cart = [];
let cartCount = 0;
document.addEventListener("DOMContentLoaded", function () {

    // Sostituisci la parte del DOMContentLoaded che gestisce il menu con questa:
    const menuToggle = document.getElementById("menuToggle");
    const navbar = document.getElementById("navbar");

    menuToggle.addEventListener("click", function () {
        navbar.classList.toggle("active");
        menuToggle.classList.toggle("active"); // Aggiunge la rotazione al bottone
        
        // Cambia icona da bar a times (X)
        const icon = menuToggle.querySelector('i');
        if (navbar.classList.contains('active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

});


// Inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    console.log('Documento caricato, inizializzo il carrello...');
    initCart();
    setupAddToCartButtons();
    setupCheckoutForm();

    // Inizializza la barra di ricerca della nazione se presente nella pagina
    if (document.getElementById('nationSearch')) {
        setupNationSearch();
    }
    // Inizializza i dropdown solo se esistono nella pagina
    if (document.getElementById('league')) {
        console.log('Trovato elemento league, inizializzo dropdown...');
        initDropdowns();
        setupEventListeners();
    }
    document.querySelectorAll('input[name^="size"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                // Deseleziona tutte le altre checkbox
                document.querySelectorAll('input[name="size"]').forEach(otherCheckbox => {
                    if (otherCheckbox !== this) {
                        otherCheckbox.checked = false;
                    }
                });
            }
        });
    });
});

// Inizializza il carrello dal localStorage
function initCart() {
    const savedCart = localStorage.getItem('footballShirtsCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        cartCount = cart.reduce((total, item) => total + item.quantity, 0);
        updateCartUI();
    }
    console.log('Carrello inizializzato:', cart);
}

// Configura i pulsanti "Aggiungi al carrello" - SOLUZIONE DEFINITIVA
function setupAddToCartButtons() {
    console.log('Configuro i pulsanti aggiungi al carrello...');

    // Rimuovi eventuali listener precedenti
    $(document).off('click', '.shop');

    // Delegazione eventi per tutti i pulsanti .shop
    $(document).on('click', '.shop', function(e) {
        console.log('Pulsante cliccato!', e.target);
        e.preventDefault();
        e.stopPropagation();

        const productElement = $(this).closest('.product');
        const productName = productElement.find('h3').text();
        const productPrice = productElement.find('p').text();
        const productImg = productElement.find('img').attr('src');

        console.log('Prodotto trovato:', productName, productPrice);

        addToCart({
            id: generateProductId(productName),
            name: productName,
            price: parsePrice(productPrice),
            img: productImg,
            quantity: 1
        });
    });
}

// Configura il form di checkout
function setupCheckoutForm() {
    const checkoutForm = document.querySelector('.checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Simula un checkout riuscito
            alert('Grazie per il tuo ordine! Il pagamento è stato elaborato con successo.');

            // Svuota il carrello
            cart = [];
            cartCount = 0;
            localStorage.removeItem('footballShirtsCart');
            updateCartUI();

            // Chiudi il modal
            closeCheckoutModal();
        });
    }
}

// Genera un ID unico per il prodotto
function generateProductId(name) {
    return name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
}

// Converte il prezzo da stringa a numero
function parsePrice(priceString) {
    return parseFloat(priceString.replace('€', '').replace(',', '.').trim());
}

// Aggiungi prodotto al carrello
function addToCart(product) {
    console.log('Aggiungo al carrello:', product);

    // Cerca se esiste già un prodotto con lo stesso nome
    const existingItemIndex = cart.findIndex(item => 
        item.name === product.name && item.price === product.price
    );

    if (existingItemIndex !== -1) {
        // Prodotto già nel carrello, aumenta la quantità
        cart[existingItemIndex].quantity += 1;
    } else {
        // Nuovo prodotto, aggiungi al carrello
        cart.push(product);
    }

    cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Salva nel localStorage
    localStorage.setItem('footballShirtsCart', JSON.stringify(cart));

    // Aggiorna l'UI
    updateCartUI();

    // Mostra la selezione taglie
    document.getElementById('sizeSelection').style.display = 'block';

    // Mostra notifica
    showCartNotification(product.name);
}

// Rimuovi prodotto dal carrello
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Salva nel localStorage
    localStorage.setItem('footballShirtsCart', JSON.stringify(cart));

    // Aggiorna l'UI
    updateCartUI();

    // Nascondi la selezione taglie se il carrello è vuoto
    if (cart.length === 0) {
        document.getElementById('sizeSelection').style.display = 'none';
    }
}

// Aggiorna la quantità di un prodotto nel carrello
function updateQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity += change;

        // Se la quantità è 0, rimuovi il prodotto
        if (cart[itemIndex].quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        cartCount = cart.reduce((total, item) => total + item.quantity, 0);

        // Salva nel localStorage
        localStorage.setItem('footballShirtsCart', JSON.stringify(cart));

        // Aggiorna l'UI
        updateCartUI();
    }
}

// Aggiorna l'interfaccia del carrello
function updateCartUI() {
    console.log('Aggiorno UI del carrello, conteggio:', cartCount);

    // Aggiorna il contatore del carrello
    const cartCountElement = document.querySelector('.cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }

    // Aggiorna gli articoli nel carrello
    const cartItemsElement = document.getElementById('cartItems');
    if (cartItemsElement) {
        if (cart.length === 0) {
            cartItemsElement.innerHTML = `
                <div class="cart-empty">
                    <div class="empty-cart-icon">🛒</div>
                    <p>Il tuo carrello è vuoto</p>
                    <button class="btn btn-primary" onclick="toggleCart()">Continua gli acquisti</button>
                </div>
            `;
        } else {
            cartItemsElement.innerHTML = cart.map(item => {
                // Controlla se è una maglia retro
                const isRetro = item.name.toLowerCase().includes('retro');

                return `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-image" onerror="this.src='https://via.placeholder.com/100x120'">
                    <div class="cart-item-details">
                        <div class="cart-item-name">${item.name}</div>
                        <div class="cart-item-price">${formatPrice(item.price)}</div>
                        <div class="cart-item-actions">
                            <button class="quantity-btn" onclick="updateQuantity('${item.id}', -1)">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity('${item.id}', 1)">+</button>
                            <button class="remove-btn" onclick="removeFromCart('${item.id}')">×</button>
                        </div>

                        ${item.isMainProduct ? `
                        <div class="related-products">
                            <div class="related-header">
                                <span class="related-title">${isRetro ? 'Accessori per maglie retro' : 'Aggiungi accessori'}</span>
                                <span class="toggle-icon"><i class="fas fa-chevron-down"></i></span>
                            </div>
                            <div class="related-items expanded">
                                <div class="related-item">
                                    <span class="related-item-name">Taglie:</span>
                                    <div class="size-options">
                                        <div class="size-checkbox">
                                            <input type="radio" name="size-${item.id}" id="size-s-${item.id}" value="S">
                                            <label for="size-s-${item.id}" class="checkmark">S</label>
                                        </div>
                                        <div class="size-checkbox">
                                            <input type="radio" name="size-${item.id}" id="size-m-${item.id}" value="M">
                                            <label for="size-m-${item.id}" class="checkmark">M</label>
                                        </div>
                                        <div class="size-checkbox">
                                            <input type="radio" name="size-${item.id}" id="size-l-${item.id}" value="L">
                                            <label for="size-l-${item.id}" class="checkmark">L</label>
                                        </div>
                                        <div class="size-checkbox">
                                            <input type="radio" name="size-${item.id}" id="size-xl-${item.id}" value="XL">
                                            <label for="size-xl-${item.id}" class="checkmark">XL</label>
                                        </div>
                                    </div>
                                </div>

                                <div class="related-item ${isRetro ? 'disabled' : ''}">
                                    <span class="related-item-name">Calzini abbinati</span>
                                    <span class="related-item-price">+€3.00</span>
                                    <input type="checkbox" class="related-checkbox" id="socks-${item.id}" ${isRetro ? 'disabled' : ''}>
                                    <label for="socks-${item.id}"></label>
                                </div>

                                <div class="related-item ${isRetro ? 'disabled' : ''}">
                                    <span class="related-item-name">Pantaloncino</span>
                                    <span class="related-item-price">+€3.00</span>
                                    <input type="checkbox" class="related-checkbox" id="shorts-${item.id}" ${isRetro ? 'disabled' : ''}>
                                    <label for="shorts-${item.id}"></label>
                                </div>

                               <div class="related-item custom-jersey-section">
                                    <div class="custom-jersey-header-row">
                                        <span class="related-item-name">Maglia personalizzata</span>
                                        <span class="related-item-price">+€5.00</span>
                                        <input type="checkbox" class="related-checkbox custom-jersey-checkbox" id="custom-${item.id}">
                                        <label for="custom-${item.id}"></label>
                                    </div>
                                    
                                    <div class="custom-inputs-container">
                                        <input type="text" placeholder="Scrivi il N° e nome" class="custom-name">
                                    </div>
                                </div>

                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                `;
            }).join('');
        }
    }

    // Aggiorna i totali
    updateCartTotals();
}

function setupRelatedProducts() {
    // Gestione dell'apertura/chiusura della tendina degli accessori
    $(document).off('click', '.related-header').on('click', '.related-header', function(e) {
        toggleRelatedProducts(this);
    });

    // Gestione del cambio di stato (spunta) delle checkbox
    $(document).off('change', '.related-checkbox').on('change', '.related-checkbox', function(e) {
        const isChecked = $(this).is(':checked');
        const relatedItem = $(this).closest('.related-item');

        // Applica o rimuove lo sfondo verde a tutto il quadrato
        if (isChecked) {
            relatedItem.addClass('checked');
        } else {
            relatedItem.removeClass('checked');
        }

        // Gestione mostra/nascondi con animazione per l'input unico
        if ($(this).hasClass('custom-jersey-checkbox')) {
            const inputsContainer = relatedItem.find('.custom-inputs-container');
            if (isChecked) {
                inputsContainer.css('display', 'block').hide().slideDown(200);
            } else {
                inputsContainer.slideUp(200, function() {
                    $(this).find('input').val(''); // Svuota il testo se togli la spunta
                });
            }
        }

        // Aggiorna istantaneamente il prezzo totale del carrello
        updateCartTotals();
    });
}

// Aggiorna i totali del carrello
function updateCartTotals() {
    let subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Aggiungi il costo degli accessori selezionati (solo quelli non disabilitati)
    document.querySelectorAll('.related-checkbox:checked').forEach(checkbox => {
        if (!checkbox.disabled) {
            const priceText = checkbox.closest('.related-item').querySelector('.related-item-price').textContent;
            const price = parseFloat(priceText.replace('+€', ''));
            subtotal += price;
        }
    });

    const cartSubtotalElement = document.getElementById('cartSubtotal');
    const cartTotalElement = document.getElementById('cartTotal');
    const checkoutSubtotalElement = document.getElementById('checkoutSubtotal');
    const checkoutTotalElement = document.getElementById('checkoutTotal');

    if (cartSubtotalElement) cartSubtotalElement.textContent = formatPrice(subtotal);
    if (cartTotalElement) cartTotalElement.textContent = formatPrice(subtotal);
    if (checkoutSubtotalElement) checkoutSubtotalElement.textContent = formatPrice(subtotal);
    if (checkoutTotalElement) checkoutTotalElement.textContent = formatPrice(subtotal);

    // Abilita o disabilita il pulsante di checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.length === 0;
    }
}

// Formatta il prezzo
function formatPrice(price) {
    return `€${price.toFixed(2)}`;
}

// Mostra notifica di prodotto aggiunto
function showCartNotification(productName) {
    // Crea elemento di notifica
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-check-circle"></i>
            <span>${productName} aggiunto al carrello!</span>
        </div>
    `;

    // Stile della notifica
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        opacity: 0;
        transform: translateY(-20px);
        transition: opacity 0.3s, transform 0.3s;
    `;

    document.body.appendChild(notification);

    // Animazione di entrata
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);

    // Rimuovi dopo 3 secondi
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 100);
    }, 1000);
}

// Apri/chiudi carrello
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');

    cartSidebar.classList.toggle('active');
    cartOverlay.classList.toggle('active');

    // Previeni lo scrolling del body quando il carrello è aperto
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
}

// Procedi al checkout
function proceedToCheckout() {
    if (cart.length === 0) return;

    // Verifica che OGNI prodotto nel carrello abbia una taglia selezionata
    const missingSizes = [];

    cart.forEach((item, index) => {
        if (item.isMainProduct) {
            const selectedSize = document.querySelector(`input[name="size-${item.id}"]:checked`);
            if (!selectedSize) {
                missingSizes.push({
                    productName: item.name,
                    itemIndex: index + 1
                });
            }
        }
    });

    // Se ci sono prodotti senza taglia selezionata, mostra un alert dettagliato
    if (missingSizes.length > 0) {
        if (missingSizes.length === 1) {
            alert(`Per favore, seleziona una taglia per: ${missingSizes[0].productName}`);
        } else {
            const productList = missingSizes.map(item => `• ${item.productName}`).join('\n');
            alert(`Per favore, seleziona una taglia per i seguenti prodotti:\n\n${productList}`);
        }
        return;
    }

    // Se tutte le taglie sono selezionate, procedi con il checkout
    const selectedSizes = [];
    cart.forEach(item => {
        if (item.isMainProduct) {
            const selectedSize = document.querySelector(`input[name="size-${item.id}"]:checked`);
            if (selectedSize) {
                selectedSizes.push({
                    productName: item.name,
                    size: selectedSize.value
                });
            }
        }
    });

    // Mostra il modal di checkout se esiste, altrimenti mostra un alert
    const checkoutModal = document.getElementById('checkoutModal');
    if (checkoutModal) {
        checkoutModal.classList.add('active');
    } else {
        // Se il modal non esiste, mostra un alert con tutti i dettagli
        const sizeDetails = selectedSizes.map(item => `• ${item.productName} (Taglia: ${item.size})`).join('\n');
        const hasRetroItems = cart.some(item => item.name.toLowerCase().includes('retro'));
        const retroMessage = hasRetroItems ? '\n\nNota: Per le maglie retro sono disponibili solo le taglie' : '';

        alert(`Grazie per il tuo ordine!\n\nDettagli ordine:\n${sizeDetails}${retroMessage}\n\nIl pagamento è stato elaborato con successo.`);

        // Svuota il carrello
        cart = [];
        cartCount = 0;
        localStorage.removeItem('footballShirtsCart');
        updateCartUI();

        // Chiudi il carrello
        toggleCart();
    }
}

// Chiudi il modal de checkout
function closeCheckoutModal() {
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.classList.remove('active');
}

// Ricerca nazioni - homepage Mondiale 2026
function setupNationSearch() {
    const input = document.getElementById('nationSearch');
    const products = document.querySelectorAll('.grid .product');

    // Aggiungi transizione fluida a ogni card
    products.forEach(function(product) {
        product.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    });

    input.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();

        products.forEach(function(product) {
            const name = product.querySelector('h3').textContent.toLowerCase();
            if (query === '' || name.includes(query)) {
                product.style.display = '';
                product.style.opacity = '1';
                product.style.transform = 'scale(1)';
            } else {
                product.style.opacity = '0';
                product.style.transform = 'scale(0.95)';
                // Nasconde dopo la transizione CSS
                setTimeout(function() {
                    if (!product.querySelector('h3').textContent.toLowerCase().includes(
                        document.getElementById('nationSearch').value.trim().toLowerCase()
                    )) {
                        product.style.display = 'none';
                    }
                }, 200);
            }
        });
    });
}

// Funzioni per il catalogo (se presenti)
function initDropdowns() {
    if (!document.getElementById('league')) return;

    // Campionati
    $('#league').select2({
        placeholder: "Seleziona un campionato",
        templateResult: formatLeagueOption,
        templateSelection: formatLeagueOption
    });

    // Squadre
    $('#team').select2({
        placeholder: "Seleziona una squadra",
        templateResult: formatTeamOption,
        templateSelection: formatTeamOption
    }).prop('disabled', true);

    // Tipo maglia
    $('#type').select2({
        placeholder: "Seleziona un tipo"
    }).prop('disabled', true);
}

function formatLeagueOption(league) {
    if (!league.id) return league.text;
    return $(`
        <div class="league-option">
            <img src="${logos.leagues[league.id]}" class="league-logo" onerror="this.style.display='none'"/>
            <span>${league.text}</span>
        </div>
    `);
}

function formatTeamOption(team) {
    if (!team.id) return team.text;

    const league = $('#league').val();
    const logoUrl = logos.teams[league]?.[team.id] || '';
    const teamName = team.text.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    return $(`
        <div class="team-option">
            ${logoUrl ? `<img src="${logoUrl}" class="team-logo" onerror="this.style.display='none'"/>` : ''}
            <span>${teamName}</span>
        </div>
    `);
}

function setupEventListeners() {
    if (!document.getElementById('league')) return;

    // Cambio campionato
    $('#league').on('change', function() {
        const $team = $('#team');
        $team.val(null).trigger('change').prop('disabled', !this.value);
        $('#type').val(null).trigger('change').prop('disabled', true);

        if (this.value) {
            $team.empty().append('<option value=""></option>');

            Object.keys(products[this.value]).forEach(teamId => {
                const teamName = teamId.split('-')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');
                $team.append(new Option(teamName, teamId));
            });
        }
    });

    // Cambio squadra
    $('#team').on('change', function() {
    const $type = $('#type');
    $type.val(null).trigger('change').prop('disabled', !this.value);

        if (this.value) {
            $type.empty().append('<option value=""></option>');
            const league = $('#league').val();
            const types = Object.keys(products[league][this.value]);

            // Mappa per evitare duplicati - SOSTITUISCI retro CON badge
            const typeMap = {
                home: 'Maglia Casa',
                away: 'Maglia Trasferta',
                third: 'Maglia Terza',
                fourth: 'Maglia Quarta',
                gk: 'Maglia Portiere',
                badge: 'Maglia retro'  
            };

            // Aggiungi solo opzioni uniche
            const addedTypes = new Set();

            types.forEach(type => {
                if (type.includes('home') && !addedTypes.has('home')) {
                    $type.append(new Option(typeMap.home, 'home'));
                    addedTypes.add('home');
                } 
                else if (type.includes('away') && !addedTypes.has('away')) {
                    $type.append(new Option(typeMap.away, 'away'));
                    addedTypes.add('away');
                }
                else if (type.includes('third') && !addedTypes.has('third')) {
                    $type.append(new Option(typeMap.third, 'third'));
                    addedTypes.add('third');
                }
                else if (type.includes('fourth') && !addedTypes.has('fourth')) {
                    $type.append(new Option(typeMap.fourth, 'fourth'));
                    addedTypes.add('fourth');
                }
                else if (type.includes('gk') && !addedTypes.has('gk')) {
                    $type.append(new Option(typeMap.gk, 'gk'));
                    addedTypes.add('gk');
                }
                else if (type.includes('badge') && !addedTypes.has('badge')) {
                    $type.append(new Option(typeMap.badge, 'badge'));  // Sostituisce retro
                    addedTypes.add('badge');
                }
            });
        }   
    });

    // Cambio tipo maglia
    $('#type').on('change', showProducts);
}

function createProductCard(product) {
    const imgUrl = product.img || 'https://via.placeholder.com/300x400';

    return `
        <div class="product">
            <img src="${imgUrl}" 
                 alt="${product.name}"
                 onerror="this.src='https://via.placeholder.com/300x400'">
            <h3>${product.name}</h3>
            <p>${product.price}</p>
            <button class="shop">Aggiungi al carrello</button>
        </div>
    `;
}

function showProducts() {
    const league = $('#league').val();
    const team = $('#team').val();
    const type = $('#type').val();
    const $grid = $('.grid').empty();

    if (!league || !team || !type) {
        showEmptyState();
        return;
    }

    try {
        if (type === 'badge') {
            // Filtra tutte le maglie retro scudetti
            const retroProducts = Object.entries(products[league][team])
                .filter(([key]) => key.includes('badge'))
                .map(([, product]) => product);

            if (retroProducts.length > 0) {
                retroProducts.forEach(product => {
                    $grid.append(createProductCard(product));
                });
            } else {
                showNoProductsMessage();
            }
        } else if (type === 'gk') {
            // Filtra tutte le maglie portieri
            const gkProducts = Object.entries(products[league][team])
                .filter(([key]) => key.includes('gk') || key.includes('portiere'))
                .map(([, product]) => product);

            if (gkProducts.length > 0) {
                gkProducts.forEach(product => {
                    $grid.append(createProductCard(product));
                });
            } else {
                showNoProductsMessage();
            }
        } else if (type === 'third') {
            // Filtra tutte le maglie terze
            const thirdProducts = Object.entries(products[league][team])
                .filter(([key]) => key.includes('third'))
                .map(([, product]) => product);

            if (thirdProducts.length > 0) {
                thirdProducts.forEach(product => {
                    $grid.append(createProductCard(product));
                });
            } else {
                showNoProductsMessage();
            }
        } else if (type === 'fourth') {
            // Filtra tutte le maglie quarte
            const fourthProducts = Object.entries(products[league][team])
                .filter(([key]) => key.includes('fourth'))
                .map(([, product]) => product);

            if (fourthProducts.length > 0) {
                fourthProducts.forEach(product => {
                    $grid.append(createProductCard(product));
                });
            } else {
                showNoProductsMessage();
            }
        } else {
            // Cerca la maglia specifica per casa, trasferta, terza, quarta
            const productKey = Object.keys(products[league][team]).find(key => 
                (type === 'home' && key.includes('home')) ||
                (type === 'away' && key.includes('away')) ||
                (type === 'third' && key.includes('third')) ||
                (type === 'fourth' && key.includes('fourth'))
            );

            if (productKey) {
                const product = products[league][team][productKey];
                $grid.append(createProductCard(product));
            } else {
                showNoProductsMessage();
            }
        }
    } catch (error) {
        console.error("Errore:", error);
        showErrorState();
    }
}

function showEmptyState() {
    $('.grid').html(`
        <div class="message">
            <i class="fas fa-search"></i>
            <p>Seleziona un campionato, squadra e tipo</p>
        </div>
    `);
}

function showNoProductsMessage() {
    $('.grid').html(`
        <div class="message">
            <i class="fas fa-times-circle"></i>
            <p>Nessuna maglia disponibile</p>
        </div>
    `);
}

function showErrorState() {
    $('.grid').html(`
        <div class="message error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>Errore nel caricamento</p>
        </div>
    `);
}

// Funzione per mostrare/nascondere i prodotti correlati
function toggleRelatedProducts(element) {
    const relatedProducts = $(element).closest('.related-products');

    // Se è disabilitato, non fare nulla
    if (relatedProducts.hasClass('disabled')) {
        return;
    }

    const relatedItems = relatedProducts.find('.related-items');
    const toggleIcon = $(element).find('.toggle-icon');

    // Alterna la classe expanded
    relatedItems.toggleClass('expanded');

    // Ruota l'icona
    toggleIcon.toggleClass('up');
}




// Modifica la funzione addToCart per assicurarti che ogni prodotto abbia isMainProduct
function addToCart(product) {
    console.log('Aggiungo al carrello:', product);

    // Cerca se esiste già un prodotto con lo stesso nome
    const existingItemIndex = cart.findIndex(item => 
        item.name === product.name && item.price === product.price
    );

    if (existingItemIndex !== -1) {
        // Prodotto già nel carrello, aumenta la quantità
        cart[existingItemIndex].quantity += 1;
    } else {
        // Nuovo prodotto, aggiungi al carrello
        cart.push({
            ...product,
            isMainProduct: true  // Assicurati che ogni prodotto principale abbia questa proprietà
        });
    }

    cartCount = cart.reduce((total, item) => total + item.quantity, 0);

    // Salva nel localStorage
    localStorage.setItem('footballShirtsCart', JSON.stringify(cart));

    // Aggiorna l'UI
    updateCartUI();

    // Mostra notifica
    if (!product.isRelated) {
        showCartNotification(product.name);
    }
}

// Modifica la funzione setupAddToCartButtons
function setupAddToCartButtons() {
    console.log('Configuro i pulsanti aggiungi al carrello...');

    // Rimuovi eventuali listener precedenti
    $(document).off('click', '.shop');

    // Delegazione eventi per tutti i pulsanti .shop
    $(document).on('click', '.shop', function(e) {
        console.log('Pulsante cliccato!', e.target);
        e.preventDefault();
        e.stopPropagation();

        const productElement = $(this).closest('.product');
        const productName = productElement.find('h3').text();
        const productPrice = productElement.find('p').text();
        const productImg = productElement.find('img').attr('src');

        console.log('Prodotto trovato:', productName, productPrice);

        addToCart({
            id: generateProductId(productName),
            name: productName,
            price: parsePrice(productPrice),
            img: productImg,
            quantity: 1,
            isMainProduct: true  // IMPORTANTE: marca come prodotto principale
        });
    });
}

// Aggiungi la chiamata a setupRelatedProducts nell'inizializzazione
document.addEventListener('DOMContentLoaded', function() {
    console.log('Documento caricato, inizializzo il carrello...');
    initCart();
    setupAddToCartButtons();
    setupCheckoutForm();
    setupRelatedProducts(); // <-- Aggiungi questa linea

    // Inizializza i dropdown solo se esistoni nella pagina
    if (document.getElementById('league')) {
        console.log('Trovato elemento league, inizializzo dropdown...');
        initDropdowns();
        setupEventListeners();
    }
});

// Definiamo un database interno per le maglie delle nazioni (Mondiale 2026)
    const nazioniProducts = [
        { name: "Spagna 2026", price: "€30.00", img: "https://store.fifa.com/cdn/shop/files/JZ5757_1_APPAREL_Photography_FrontCenterView_white.jpg?v=1774372369&width=493" },
        { name: "Germania 2026", price: "€30.00", img: "https://store.fifa.com/cdn/shop/files/KD8363_1_APPAREL_Photography_FrontCenterView_white.jpg?v=1774372475&width=493" },
        { name: "Usa 2026", price: "€30.00", img: "https://store.fifa.com/cdn/shop/files/image_761374ad-2a69-46d2-a956-8b5518aa5365.jpg?v=1775564053&width=493" },
        { name: "Francia 2026", price: "€30.00", img: "https://store.fifa.com/cdn/shop/files/image_d7ea4023-4947-435c-80b4-3d65b0200c41.jpg?v=1775564047&width=493" },
        { name: "Argentina 2026", price: "€30.00", img: "https://store.fifa.com/cdn/shop/files/image_18cabf03-60ed-4291-95ed-52f43da86a62.png?v=1774372557&width=493" },
        { name: "Brasile 2026", price: "€30.00", img: "https://store.fifa.com/cdn/shop/files/image_02047e33-3b4e-41f2-869b-ac361dd4b283.jpg?v=1775563958&width=493" },
        { name: "Inghilterra 2026", price: "€30.00", img: "https://store.fifa.com/cdn/shop/files/image_b41e1b9d-c35a-41f0-ab8a-600d81aac26e.jpg?v=1775563951&width=493" },
        { name: "Portogallo 2026", price: "€30.00", img: "https://store.fifa.com/cdn/shop/files/image_0c8a09d2-f012-494a-acd8-524248c421bd.jpg?v=1774372657&width=493" }
    ];
//Dati delle maglie
const products = {
    "serie-a": {
        "roma": {
            "home-25": { name: "AS Roma Casa 25/26", price: "€30.00", img: "https://store.asroma.com/cdn/shop/files/JP4185-front-wizzair-eurobet.jpg?v=1773160545&width=1200" },
            "away-25": { name: "AS Roma Trasferta 25/26", price: "€30.00", img: "https://store.asroma.com/cdn/shop/files/JP4801-front-wizzair-eurobet.jpg?v=1773161760&width=1200" },
            "third-25": { name: "AS Roma Terza 25/26", price: "€30.00", img: "https://store.asroma.com/cdn/shop/files/JP4804-header-menu-front-wizzair-eurobet.jpg?v=1773164013&width=130" },
            "gk-25": { name: "AS Roma Portiere 25/26", price: "€30.00", img: "https://store.asroma.com/cdn/shop/files/99-SVILAR_3.jpg?v=1778596175&width=2000" },
            "badge-1982/1983": { "name": "AS Roma Retro 1982/1983", "price": "€15.00", "img": "https://www.asromashirt.it/images/1980_1990/conti.jpg" },
            "badge-2001/2002":{"name": "AS Roma Retro 2001/2002", "price":"€15.00", "img":"https://cdn.charitystars.com/data/products/83560/1-pend-FaOJirlXoAAsaEf.jpg"}
        },
        "atalanta": {
            "home-25": { name: "Atalanta Casa 25/26", price: "€30.00", img: "https://store.atalanta.it/images/atalanta/products/small/AT25A01.webp" },
            "away-25": { name: "Atalanta Trasferta 25/26", price: "€30.00", img: "https://store.atalanta.it/images/atalanta/products/small/AT25A02.webp" },
            "third-25": { name: "Atalanta Terza 25/26", price: "€30.00", img: "https://store.atalanta.it/images/atalanta/products/small/AT25A03.webp" },
            "gk-25": { name: "Atalanta Portiere 25/26", price: "€30.00", img: "https://store.atalanta.it/images/atalanta/products/small/AT25A05.webp" },
            "gk-2": { name: "Atalanta Portiere 25/26", price: "€30.00", img: "https://store.atalanta.it/images/atalanta/products/small/AT25A06.webp" },
            "gk-3": { name: "Atalanta Portiere 25/26", price: "€30.00", img: "https://store.atalanta.it/images/atalanta/products/small/AT25A07.webp" }
        },
        "bologna": {
            "home-25": { name: "Bologna Casa 25/26", price: "€30.00", img: "https://www.bolognafcstore.com/images/bologna/products/small/BO25A01.webp" },
            "away-25": { name: "Bologna Trasferta 25/26", price: "€30.00", img: "https://www.bolognafcstore.com/images/bologna/products/small/BO25A02.webp" },
            "gk-25": { name: "Bologna Portiere 25/26", price: "€30.00", img: "https://www.bolognafcstore.com/images/bologna/products/small/BO25A04.webp" }
        },
        "cagliari": {
            "home-25": { name: "Cagliari Casa 25/26", price: "€30.00", img: "https://provehitoshop.com/cdn/shop/files/e788ad4e_1.jpg?v=1737037359" },
            "away-25": { name: "Cagliari Trasferta 25/26", price: "€30.00", img: "https://www.eyesportshop.com/11744-large_default/away-jersey-cagliari-calcio-2022-2023.jpg" },
            "third-25": { name: "Cagliari Terza 25/26", price: "€30.00", img: "https://store.cagliaricalcio.com/wp-content/uploads/2025/05/Breathe-thirdkit_25-26_front.webp" }
        },
        "fiorentina": {
            "home-25": { name: "Fiorentina Casa 25/26", price: "€30.00", img: "https://www.fiorentinastore.com/images/fiorentina/products/small/FI25A01.webp" },
            "away-25": { name: "Fiorentina Trasferta 25/26", price: "€30.00", img: "https://www.fiorentinastore.com/images/fiorentina/products/small/FI25A02.webp" },
            "third-25": { name: "Fiorentina Terza 25/26", price: "€30.00", img: "https://www.fiorentinastore.com/images/fiorentina/products/small/FI25A03.webp" },
            "gk-25": { name: "Fiorentina Portiere 25/26", price: "€30.00", img:"https://www.fiorentinastore.com/images/fiorentina/products/small/FI25A04.webp"},
            "gk-2": { name: "Fiorentina Portiere 25/26", price: "€30.00", img:"https://www.fiorentinastore.com/images/fiorentina/products/small/FI25A05.webp"},
            "gk-3": { name: "Fiorentina Portiere 25/26", price: "€30.00", img:"https://www.fiorentinastore.com/images/fiorentina/products/small/FI25A06.webp"},

        },
        "genoa": {
            "home-25": { name: "Genoa Casa 25/26", price: "€30.00", img: "https://genoacfc.it/wp-content/uploads/2025/09/1200x1200_genoa_home.png" },
            "away-25": { name: "Genoa Trasferta 25/26", price: "€30.00", img: "https://genoacfc.it/wp-content/uploads/2025/09/1200x1200_genoa_away.png" },
            "third-25": { name: "Genoa Terza 25/26", price: "€30.00", img:"https://genoacfc.it/wp-content/uploads/2025/09/1200x1200_third_prokombat_1.png"},
            "gk-25": { name: "Genoa Portiere 25/26", price: "€30.00", img:"https://genoacfc.it/wp-content/uploads/2025/07/1200x1200_gk_maglia_gialla_pulsee.png"},
            "gk-2": { name: "Genoa Portiere 25/26", price: "€30.00", img:"https://genoacfc.it/wp-content/uploads/2025/07/1200x1200_panta_gk_azzurro_pulsee-1.png"},
        },
        "verona": {
            "home-25": { name: "Hellas Verona Casa 25/26", price: "€30.00", img: "https://www.hvstore.it/wp-content/uploads/2025/07/adattamenti-ecommerce3.png" },
            "away-25": { name: "Hellas Verona Trasferta 25/26", price: "€30.00", img: "https://www.hvstore.it/wp-content/uploads/2025/07/adattamenti-ecommerce.png" },
            "third-25": { name: "Hellas Verona Terza 25/26", price: "€30.00", img:"https://www.hvstore.it/wp-content/uploads/2025/09/9.png"},
            "gk-25": { name: "Hellas Verona Portiere 25/26", price: "€30.00", img:"https://www.hvstore.it/wp-content/uploads/2025/08/adattamenti-ecommerce5.png"}
        },
        "inter": {
            "home-26": { name: "Inter Casa 26/27", price: "€30.00", img: "https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcT6CN56g0nMfkmhxRva38mHwKzC3Z-j9ovwJ8I8hN72O8oX_AB22-MB-LMz_G29voJDS7T6gvjorttb-VfPOUaAkQHAhM4N20G8lvQs9Fzl9-g-jMgntIHcBYRZ_MsX03WSZxv63tCVaw&usqp=CAc" },
            "away-26": { name: "Inter Trasferta 26/27", price: "€30.00", img: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgwje_LeF7cbC9ZStGwfafd9ngtpr4GHkYLxnaZtZSTNhLeYPp8FbLttqn2AizSGLCEzoSKyRsIFyiMgWmMRLd7wMasZ05zWl9p5eodR-6qfKXZJq9NnYuIBEmwhaXdElPLMpsMCNLE4yIl7DVtWs4vFPJUM_9XgNhCioVb6pinqhFUtO51FKzVu6zK4Bc_/s1600/filtrata-la-seconda-maglia-dell-x27-inter-26-27-ispirata-al-baseball.jpg" },
            "third-25": { name: "Inter Terza 25/26", price: "€30.00", img:"https://store.inter.it/images/inter/products/small/IN25A03.webp"},
            "gk-25": { name: "Inter Portiere 25/26", price: "€30.00", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4PoxboMAA_rmNG_Iqhhvvjn8MZjwR3djtwg&s" },
        },
        "juventus": {
            "home-26": { name: "Juventus Casa 26/27", price: "€30.00", img: "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTsa9Mfg4jQ3N6qgquzoct0mvt7W_Wafl1j1cufogqiQSFskvQx5KlGwvTVSTosR78aQYAGi557tPUEDo-AvF7a8CngG8or_6pQzh3pQny9aaPWsjkClc7Rn8KY2eGn0gpyBb3QAUM&usqp=CAc" },
            "away-25": { name: "Juventus Trasferta 25/26", price: "€30.00", img: "https://store.juventus.com/images/juventus/products/small/JU25A02.webp" },
            "third-25": { name: "Juventus Terza 25/26", price: "€30.00", img:"https://store.juventus.com/images/juventus/products/small/JU25A03.webp"},
            "fourth-25": { name: "Juventus Quarta 25/26", price: "€30.00", img:"https://store.juventus.com/images/juventus/products/small/JU25A09.webp"},
            "gk-25": { name: "Juventus Portiere 25/26", price: "€30.00", img: "https://img01.ztat.net/article/spp-media-p1/ebf3465cf9f949b4aa4941a07669d674/7fd1dd0bf0e34736bcd96bb1d1e9a90c.jpg?imwidth=1800" },
        },
        "lazio": {
            "home-25": { name: "Lazio Casa 25/26", price: "€30.00", img: "https://www.laziostylestore.com/images/lazio/products/small/LZ25A01.webp" },
            "away-25": { name: "Lazio Trasferta 25/26", price: "€30.00", img: "https://www.laziostylestore.com/images/lazio/products/small/LZ25A02.webp" },
            "third-25": { name: "Lazio Terza 25/26", price: "€30.00", img: "https://www.laziostylestore.com/images/lazio/products/small/LZ25A03.webp" },
            "gk-25": { name: "Lazio Portiere 25/26", price: "€30.00", img: "https://www.laziostylestore.com/images/lazio/products/small/LZ25A05.webp" },
            "gk-2": { name: "Lazio Portiere 25/26", price: "€30.00", img: "https://www.laziostylestore.com/images/lazio/products/small/LZ25A04.webp" }
        },
        "milan": {
            "home-26": { name: "Milan Casa 26/27", price: "€30.00", img: "https://store.acmilan.com/cdn/shop/files/784121-A82_01.jpg?v=1779357357&width=900" },
            "away-25": { name: "Milan Trasferta 25/26", price: "€30.00", img: "https://store.acmilan.com/cdn/shop/files/779970-B50_01_bff1cfff-3a32-4f56-b7fd-451127eb06e1.jpg?v=1751521408&width=900" },
            "third-25": { name: "Milan Terza 25/26", price: "€30.00", img: "https://store.acmilan.com/cdn/shop/files/779978-C22_01.jpg?v=1753422960&width=900" },
            "fourth-25": { name: "Milan Quarta 25/26", price: "€30.00", img: "https://store.acmilan.com/cdn/shop/files/787637-C62_01.jpg?v=1772001760&width=900" },
            "fourth-25(2)": { name: "Milan Quarta 25/26", price: "€30.00", img: "https://store.acmilan.com/cdn/shop/files/787637-C02_01_a63bec66-417e-4aca-b618-e24d9c718789.jpg?v=1771956898&width=900" },
            "gk-25": { name: "Milan Portiere 25/26", price: "€30.00", img: "https://store.acmilan.com/cdn/shop/files/780601-C31_01.jpg?v=1747823810" },
        },
        "cremonese": {
            "home-25": { name: "Cremonese Casa 25/26", price: "€30.00", img: "https://store.uscremonese.it/cdn/shop/files/maglia-home3-4consponsor.jpg?v=1757322833&width=1280" },
            "away-25": { name: "Cremonese Trasferta 25/26", price: "€30.00", img: "https://store.uscremonese.it/cdn/shop/files/maglia-away-3-4consponsor.jpg?v=1757322882&width=1280" },
            "third-25": { name: "Cremonese Terza 25/26", price: "€30.00", img: "https://store.uscremonese.it/cdn/shop/files/maglia-third-3-4_con_sponsor.jpg?v=1757322921&width=1280" },
            "gk-25": { name: "Cremonese Portiere 25/26", price: "€30.00", img: "https://store.uscremonese.it/cdn/shop/files/maglia-arancione-portiere-fronte-con-sponsor.jpg?v=1753516159&width=1280" },
            "gk-2": { name: "Cremonese Portiere 25/26", price: "€30.00", img: "https://store.uscremonese.it/cdn/shop/files/maglia-azzurra-portiere-fronte-con-sponsor.jpg?v=1753516341&width=1280" },
            "gk-3": { name: "Cremonese Portiere 25/26", price: "€30.00", img: "https://store.uscremonese.it/cdn/shop/files/maglia-gialla-portiere-fronte-con-sponsor.jpg?v=1753516426&width=1280" }
        },
        "napoli": {
            "home-25": { name: "Napoli Casa 25/26", price: "€30.00", img: "https://store.sscnapoli.it/cdn/shop/files/home-shirt-800-x-800-px_02.jpg?v=1752505798&width=800" },
            "away-25": { name: "Napoli Trasferta 25/26", price: "€30.00", img: "https://store.sscnapoli.it/cdn/shop/files/away-shirt-800x800px_02.jpg?v=1752506194&width=800" },
            "third-25": { name: "Napoli Terza 25/26", price: "€30.00", img: "https://store.sscnapoli.it/cdn/shop/files/third-shirt-800-x-800-px_01-new.jpg?v=1754472318&width=800"},
            "gk-25": { name: "Napoli Portiere 25/26", price: "€30.00", img: "https://store.sscnapoli.it/cdn/shop/files/Gk-home-shirt-800-x-800-px_01.jpg?v=1754400784&width=800" },
        },
        "parma": {
            "home-25": { name: "Parma Casa 25/26", price: "€30.00", img: "https://shop.parmacalcio1913.com/cdn/shop/files/SS25_Social_TS_Football_Parma_Calcio_Home_Kit_25_26_LUCA1179-1x1.jpg?v=1749122105&width=1080" },
            "away-25": { name: "Parma Trasferta 25/26", price: "€30.00", img: "https://shop.parmacalcio1913.com/cdn/shop/files/AW25_Social_TS_Football_Parma__away_Kit_25_26_TIR-22724_1x1_f0ed06df-7c89-4138-8c27-2d221e2cacf1.jpg?v=1752832339&width=1080" },
            "third-25": { name: "Parma Terza 25/26", price: "€30.00", img: "https://shop.parmacalcio1913.com/cdn/shop/files/AW25_Social_TS_Football_Parma_ThirdKit2526_153_1x1_1.jpg?v=1751277271&width=1080" },
            "gk-25": { name: "Parma Portiere 25/26", price: "€30.00", img: "https://shop.parmacalcio1913.com/cdn/shop/files/Maglia_portiere_light_blue_sponsor.jpg?v=1752786506&width=540" },
            "gk-2": { name: "Parma Portiere 25/26", price: "€30.00", img: "https://shop.parmacalcio1913.com/cdn/shop/files/Progetto_senza_titolo_79.jpg?v=1752787312&width=540" },
        },
        "torino": {
            "home-25": { name: "Torino Casa 25/26", price: "€30.00", img: "https://torinofcstore.com/396034-home_default/torino-fc-maglia-gara-home-202526.jpg" },
            "away-25": { name: "Torino Trasferta 25/26", price: "€30.00", img: "https://torinofcstore.com/393792-home_default/torino-fc-maglia-gara-away-202526.jpg" },
            "gk-25": { name: "Torino Portiere 25/26", price: "€30.00", img: "https://torinofcstore.com/399995-home_default/torino-fc-maglia-gara-home-portiere-202526.jpg" },
            "gk-2": { name: "Torino Portiere 25/26", price: "€30.00", img: "https://torinofcstore.com/399999-home_default/torino-fc-maglia-gara-away-portiere-202526.jpg" },
            "gk-3": { name: "Torino Portiere 25/26", price: "€30.00", img: "https://torinofcstore.com/400003-home_default/torino-fc-maglia-gara-third-portiere-202526.jpg" }
        },
        "udinese": {
            "home-25": { name: "Udinese Casa 25/26", price: "€30.00", img: "https://www.macron.com/media/catalog/product/cache/02846c5b03570a5bab8106043be5e13d/3/f/3f3d5ccf17997474b71bbc19eaf4e04e400101840001.jpg" },
            "away-25": { name: "Udinese Trasferta 25/26", price: "€30.00", img: "https://www.macron.com/media/catalog/product/cache/02846c5b03570a5bab8106043be5e13d/c/5/c504cb030ca3fe557f676759f1c4104d400101920001.jpg" },
            "third-25": { name: "Udinese Terza 25/26", price: "€30.00", img: "https://www.macron.com/media/catalog/product/cache/02846c5b03570a5bab8106043be5e13d/c/8/c864530e3912fa4f8ea71a67361a89f9400101980001.jpg" },
        },
        "sassuolo": {
            "home-25": { name: "Sassuolo Casa 25/26", price: "€30.00", img: "https://store.sassuolocalcio.it/86277-thickbox_default/sassuolo-maglia-gara-home-2025-26.jpg" },
            "away-25": { name: "Sassuolo Trasferta 25/26", price: "€30.00", img: "https://store.sassuolocalcio.it/86286-thickbox_default/sassuolo-maglia-gara-away-2025-26.jpg" },
            "third-25": { name: "Sassuolo Terza 25/26", price: "€30.00", img: "https://store.sassuolocalcio.it/88411-thickbox_default/sassuolo-maglia-gara-third-2025-26.jpg" },
            "gk-25": { name: "Sassuolo Portiere 25/26", price: "€30.00", img: "https://store.sassuolocalcio.it/86310-thickbox_default/sassuolo-maglia-gara-portiere-home-2025-26.jpg" },
            "gk-2": { name: "Sassuolo Portiere 25/26", price: "€30.00", img: "https://store.sassuolocalcio.it/88420-large_default/sassuolo-maglia-gara-portiere-away-202526.jpg" },
        },
        "como": {
            "home-25": { name: "Como Casa 25/26", price: "€30.00", img: "https://shop.comofootball.com/cdn/shop/files/C1907_B1001_01.jpg?crop=center&height=250&v=1758876217&width=250" },
            "away-25": { name: "Como Trasferta 25/26", price: "€30.00", img: "https://shop.comofootball.com/cdn/shop/files/SecondaMaglia_01.jpg?crop=center&height=250&v=1758876564&width=250" },
            "third-25": { name: "Como Terza 25/26", price: "€30.00", img: "https://shop.comofootball.com/cdn/shop/files/1stImage.jpg?v=1764583746&width=2000" },
            "fourth-25": { name: "Como Quarta 25/26", price: "€30.00", img: "https://shop.comofootball.com/cdn/shop/files/Image_1_7.jpg?v=1778922724&width=800" },
            "gk-25": { name: "Como Portiere 25/26", price: "€30.00", img: "https://shop.comofootball.com/cdn/shop/files/C1907_00347_01_e50516b8-fa7b-4078-ad8e-04edab096380.jpg?crop=center&height=250&v=1758876738&width=250" },
            "gk-2": { name: "Como Portiere 25/26", price: "€30.00", img: "https://shop.comofootball.com/cdn/shop/files/C1907_B5001_09_01.jpg?crop=center&height=250&v=1758876639&width=250" },
            "gk-3": { name: "Como Portiere 25/26", price: "€30.00", img: "https://shop.comofootball.com/cdn/shop/files/C1907_B6001_08_01.jpg?crop=center&height=250&v=1757675978&width=250" },
        },
        "lecce": {
            "home-25": { name: "Lecce Casa 25/26", price: "€30.00", img: "https://www.usleccestore.it/cdn/shop/files/251101S_01.jpg?v=1755182902&width=1900" },
            "away-25": { name: "Lecce Trasferta 25/26", price: "€30.00", img: "https://www.usleccestore.it/cdn/shop/files/251104S_01.jpg?v=1755182883&width=1900" },
            "third-25": { name: "Lecce Terza 25/26", price: "€30.00", img: "https://www.usleccestore.it/cdn/shop/files/251107S_01_dc525a62-d715-4163-a495-23d1d3187518.jpg?v=1755182909&width=1900" }
        },
        "pisa": {
            "home-25": { name: "Pisa Casa 25/26", price: "€30.00", img: "https://cdn.shopify.com/s/files/1/0643/8243/5551/files/WhatsApp_Image_2025-09-30_at_16.10.43_1000x.jpg?v=1759243566" },
            "away-25": { name: "Pisa Trasferta 25/26", price: "€30.00", img: "https://cdn.shopify.com/s/files/1/0643/8243/5551/files/MAGLIA2_01_JUNIOR-NO_SERIE_A_1200x.jpg?v=1761251549" },
            "third-25": { name: "Pisa Terza 25/26", price: "€30.00", img: "https://cdn.shopify.com/s/files/1/0643/8243/5551/files/MAGLIA3_01_JUNIOR-NO_SERIE_A_1200x.jpg?v=1761251550" },
            "fourth-25": { name: "Pisa Quarta 25/26", price: "€30.00", img: "https://store.pisasportingclub.com/cdn/shop/files/MAGLIAFRONTE.webp?v=1770924816&width=832" },
        }
    },
    "premier-league": {
        "arsenal": {
            "home-25": { name: "Arsenal Casa 25/26", price: "€30.00", img: "https://i1.adis.ws/i/ArsenalDirect/mji9516_f1?$pdpMainZoomImage$" },
            "away-25": { name: "Arsenal Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Arsenal Portiere 25/26", price: "€30.00", img: "https://i1.adis.ws/i/ArsenalDirect/mji9544_f1?$pdpMainZoomImage$" }
        },
        "manchester-city": {
            "home-25": { name: "Manchester City Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Manchester City Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Manchester City Portiere 25/26", price: "€30.00", img: "" }
        },
        "chelsea": {
            "home-25": { name: "Chelsea Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Chelsea Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Chelsea Portiere 25/26", price: "€30.00", img: "" }
        },
        "liverpool": {
            "home-25": { name: "Liverpool Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Liverpool Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Liverpool Portiere 25/26", price: "€30.00", img: "" }
        },
        "manchester-united": {
            "home-25": { name: "Manchester United Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Manchester United Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Manchester United Portiere 25/26", price: "€30.00", img: "" }
        },
        "tottenham": {
            "home-25": { name: "Tottenham Hotspur Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Tottenham Hotspur Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Tottenham Hotspur Portiere 25/26", price: "€30.00", img: "" }
        },
        "brighton": {
            "home-25": { name: "Brighton Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Brighton Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Brighton Portiere 25/26", price: "€30.00", img: "" }
        },
        "newcastle": {
            "home-25": { name: "Newcastle Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Newcastle Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Newcastle Portiere 25/26", price: "€30.00", img: "" }
        },
        "aston-villa": {
            "home-25": { name: "Aston Villa Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Aston Villa Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Aston Villa Portiere 25/26", price: "€30.00", img: "" }
        },
        "nottingham-forest": {
            "home-25": { name: "Nottingham Forest Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Nottingham Forest Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Nottingham Forest Portiere 25/26", price: "€30.00", img: "" }
        },
        "crystal-palace": {
            "home-25": { name: "Crystal Palace Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Crystal Palace Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Crystal Palace Portiere 25/26", price: "€30.00", img: "" }
        },
        "brentford": {
            "home-25": { name: "Brentford Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Brentford Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Brentford Portiere 25/26", price: "€30.00", img: "" }
        },
        "bournemouth": {
            "home-25": { name: "Bournemuth Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Bournemuth Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Bournemuth Portiere 25/26", price: "€30.00", img: "" }
        },
        "west-ham": {
            "home-25": { name: "West Ham Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "West Ham Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "West Ham Portiere 25/26", price: "€30.00", img: "" }
        },
        "wolverhampton": {
            "home-25": { name: "Wolverhampton Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Wolverhampton Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Wolverhampton Portiere 25/26", price: "€30.00", img: "" }
        },
        "fulham": {
            "home-25": { name: "Fulham Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Fulham Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Fulham Portiere 25/26", price: "€30.00", img: "" }
        },
        "everton": {
            "home-25": { name: "Everton Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Everton Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Everton Portiere 25/26", price: "€30.00", img: "" }
        },
        "leeds": {
            "home-25": { name: "Leeds United Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Leeds United Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Leeds United Portiere 25/26", price: "€30.00", img: "" }
        },
        "burnley": {
            "home-25": { name: "Burnley Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Burnley Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Burnley Portiere 25/26", price: "€30.00", img: "" }
        },
        "sunderland": {
            "home-25": { name: "Sunderland Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Sunderland Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Sunderland Portiere 25/26", price: "€30.00", img: "" }
        }
    },
    "la-liga": {
        "real-madrid": {
            "home-25": { name: "Real Madrid Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Real Madrid Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Real Madrid Portiere 25/26", price: "€30.00", img: "" }
        },
        "barcelona": {
            "home-25": { name: "Barcellona Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Barcellona Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Barcellona Portiere 25/26", price: "€30.00", img: "" }
        },
        "atletico-madrid": {
            "home-25": { name: "Atlético Madrid Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Atlético Madrid Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Atlético Madrid Portiere 25/26", price: "€30.00", img: "" }
        },
        "athletic-bilbao": {
            "home-25": { name: "Athletic Bilbao Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Athletic Bilbao Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Athletic Bilbao Portiere 25/26", price: "€30.00", img: "" }
        },
        "real-sociedad": {
            "home-25": { name: "Real Sociedad Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Real Sociedad Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Real Sociedad Portiere 25/26", price: "€30.00", img: "" }
        },
        "villarreal": {
            "home-25": { name: "Villarreal Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Villarreal Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Villarreal Portiere 25/26", price: "€30.00", img: "" }
        },
        "real-betis": {
            "home-25": { name: "Real Betis Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Real Betis Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Real Betis Portiere 25/26", price: "€30.00", img: "" }
        },
        "valencia": {
            "home-25": { name: "Valencia Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Valencia Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Valencia Portiere 25/26", price: "€30.00", img: "" }
        },
        "siviglia": {
            "home-25": { name: "Siviglia Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Siviglia Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Siviglia Portiere 25/26", price: "€30.00", img: "" }
        },
        "girona": {
            "home-25": { name: "Girona Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Girona Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Girona Portiere 25/26", price: "€30.00", img: "" }
        },
        "celta-vigo": {
            "home-25": { name: "Celta Vigo Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Celta Vigo Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Celta Vigo Portiere 25/26", price: "€30.00", img: "" }
        },
        "osasuna": {
            "home-25": { name: "Osasuna Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Osasuna Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Osasuna Portiere 25/26", price: "€30.00", img: "" }
        },
        "getafe": {
            "home-25": { name: "Getafe Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Getafe Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Getafe Portiere 25/26", price: "€30.00", img: "" }
        },
        "mallorca": {
            "home-25": { name: "Mallorca Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Mallorca Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Mallorca Portiere 25/26", price: "€30.00", img: "" }
        },
        "espanyol": {
            "home-25": { name: "Espanyol Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Espanyol Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Espanyol Portiere 25/26", price: "€30.00", img: "" }
        },
        "alaves": {
            "home-25": { name: "Alavés Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Alavés Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Alavés Portiere 25/26", price: "€30.00", img: "" }
        },
        "rayo-vallecano": {
            "home-25": { name: "Rayo Vallecano Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Rayo Vallecano Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Rayo Vallecano Portiere 25/26", price: "€30.00", img: "" }
        },
        "levante": {
            "home-25": { name: "Levante Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Levante Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Levante Portiere 25/26", price: "€30.00", img: "" }
        },
        "elche": {
            "home-25": { name: "Elche Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Elche Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Elche Portiere 25/26", price: "€30.00", img: "" }
        },
        "real-oviedo": {
            "home-25": { name: "Real Oviedo Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Real Oviedo Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Real Oviedo Portiere 25/26", price: "€30.00", img: "" }
        }
    },
    "bundesliga": {
        "bayern-monaco": {
            "home-25": { name: "Bayern Monaco Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Bayern Monaco Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Bayern Monaco Portiere 25/26", price: "€30.00", img: "" }
        },
        "rb-lipsia": {
            "home-25": { name: "RB Lipsia Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "RB Lipsia Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "RB Lipsia Portiere 25/26", price: "€30.00", img: "" }
        },
        "borussia-dortmund": {
            "home-25": { name: "Borussia Dortmund Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Borussia Dortmund Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Borussia Dortmund Portiere 25/26", price: "€30.00", img: "" }
        },
        "bayer-leverkusen": {
            "home-25": { name: "Bayer Leverkusen Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Bayer Leverkusen Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Bayer Leverkusen Portiere 25/26", price: "€30.00", img: "" }
        },
        "eintracht-francoforte": {
            "home-25": { name: "Eintracht Francoforte Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Eintracht Francoforte Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Eintracht Francoforte Portiere 25/26", price: "€30.00", img:""}
        },
        "stoccarda": {
            "home-25": { name: "Stoccarda Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Stoccarda Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Stoccarda Portiere 25/26", price: "€30.00", img: "" }
        },
        "wolfsburg": {
            "home-25": { name: "Wolfsburg Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Wolfsburg Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Wolfsburg Portiere 25/26", price: "€30.00", img: "" }
        },
        "friburgo": {
            "home-25": { name: "Friburgo Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Friburgo Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Friburgo Portiere 25/26", price: "€30.00", img: "" }
        },
        "mainz": {
            "home-25": { name: "Mainz Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Mainz Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Mainz Portiere 25/26", price: "€30.00", img: "" }
        },
        "hoffenheim": {
            "home-25": { name: "Hoffenheim Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Hoffenheim Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Hoffenheim Portiere 25/26", price: "€30.00", img: "" }
        },
        "borussia-monchengladbach": {
            "home-25": { name: "Borussia Mönchengladbach Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Borussia Mönchengladbach Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Borussia Mönchengladbach Portiere 25/26", price: "€30.00", img: "" }
        },
        "augsburg": {
            "home-25": { name: "Augsburg Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Augsburg Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Augsburg Portiere 25/26", price: "€30.00", img: "" }
        },
        "union-berlino": {
            "home-25": { name: "Union Berlino Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Union Berlino Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Union Berlino Portiere 25/26", price: "€30.00", img: "" }
        },
        "werder-brema": {
            "home-25": { name: "Werder Brema Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Werder Brema Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Werder Brema Portiere 25/26", price: "€30.00", img: "" }
        },
        "colonia": {
            "home-25": { name: "Colonia Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Colonia Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Colonia Portiere 25/26", price: "€30.00", img: "" }
        },
        "amburgo": {
            "home-25": { name: "Amburgo Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Amburgo Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Amburgo Portiere 25/26", price: "€30.00", img: "" }
        },
        "heidenheim": {
            "home-25": { name: "Heidenheim Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "Heidenheim Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "Heidenheim Portiere 25/26", price: "€30.00", img: "" }
        },
        "st-pauli": {
            "home-25": { name: "St. Pauli Casa 25/26", price: "€30.00", img: "" },
            "away-25": { name: "St. Pauli Trasferta 25/26", price: "€30.00", img: "" },
            "gk-25": { name: "St. Pauli Portiere 25/26", price: "€30.00", img: "" }
        }
    }
};

// Database loghi (aggiorna con i tuoi percorsi)
const logos = {
    leagues: {
        "serie-a": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/grgsrAwXObh_JhjfHMtwUg_64x64.png",
        "premier-league": "https://footballgroundguide.com/app/uploads/2023/12/premiereleague-logo-1024x1024.png",
        "la-liga": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/U4pM4toWEW0Sr9NIhY_Lyw_64x64.png",
        "bundesliga": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoQaU8WrHYgwLBPz_-uQKtVbfhmT6DpkwMSs9VaDwcubInHhMF790MVq-TKcRnjjNA0MI&usqp=CAU"
    },
    teams: {
        "serie-a": {
            "juventus": "https://upload.wikimedia.org/wikipedia/commons/5/51/Juventus_FC_2017_logo.png",
            "inter": "https://media.inter.it/IM/logo/logo-600.png",
            "milan": "https://www.acmilan.com/images/logo.png",
            "napoli": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/SSC_Napoli_2024_%28azure%29.svg/250px-SSC_Napoli_2024_%28azure%29.svg.png",
            "atalanta": "https://upload.wikimedia.org/wikipedia/it/archive/8/81/20190126005333%21Logo_Atalanta_Bergamo.svg",
            "bologna": "https://www.registroaraldicoitaliano.it/wp-content/uploads/2021/11/Bologna-Calcio.png",
            "roma": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/BQdP4jUBFJfG7U_JBsFIMg_64x64.png",
            "fiorentina": "https://img.uefa.com/imgml/TP/teams/logos/240x240/2613817.png",
            "lazio": "https://upload.wikimedia.org/wikipedia/it/thumb/6/62/Stemma_della_Società_Sportiva_Lazio.svg/1280px-Stemma_della_Società_Sportiva_Lazio.svg.png",
            "como": "https://upload.wikimedia.org/wikipedia/commons/2/2c/Logo_Como_1907_2019.png",
            "parma": "https://logodownload.org/wp-content/uploads/2020/10/parma-logo-0.png",
            "torino": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/ovE3HSEx4GWXkW8GU7KVhA_64x64.png",
            "udinese": "https://upload.wikimedia.org/wikipedia/nap/4/44/Logo_Udinese.png",
            "genoa": "https://images.seeklogo.com/logo-png/44/2/genoa-cricket-football-club-logo-png_seeklogo-440262.png",
            "sassuolo": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9g8EePbmiOCoeJGtYW1bb9Sz80FC6XvrdQg&s",
            "cagliari": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/e9XfySyGdfyJ4UzEkYwENw_64x64.png",
            "lecce": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQaDxS1YAGN3uMQCxfCfO-XMpv-Ps8txtn33w&s",
            "verona": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqVcxqpW55OpUHsH8qUVByOXi-N9yT3wDgRCHvXQ6LxN6iT4EVxabK61Q4JVm9Gh7MrRQ&usqp=CAU",
            "pisa": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzWF7Xs4_hewJBlB2dpwluUNRELRI6JwU2Rw&s",
            "cremonese": "https://r2.thesportsdb.com/images/media/team/badge/6ng2vy1579708291.png"
        },
        /* fase di sviluppo
        "premier-league": {
            "arsenal": "https://upload.wikimedia.org/wikipedia/it/thumb/d/dc/Stemma_Arsenal_FC.svg/250px-Stemma_Arsenal_FC.svg.png",
            "chelsea": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/fhBITrIlbQxhVB6IjxUO6Q_64x64.png",
            "manchester-city": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSPI-RZxwG5Sx5ztx_WqWNCK114tHMM3WEmCA&s",
            "liverpool": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQX9dAlA2yI6urQ3v75MxMxn044L8KQ1TAP7g&s",
            "manchester-united": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwEO6rt9qZVJC69QCGKFwKPZEl3VVHkAlRAA&s",
            "tottenham": "https://upload.wikimedia.org/wikipedia/it/d/de/Tottenham_Hotspur_Logo.svg",
            "brighton": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/EKIe0e-ZIphOcfQAwsuEEQ_64x64.png",
            "newcastle": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/96CcNNQ0AYDAbssP0V9LuQ_64x64.png",
            "aston-villa": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/uyNNelfnFvCEnsLrUL-j2Q_64x64.png",
            "nottingham-forest": "https://upload.wikimedia.org/wikipedia/it/9/9e/Nottingham_Forest_FC_logo.png",
            "crystal-palace": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/8piQOzndGmApKYTcvyN9vA_64x64.png",
            "brentford": "https://upload.wikimedia.org/wikipedia/it/2/2e/Brentford_FC_logo.png",
            "bournemouth": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtIPxvaudacRuvJdCgx_JjaQyt6v06WIM_kg&s",
            "west-ham": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/bXkiyIzsbDip3x2FFcUU3A_64x64.png",
            "wolverhampton": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/-WjHLbBIQO9xE2e2MW3OPQ_64x64.png",
            "fulham": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/Gh7_5p3n364p4vxeM8FhNg_64x64.png",
            "everton": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/C3J47ea36cMBc4XPbp9aaA_64x64.png",
            "leeds": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/5dqfOKpjjW6EwTAx_FysKQ_64x64.png",
            "burnley": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/XC5UrPpuN5yzkgCiiz9yWg_64x64.png",
            "sunderland": "https://ssl.gstatic.com/onebox/media/sports/logos/optimized/CQFeTfHrtxqgr3VKWtTwfA_64x64.png"
        },
        "la-liga": {
            "real-madrid": "https://upload.wikimedia.org/wikipedia/it/thumb/0/0c/Real_Madrid_CF_logo.svg/1200px-Real_Madrid_CF_logo.svg.png",
            "barcelona": "https://upload.wikimedia.org/wikipedia/it/thumb/0/07/Fc_barcelona.png/250px-Fc_barcelona.png",
            "atletico-madrid": "https://upload.wikimedia.org/wikipedia/it/thumb/4/42/Stemma_Atletico_Madrid_%282024%29.svg/330px-Stemma_Atletico_Madrid_%282024%29.svg.png",
            "athletic-bilbao": "https://upload.wikimedia.org/wikipedia/it/e/ea/Athletic_Club.png",
            "real-sociedad": "https://upload.wikimedia.org/wikipedia/it/b/b2/Real_sociedad_de_futbol.png",
            "villarreal": "https://upload.wikimedia.org/wikipedia/it/6/65/Villarreal_cf.png",
            "real-betis": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTPA0-1-sBfiO6GyY0jejbkR3J_7U-RZ9I4g&s",
            "valencia": "https://upload.wikimedia.org/wikipedia/it/b/b2/Valencia_cf.png",
            "siviglia": "https://upload.wikimedia.org/wikipedia/it/thumb/2/2d/Sevilla_fc.png/250px-Sevilla_fc.png",
            "girona": "https://upload.wikimedia.org/wikipedia/en/f/f7/Girona_FC_Logo.svg",
            "celta-vigo": "https://upload.wikimedia.org/wikipedia/en/thumb/1/12/RC_Celta_de_Vigo_logo.svg/640px-RC_Celta_de_Vigo_logo.svg.png",
            "osasuna": "https://upload.wikimedia.org/wikipedia/it/5/53/Ca_osasuna.png",
            "getafe": "https://upload.wikimedia.org/wikipedia/en/thumb/4/46/Getafe_logo.svg/1200px-Getafe_logo.svg.png",
            "mallorca": "https://upload.wikimedia.org/wikipedia/it/1/16/Rcd_mallorca.png",
            "espanyol": "https://upload.wikimedia.org/wikipedia/it/archive/a/a5/20221110213626%21Rcd_espanyol_de_barcelona.png",
            "rayo-vallecano": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/Rayo_Vallecano_logo.svg/1200px-Rayo_Vallecano_logo.svg.png",
            "alaves": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f8/Deportivo_Alaves_logo_%282020%29.svg/800px-Deportivo_Alaves_logo_%282020%29.svg.png",
            "levante": "https://upload.wikimedia.org/wikipedia/it/thumb/7/7b/Levante_Unión_Deportiva%2C_S.A.D._logo.svg/1200px-Levante_Unión_Deportiva%2C_S.A.D._logo.svg.png",
            "elche": "https://upload.wikimedia.org/wikipedia/it/e/ee/Elche_Club_de_Futbol.png",
            "real-oviedo": "https://upload.wikimedia.org/wikipedia/it/8/89/Real_Oviedo.png"
        },
        "bundesliga": {
            "bayern-monaco": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_München_logo_%282017%29.svg/800px-FC_Bayern_München_logo_%282017%29.svg.png",
            "rb-lipsia": "https://upload.wikimedia.org/wikipedia/en/thumb/0/04/RB_Leipzig_2014_logo.svg/800px-RB_Leipzig_2014_logo.svg.png",
            "borussia-dortmund": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/800px-Borussia_Dortmund_logo.svg.png",
            "bayer-leverkusen": "https://upload.wikimedia.org/wikipedia/en/thumb/5/59/Bayer_04_Leverkusen_logo.svg/800px-Bayer_04_Leverkusen_logo.svg.png",
            "eintracht-francoforte": "https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Eintracht_Frankfurt_crest.svg/1200px-Eintracht_Frankfurt_crest.svg.png",
            "stoccarda": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/VfB_Stuttgart_1893_Logo.svg/800px-VfB_Stuttgart_1893_Logo.svg.png",
            "wolfsburg": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Logo-VfL-Wolfsburg.svg/800px-Logo-VfL-Wolfsburg.svg.png",
            "friburgo": "https://upload.wikimedia.org/wikipedia/it/7/7b/SC_Freiburg.png",
            "mainz": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Logo_Mainz_05.svg/1200px-Logo_Mainz_05.svg.png",
            "hoffenheim": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Logo_TSG_Hoffenheim.svg/1716px-Logo_TSG_Hoffenheim.svg.png",
            "borussia-monchengladbach": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Borussia_Mönchengladbach_logo.svg/800px-Borussia_Mönchengladbach_logo.svg.png",
            "augsburg": "https://upload.wikimedia.org/wikipedia/it/4/42/FC_Augsburg.png",
            "union-berlino": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/1._FC_Union_Berlin_Logo.svg/1200px-1._FC_Union_Berlin_Logo.svg.png",
            "werder-brema": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/SV-Werder-Bremen-Logo.svg/798px-SV-Werder-Bremen-Logo.svg.png",
            "colonia": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/1._FC_Koeln_Logo_2014%E2%80%93.svg/1054px-1._FC_Koeln_Logo_2014%E2%80%93.svg.png",
            "amburgo": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Hamburger_SV_logo.svg/250px-Hamburger_SV_logo.svg.png",
            "heidenheim": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/1._FC_Heidenheim_1846.svg/973px-1._FC_Heidenheim_1846.svg.png",
            "st-pauli": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe1X6O6HyYOFDWiIU5FX-wazqNaDEbfEzuKg&s"
        }
        */
    },
};