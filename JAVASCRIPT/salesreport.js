$(document).ready(function() {
    // Show All Sales button click event
    $('#showAllSalesBtn').on('click', function() {
        fetchAndDisplaySales('All');
    });

    // Credit Sales button click event
    $('#showCreditSalesBtn').on('click', function() {
        fetchAndDisplaySales('Credit');
    });

    // Cash Sales button click event
    $('#showCashSalesBtn').on('click', function() {
        fetchAndDisplaySales('Cash');
    });

    // Filter By Date button click event
    $('#filterByDateBtn').on('click', function() {
        var fromDate = $('#fromDate').val();
        var toDate = $('#toDate').val();
        if (fromDate && toDate) {
            fetchAndDisplaySalesByDateRange(fromDate, toDate);
        } else {
            alert('Please select both From and To dates.');
        }
    });

    // Function to fetch and display sales based on payment method
    function fetchAndDisplaySales(paymentMethod) {
        $.ajax({
            url: 'https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/Sales',
            type: 'GET',
            success: function(response) {
                var sales = response.documents;
                var filteredSales = [];

                if (paymentMethod === 'All') {
                    filteredSales = sales;
                } else {
                    filteredSales = sales.filter(function(sale) {
                        return getFieldTextValue(sale.fields['Payment Method']) === paymentMethod;
                    });
                }

                displaySales(filteredSales);
            },
            error: function(error) {
                console.error('Error fetching sales:', error);
            }
        });
    }

    // Function to fetch and display sales based on date range
    function fetchAndDisplaySalesByDateRange(fromDate, toDate) {
        $.ajax({
            url: 'https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/Sales',
            type: 'GET',
            success: function(response) {
                var sales = response.documents;
                var filteredSales = sales.filter(function(sale) {
                    var saleDate = new Date(getFieldTextValue(sale.fields['Date']));
                    return saleDate >= new Date(fromDate) && saleDate <= new Date(toDate);
                });

                displaySales(filteredSales);
            },
            error: function(error) {
                console.error('Error fetching sales:', error);
            }
        });
    }

    // Function to display sales
    function displaySales(sales) {
        var salesContainer = $('#salesContainer');
        salesContainer.empty();

        if (sales.length === 0) {
            salesContainer.append('<p>No sales found</p>');
        } else {
            var table = $('<table><thead><tr><th>Sale ID</th><th>Customer ID</th><th>Date</th><th>Item Name</th><th>Price</th><th>Quantity</th><th>Payment Method</th></tr></thead><tbody></tbody></table>');
            var tbody = table.find('tbody');

            sales.forEach(function(sale) {
                var saleId = sale.name.split('/').pop();
                var customerId = getFieldTextValue(sale.fields['Customer ID']);
                var date = getFieldTextValue(sale.fields['Date']);
                var itemName = getFieldTextValue(sale.fields['I Name']);
                var price = getFieldTextValue(sale.fields['Price']);
                var quantity = getFieldTextValue(sale.fields['Quantity']);
                var paymentMethod = getFieldTextValue(sale.fields['Payment Method']);
                
                var row = $('<tr></tr>');
                row.append('<td>' + saleId + '</td>');
                row.append('<td>' + customerId + '</td>');
                row.append('<td>' + date + '</td>');
                row.append('<td>' + itemName + '</td>');
                row.append('<td>' + price + '</td>');
                row.append('<td>' + quantity + '</td>');
                row.append('<td>' + paymentMethod + '</td>');
                tbody.append(row);
            });

            salesContainer.append(table);
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