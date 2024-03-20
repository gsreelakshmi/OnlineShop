(function() {
    // Check if the code has already been executed
    if (window.paymentScriptExecuted) {
        return;
    }

    // Set a flag to indicate that the code has been executed
    window.paymentScriptExecuted = true;

    $(document).ready(function() {
        // Initially hide the sidebar
        $('#sidebar').hide();

        // Total price in the cart
        let totalPrice = 0;

        // Array to store products in the cart
        let cartProducts = [];

       

       

        // Fetch and display products from inventory
        $.ajax({
            url: 'https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/Inventory',
            type: 'GET',
            success: function(response) {
                displayProducts(response.documents);
            },
            error: function(error) {
                console.error('Error fetching products:', error);
            }
        });

        // Function to display products
        function displayProducts(products) {
            const productGrid = $('.product-grid');
            products.forEach(product => {
                const productData = product.fields;
                const productName = productData.name.stringValue;
                const productCategory = productData.category.stringValue;
                const productPrice = parseFloat(productData.price.doubleValue); // Parse price as float
                const productQuantity = productData.quantity.integerValue;
                
                const productImage = productData.imagelink ? productData.imagelink.stringValue : ''; // Check if imagelink exists

                console.log("Image link:", productImage);
                // You may need to retrieve product images as well
                const productCardHTML = `
                    <div class="product-card">
                        
                        <img src="${productImage}" alt="${productName}" class="product-image">
                        <h3>${productName}</h3>
                        <p>Category: ${productCategory}</p>
                        <p>Price: $${productPrice}</p>
                        
                        <button class="add-to-cart" data-product="${productName}" data-price="${productPrice}" data-quantity="${productQuantity}">Add to Cart</button>
                    </div>
                `;
                productGrid.append(productCardHTML);
            });

            // Add event listener for add to cart button
            $('.add-to-cart').click(function() {
                const productName = $(this).data('product');
                const productPrice = parseFloat($(this).data('price')); // Convert to float
                const productQuantity = parseInt($(this).data('quantity')); // Convert to integer
                addToCart(productName, productPrice, productQuantity);
            });
        }

        // Function to add product to cart
        function addToCart(productName, productPrice, productQuantity) {
            const cart = $('#cart');
            const existingCartItem = cart.find(`[data-product="${productName}"]`);
            if (existingCartItem.length > 0) {
                // If the product is already in the cart, ask for confirmation to add one more
                if (confirm(`The product ${productName} is already in the cart. Do you want to add one more?`)) {
                    updateCartItem(existingCartItem, productName, productPrice, productQuantity);
                }
            } else {
                // If the product is not in the cart, proceed as usual
                if (confirm(`Add ${productName} to cart for $${productPrice}?`)) {
                    // Add the product to cart
                    const cartItemHTML = `<div data-product="${productName}" data-quantity="1">${productName} - $${productPrice} <span class="quantity">1</span> <button class="update-cart">+</button> <button class="delete-cart">-</button></div>`;
                    cart.append(cartItemHTML);
                    // Update the total price
                    totalPrice += productPrice;
                    $('#totalPrice').text(`Total Price: $${totalPrice.toFixed(2)}`);
                    // Add product to cartProducts array
                    cartProducts.push({
                        name: productName,
                        quantity: 1
                    });
                    // Add event listeners for update and delete buttons
                    cart.find(`[data-product="${productName}"] .update-cart`).click(function() {
                        updateCartItem($(this).closest('[data-product]'), productName, productPrice, productQuantity);
                    });
                    cart.find(`[data-product="${productName}"] .delete-cart`).click(function() {
                        deleteCartItem($(this).closest('[data-product]'), productPrice);
                    });
                }
            }
        }

        // Function to update quantity of product in cart
        function updateCartItem(cartItem, productName, productPrice, productQuantity) {
            let quantity = parseInt(cartItem.find('.quantity').text());
            const newQuantity = parseInt(prompt(`Current quantity of ${productName}: ${quantity}\nEnter new quantity (up to ${productQuantity}):`));
            if (!isNaN(newQuantity) && newQuantity > 0 && newQuantity <= productQuantity) {
                // Update quantity and total price
                totalPrice -= productPrice * quantity;
                totalPrice += productPrice * newQuantity;
                cartItem.find('.quantity').text(newQuantity);
                $('#totalPrice').text(`Total Price: $${totalPrice.toFixed(2)}`);
                // Update quantity in cartProducts array
                const index = cartProducts.findIndex(item => item.name === productName);
                cartProducts[index].quantity = newQuantity;
            } else {
                alert('Invalid quantity. Please enter a valid quantity within the available quantity limit.');
            }
        }

        // Function to delete product from cart
        function deleteCartItem(cartItem, productPrice) {
            const productName = cartItem.data('product');
            const quantity = parseInt(cartItem.find('.quantity').text());
            if (confirm(`Are you sure you want to remove ${quantity} ${productName}(s) from the cart?`)) {
                // Remove item from cart and update total price
                cartItem.remove();
                totalPrice -= productPrice * quantity;
                $('#totalPrice').text(`Total Price: $${totalPrice.toFixed(2)}`);
                // Remove item from cartProducts array
                cartProducts = cartProducts.filter(item => item.name !== productName);
            }
        }

        // Payment button functionality
        $('#paymentButton').click(function() {
            const paymentMethod = $('#paymentMethod').val();
            if (paymentMethod === 'cash') {
                proceedWithCashPayment();
            } else if (paymentMethod === 'credit') {
                proceedWithCreditPayment();
            }
        });

        // Function to proceed with cash payment
        function proceedWithCashPayment() {
            const confirmation = confirm('Confirm payment with cash?');
            if (confirmation) {
                updateInventory();
                createCashOrder();
                alert('Cash payment confirmed!');
                openThankYouPage();
                
            } else {
                alert('Cash payment canceled.');
            }
        }

        // Function to proceed with credit payment
        function proceedWithCreditPayment() {
            const creditAmount = parseInt($('#creditAmount').val());
            if (isNaN(creditAmount) || creditAmount < 0) {
                alert('Invalid credit amount. Please enter a valid amount.');
                return;
            }

            if (creditAmount <= totalPrice) {
                const confirmation = confirm('Confirm payment with credit?');
                if (confirmation) {
                    updateInventory();
                    createCreditOrder(creditAmount);
                    alert('Credit payment confirmed!');
                    openThankYouPage();
                    
                } else {
                    alert('Credit payment canceled.');
                }
            } else {
                alert('Credit amount is insufficient for this purchase.');
            }
        }
        function openThankYouPage() {
            window.open('thankyou.html', '_blank');
        }
        
       


        // Function to update inventory
        function updateInventory() {
            // Fetch all inventory items
            $.ajax({
                url: 'https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/Inventory',
                type: 'GET',
                success: function(response) {
                    const inventoryItems = response.documents;
                    // Iterate over each inventory item
                    inventoryItems.forEach(inventoryItem => {
                        const inventoryId = inventoryItem.name.split('/').pop(); // Extract document ID
                        const inventoryData = inventoryItem.fields;
                        const productName = inventoryData.name.stringValue;
                        const productQuantity = inventoryData.quantity.integerValue;
                        // Check if this product is in the cart
                        const cartProduct = cartProducts.find(product => product.name === productName);
                        if (cartProduct) {
                            const cartQuantity = cartProduct.quantity;
                            // Update quantity in inventory
                            const newQuantity = productQuantity - cartQuantity;
                            if (newQuantity >= 0) {
                                // Construct fields object including other fields in inventory
                                const fieldsToUpdate = {
                                    quantity: {
                                        integerValue: newQuantity
                                    }
                                    // Include other fields to update here if needed
                                };
                                Object.keys(inventoryData).forEach(key => {
                                    if (key !== 'quantity') {
                                        fieldsToUpdate[key] = inventoryData[key];
                                    }
                                });
                                // Perform AJAX call to update inventory
                                $.ajax({
                                    url: `https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/Inventory/${inventoryId}`,
                                    type: 'PATCH',
                                    contentType: 'application/json',
                                    data: JSON.stringify({
                                        fields: fieldsToUpdate
                                    }),
                                    success: function(response) {
                                        console.log(`Inventory updated for ${productName}`);
                                    },
                                    error: function(error) {
                                        console.error(`Error updating inventory for ${productName}:`, error);
                                    }
                                });
                            } else {
                                console.error(`Insufficient quantity in inventory for ${productName}`);
                            }
                        }
                    });
                },
                error: function(error) {
                    console.error('Error fetching inventory:', error);
                }
            });
        }
        

        // Function to create cash order
        function createCashOrder() {
            const date = new Date().toISOString();
            const customerId = localStorage.getItem('uid'); // Get customer ID from local storage
            const purchaseData = {
                fields: {
                    "I Name": {
                        "stringValue": cartProducts.map(product => product.name).join(", ") // Concatenate all product names
                    },
                    "Customer ID": {
                        "stringValue": customerId
                    },
                    "Price": {
                        "integerValue": totalPrice.toString()
                    },
                    "Date": {
                        "timestampValue": date
                    },
                    "Quantity": {
                        "integerValue": cartProducts.reduce((total, product) => total + product.quantity, 0).toString() // Sum up all quantities
                    },
                    "Unit of Measure": {
                        "stringValue": "count"
                    },
                    "Payment Method": {
                        "stringValue": "Cash"
                    }
                }
            };

            // Perform AJAX call to create the order
            $.ajax({
                url: 'https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/Sales',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(purchaseData),
                success: function(response) {
                    console.log('Cash order created successfully:', response);
                },
                error: function(error) {
                    console.error('Error creating cash order:', error);
                }
            });
        }

        // Function to create credit order
        function createCreditOrder(creditAmount) {
            const date = new Date().toISOString();
            const customerId = localStorage.getItem('uid'); // Get customer ID from local storage
            const purchaseData = {
                fields: {
                    "I Name": {
                        "stringValue": cartProducts.map(product => product.name).join(", ") // Concatenate all product names
                    },
                    "Customer ID": {
                        "stringValue": customerId
                    },
                    "Price": {
                        "integerValue": totalPrice.toString()
                    },
                    "Date": {
                        "timestampValue": date
                    },
                    "Quantity": {
                        "integerValue": cartProducts.reduce((total, product) => total + product.quantity, 0).toString() // Sum up all quantities
                    },
                    "Unit of Measure": {
                        "stringValue": "count"
                    },
                    "Payment Method": {
                        "stringValue": "Credit"
                    }
                }
            };

            // Perform AJAX call to create the order
            $.ajax({
                url: 'https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/Sales',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(purchaseData),
                success: function(response) {
                    console.log('Credit order created successfully:', response);
                },
                error: function(error) {
                    console.error('Error creating credit order:', error);
                }
            });
            
        }
    });
})();

