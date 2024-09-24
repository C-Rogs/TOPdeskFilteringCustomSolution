document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "https://demo-uk2.topdesk.net/tas/api/persons";

    let users = [];

    const pageSizeSelect = document.getElementById("pageSize");

    // Fetch users with pagination
    function fetchUsers(pageSize = 50) {
        fetch(`${API_URL}?page_size=${pageSize}&query=branch.name==Delft`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            users = data;
            displayUsers(users);
            enableSorting();
        })
        .catch(error => console.error('Error fetching users:', error));
    }

    // Display the users in the table
    function displayUsers(users) {
        const tableBody = document.querySelector("#users-table tbody");
        tableBody.innerHTML = ""; // Clear existing rows
        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user.dynamicName}</td>
                <td>${user.email}</td>
                <td>${user.branch ? user.branch.name : 'N/A'}</td>
                <td>${user.department ? user.department.name : 'N/A'}</td>
                <td>${user.optionalFields1 ? user.optionalFields1.boolean1 : 'N/A'}</td>
                <td>${user.optionalFields1 ? user.optionalFields1.boolean2 : 'N/A'}</td>
                <td>${user.optionalFields1 ? user.optionalFields1.boolean3 : 'N/A'}</td>
                <td>${user.optionalFields1 ? user.optionalFields1.boolean4 : 'N/A'}</td>
                <td>${user.optionalFields1 ? user.optionalFields1.boolean5 : 'N/A'}</td>

            `;
            tableBody.appendChild(row);
        });
    }

    // Sorting functionality
    function enableSorting() {
        const headers = document.querySelectorAll("#users-table th");
        headers.forEach(header => {
            header.addEventListener("click", () => {
                const sortKey = header.getAttribute("data-sort");
                const currentOrder = header.getAttribute("data-order") || "asc";
                const newOrder = currentOrder === "asc" ? "desc" : "asc";

                // Sort the users array
                users.sort((a, b) => {
                    const valueA = getValueForSort(a, sortKey);
                    const valueB = getValueForSort(b, sortKey);
                    return newOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
                });

                // Update sorting arrow
                headers.forEach(h => h.removeAttribute("data-order"));
                header.setAttribute("data-order", newOrder);

                displayUsers(users);
            });
        });
    }

    function getValueForSort(user, sortKey) {
        if (sortKey === 'branch' || sortKey === 'department') {
            return user[sortKey] ? user[sortKey].name : 'N/A';
        }
        return user[sortKey] || 'N/A';
    }

    // Change page size when the dropdown value changes
    pageSizeSelect.addEventListener("change", function() {
        const pageSize = parseInt(pageSizeSelect.value);
        fetchUsers(pageSize);
    });

    fetchUsers(); // Initial fetch with default pageSize=50
});
