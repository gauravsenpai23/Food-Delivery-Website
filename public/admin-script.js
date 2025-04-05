document.addEventListener('DOMContentLoaded', () => {
    const ordersTableBody = document.getElementById('orders-table-body');
    const connectionStatus = document.getElementById('connection-status');

    // --- Initialize Socket.IO Connection ---
    const socket = io(); // Connects to the server this HTML was served from

    socket.on('connect', () => {
        console.log('Connected to Socket.IO server');
        connectionStatus.textContent = 'Connected (Real-time)';
        connectionStatus.style.color = 'green';
        fetchOrders(); // Fetch initial orders once connected
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO server');
        connectionStatus.textContent = 'Disconnected';
         connectionStatus.style.color = 'red';
    });

    socket.on('connect_error', (err) => {
         console.error('Socket.IO connection error:', err);
         connectionStatus.textContent = 'Connection Error';
         connectionStatus.style.color = 'red';
    });


    // --- Listen for New Orders ---
    socket.on('new_order', (order) => {
        console.log('New order received:', order);
        addOrderToTable(order, true); // Add order and mark as new
        // Optional: Show a browser notification
        if (Notification.permission === "granted") {
            new Notification("New Order Received!", {
                body: `Order from <span class="math-inline">\{order\.customerDetails\.name\} for ₹</span>{order.totalAmount.toFixed(2)}`,
                icon: '/api/placeholder/60/60?text=ORD' // Replace with your logo/icon
            });
        }
    });

    // --- Fetch Initial Orders ---
    async function fetchOrders() {
        try {
            // !!! Add Authentication headers if required !!!
            const response = await fetch('/api/orders');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const orders = await response.json();
            renderOrders(orders);
        } catch (error) {
            console.error('Error fetching orders:', error);
            ordersTableBody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">Failed to load orders.</td></tr>`;
        }
    }

    // --- Render Orders ---
    function renderOrders(orders) {
        ordersTableBody.innerHTML = ''; // Clear loading/error message
        if (orders.length === 0) {
            ordersTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center;">No orders found.</td></tr>`;
            return;
        }
        orders.forEach(order => addOrderToTable(order, false)); // Add existing orders
    }

    // --- Add Single Order Row ---
    function addOrderToTable(order, isNew) {
        const row = document.createElement('tr');
        if (isNew) {
            row.classList.add('new-order'); // Highlight new orders
            // Remove highlight after a delay
            setTimeout(() => row.classList.remove('new-order'), 10000);
        }

        const orderDate = new Date(order.orderDate).toLocaleString('en-IN', {
             day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata'
        });

        // Build items list string or HTML
        let itemsHtml = '<ul style="margin:0; padding-left:15px;">';
        order.items.forEach(item => {
            itemsHtml += `<li><span class="math-inline">\{item\.name\} \(x</span>{item.quantity})</li>`;
        });
        itemsHtml += '</ul>';

        row.innerHTML = `
            <td><span class="math-inline">\{order\.\_id\.toString\(\)\.slice\(\-6\)\}</td\>
	<td>{orderDate}</td>
	<td>order.customerDetails.name</td><td>{order.customerDetails.phone}</td>
	<td>order.totalAmount.toFixed(2)</td><tdclass="status−{order.status.toLowerCase()}">order.status</td><td><spanclass="details−toggle">ShowItems({order.items.length})</span>
	<div class="item-details">${itemsHtml}</div>
	</td>
	`;
	const toggle = row.querySelector('.details-toggle');
         const details = row.querySelector('.item-details');
         if(toggle && details){
            toggle.addEventListener('click', () => {
                const isVisible = details.style.display === 'block';
                details.style.display = isVisible ? 'none' : 'block';
                toggle.textContent = isVisible ? `Show Items (${order.items.length})` : `Hide Items`;
            });
         }


        // Prepend new orders, append existing ones (or just prepend all for simplicity)
        ordersTableBody.prepend(row); // Add to the top
    }

     // Ask for notification permission on load (optional)
     if ('Notification' in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
         Notification.requestPermission().then(permission => {
             if (permission === "granted") {
                 console.log("Notification permission granted.");
             } else {
                  console.log("Notification permission denied.");
             }
         });
     }

});
