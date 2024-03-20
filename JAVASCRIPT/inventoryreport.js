$(document).ready(function() {
    // Show All Inventory button click event
    $('#showAllInventoryBtn').on('click', function() {
        fetchAndDisplayInventory();
    });

    // Function to fetch and display inventory
    function fetchAndDisplayInventory() {
        $.ajax({
            url: 'https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/Inventory',
            type: 'GET',
            success: function(response) {
                var inventory = response.documents;
                displayInventory(inventory);
            },
            error: function(error) {
                console.error('Error fetching inventory:', error);
            }
        });
    }

    // Function to display inventory
    function displayInventory(inventory) {
        var inventoryContainer = $('#inventoryContainer');
        inventoryContainer.empty();

        if (inventory.length === 0) {
            inventoryContainer.append('<p>No inventory found</p>');
        } else {
            var table = $('<table><thead><tr><th>Inventory ID</th><th>Category</th><th>Name</th><th>Price</th><th>Quantity</th></tr></thead><tbody></tbody></table>');
            var tbody = table.find('tbody');

            inventory.forEach(function(item) {
                var inventoryId = item.name.split('/').pop();
                var fields = item.fields;
                var category = getFieldTextValue(fields.category);
                var name = getFieldTextValue(fields.name);
                var price = getFieldTextValue(fields.price);
                var quantity = getFieldTextValue(fields.quantity);

                var row = $('<tr></tr>');
                row.append('<td>' + inventoryId + '</td>');
                row.append('<td>' + category + '</td>');
                row.append('<td>' + name + '</td>');
                row.append('<td>' + price + '</td>');
                row.append('<td>' + quantity + '</td>');
                tbody.append(row);
            });

            inventoryContainer.append(table);
        }
    }

    // Function to get text value of a field
    function getFieldTextValue(fieldValue) {
        if (fieldValue && fieldValue.stringValue !== undefined) {
            return fieldValue.stringValue;
        } else if (fieldValue && fieldValue.integerValue !== undefined) {
            return fieldValue.integerValue;
        } else if (fieldValue && fieldValue.doubleValue !== undefined) {
            return fieldValue.doubleValue;
        } else if (fieldValue && fieldValue.timestampValue !== undefined) {
            return new Date(fieldValue.timestampValue).toLocaleDateString();
        } else {
            return 'Unknown';
        }
    }
});



















