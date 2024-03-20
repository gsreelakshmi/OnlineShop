// Define function to fetch sales data
function fetchSalesData() {
    return $.ajax({
        url: 'https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/Sales',
        type: 'GET',
    });
}

// Define function to fetch customer data
function fetchCustomerData() {
    return $.ajax({
        url: 'https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/Customer',
        type: 'GET',
    });
}

// Define function to fetch category data
function fetchCategoryData() {
    return $.ajax({
        url: 'https://firestore.googleapis.com/v1/projects/online-store-9d44e/databases/(default)/documents/category',
        type: 'GET',
    });
}

// Define function to fetch top customers based on highest price
function fetchTopCustomers() {
    fetchCustomerData().done(function(customerResponse) {
        var customers = customerResponse.documents;

        fetchSalesData().done(function(salesResponse) {
            var salesData = salesResponse.documents;

            // Calculate total price for each customer
            customers.forEach(function(customer) {
                var customerId = customer.name.split('/').pop();
                var total = 0;
                salesData.forEach(function(sale) {
                    if (sale.fields['Customer ID'].stringValue === customerId) {
                        total += sale.fields['Price'].doubleValue * sale.fields['Quantity'].integerValue;
                    }
                });
                customer.totalPrice = total;
            });

            // Sort customers by total price in descending order
            customers.sort(function(a, b) {
                return b.totalPrice - a.totalPrice;
            });

            displayCustomers(customers, salesData, []);
        }).fail(function(error) {
            console.error('Error fetching sales data:', error);
        });
    }).fail(function(error) {
        console.error('Error fetching customer data:', error);
    });
}

// Define function to integrate all data into Sales API
function integrateDataIntoSalesAPI() {
    fetchSalesData().done(function(salesResponse) {
        var salesData = salesResponse.documents;

        fetchCustomerData().done(function(customerResponse) {
            var customers = customerResponse.documents;

            fetchCategoryData().done(function(categoryResponse) {
                var categoryData = categoryResponse.documents;

                displayCustomers(customers, salesData, categoryData);
            }).fail(function(error) {
                console.error('Error fetching category data:', error);
            });
        }).fail(function(error) {
            console.error('Error fetching customer data:', error);
        });
    }).fail(function(error) {
        console.error('Error fetching sales data:', error);
    });
}

// Function to display customers in tabular format
function displayCustomers(customers, salesData, categoryData) {
    var customerList = $('#customerList');
    customerList.empty();

    if (customers.length === 0) {
        customerList.append('<p>No customers found</p>');
    } else {
        var table = $('<table><thead><tr><th>Customer ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Item Name</th><th>Price</th><th>Quantity</th><th>Payment Method</th></tr></thead><tbody></tbody></table>');
        var tbody = table.find('tbody');

        customers.forEach(function(customer) {
            var customerId = customer.name.split('/').pop();
            var name = getFieldTextValue(customer.fields['fullName']);
            var email = getFieldTextValue(customer.fields['email']);
            var phone = getFieldTextValue(customer.fields['contact']);

            var salesForCustomer = salesData.filter(function(sale) {
                return sale.fields['Customer ID'].stringValue === customerId;
            });

            salesForCustomer.forEach(function(sale) {
                var itemName = getFieldTextValue(sale.fields['I Name']);
                var price = getFieldTextValue(sale.fields['Price']);
                var quantity = getFieldTextValue(sale.fields['Quantity']);
                var paymentMethod = getFieldTextValue(sale.fields['Payment Method']);

                var row = $('<tr></tr>');
                row.append('<td>' + customerId + '</td>');
                row.append('<td>' + name + '</td>');
                row.append('<td>' + email + '</td>');
                row.append('<td>' + phone + '</td>');
                row.append('<td>' + itemName + '</td>');
                row.append('<td>' + price + '</td>');
                row.append('<td>' + quantity + '</td>');
                row.append('<td>' + paymentMethod + '</td>');
                tbody.append(row);
            });
        });

        customerList.append(table);
    }
}

