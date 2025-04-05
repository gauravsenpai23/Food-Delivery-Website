// Inside the checkoutForm event listener in script.js:

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (event) => { // Make async
            event.preventDefault();

            if (cart.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            // Get form data
            const name = document.getElementById('name').value.trim();
            const address = document.getElementById('address').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim(); // Optional
            const paymentMethodElement = document.querySelector('input[name="payment"]:checked');

            // Basic validation
            if (!name || !address || !phone || !paymentMethodElement) {
                alert("Please fill in all required fields and select a payment method.");
                return;
            }
             if (!/^[0-9]{10}$/.test(phone)) {
                 alert("Please enter a valid 10-digit phone number.");
                 return;
             }

            const paymentMethod = paymentMethodElement.value;

            const orderData = {
                customerDetails: { name, address, phone, email },
                items: cart, // Send the current cart items
                paymentMethod: paymentMethod
            };

            // Disable button to prevent multiple submissions
            const submitButton = checkoutForm.querySelector('.place-order-btn');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = 'Placing Order...';

            try {
                const response = await fetch('/api/orders', { // Use fetch to POST
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                });

                const result = await response.json(); // Always try to parse JSON

                if (!response.ok) {
                    // Handle HTTP errors (4xx, 5xx)
                    throw new Error(result.msg || `HTTP error! status: ${response.status}`);
                }

                // Order placed successfully!
                alert(`Order Placed Successfully!\nOrder details: ${result.msg}`); // Use message from server

                // Clear cart and redirect or update UI
                cart = [];
                saveCart(); // Clear localStorage
                updateCartDisplay();
                renderCartSummary(); // Update checkout page view
                checkoutForm.reset(); // Clear form
                // Optionally redirect: window.location.href = '/thankyou.html';

            } catch (error) {
                console.error('Error placing order:', error);
                alert(`Failed to place order: ${error.message}`);
            } finally {
                 // Re-enable button
                 submitButton.disabled = false;
                 submitButton.textContent = originalButtonText;
            }
        });
    }