// Function to filter customers by payment method
function filterCustomersByPaymentMethod(paymentMethod) {
    fetchSalesData().done(function(salesResponse) {
        var salesData = salesResponse.documents;

        fetchCustomerData().done(function(customerResponse) {
            var customers = customerResponse.documents;

            fetchCategoryData().done(function(categoryResponse) {
                var categoryData = categoryResponse.documents;

                var filteredSalesData = salesData.filter(function(sale) {
                    return sale.fields['Payment Method'].stringValue === paymentMethod;
                });

                displayCustomers(customers, filteredSalesData, categoryData);
            }).fail(function(error) {
                console.error('Error fetching category data:', error);
            });
        }).fail(function(error) {
            console.error('Error fetching customer data:', error);
        });
    }).fail(function(error) {
        console.error('Error fetching sales data:', error);
    });
}

// Function to filter customers by quantity
function filterCustomersByQuantity(minQuantity, maxQuantity) {
    fetchSalesData().done(function(salesResponse) {
        var salesData = salesResponse.documents;

        fetchCustomerData().done(function(customerResponse) {
            var customers = customerResponse.documents;

            fetchCategoryData().done(function(categoryResponse) {
                var categoryData = categoryResponse.documents;

                var filteredSalesData = salesData.filter(function(sale) {
                    var quantity = getFieldTextValue(sale.fields['Quantity']);
                    return quantity >= minQuantity && quantity <= maxQuantity;
                });

                displayCustomers(customers, filteredSalesData, categoryData);
            }).fail(function(error) {
                console.error('Error fetching category data:', error);
            });
        }).fail(function(error) {
            console.error('Error fetching customer data:', error);
        });
    }).fail(function(error) {
        console.error('Error fetching sales data:', error);
    });
}

// Function to filter customers by price
function filterCustomersByPrice(minPrice, maxPrice) {
    fetchSalesData().done(function(salesResponse) {
        var salesData = salesResponse.documents;

        fetchCustomerData().done(function(customerResponse) {
            var customers = customerResponse.documents;

            fetchCategoryData().done(function(categoryResponse) {
                var categoryData = categoryResponse.documents;

                var filteredSalesData = salesData.filter(function(sale) {
                    var price = getFieldTextValue(sale.fields['Price']);
                    return price >= minPrice && price <= maxPrice;
                });

                displayCustomers(customers, filteredSalesData, categoryData);
            }).fail(function(error) {
                console.error('Error fetching category data:', error);
            });
        }).fail(function(error) {
            console.error('Error fetching customer data:', error);
        });
    }).fail(function(error) {
        console.error('Error fetching sales data:', error);
    });
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

// Call the function to start integrating data into Sales API
integrateDataIntoSalesAPI();

// Add event listener to the "Top 10 Customers" button
$(document).ready(function() {
    $('#fetchTopCustomersBtn').on('click', function() {
        fetchTopCustomers();
    });

    // Add event listener to filter buttons
    $('#fetchCashPaymentBtn').on('click', function() {
        filterCustomersByPaymentMethod('Cash');
    });

    $('#fetchCreditPaymentBtn').on('click', function() {
        filterCustomersByPaymentMethod('Credit');
    });

    $('#fetchAllCustomersBtn').on('click', function() {
        integrateDataIntoSalesAPI();
    });

    // Add event listener to the filter icon for quantity
    $('#filterByQuantityIcon').on('click', function() {
        var minQuantity = parseInt($('#minQuantityInput').val());
        var maxQuantity = parseInt($('#maxQuantityInput').val());
        filterCustomersByQuantity(minQuantity, maxQuantity);
    });

    // Add event listener to the filter icon for price
    $('#filterByPriceIcon').on('click', function() {
        var minPrice = parseFloat($('#minPriceInput').val());
        var maxPrice = parseFloat($('#maxPriceInput').val());
        filterCustomersByPrice(minPrice, maxPrice);
    });
});
