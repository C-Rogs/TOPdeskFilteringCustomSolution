document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "https://demo-uk2.topdesk.net/tas/api/persons";
    const BASE_URL = "https://demo-uk2.topdesk.net/tas/api";

    let users = [];
    let departments = [];

    const pageSizeSelect = document.getElementById("pageSize");
    const departmentSelect = document.getElementById("departmentFilter");

    // Fetch users with pagination
    async function fetchUsers(pageSize = 50, department = '', location = '') {
        let query = `branch.name==Delft`;
        
        if (department) {
            query += `;department.name=in=(${department})`;
        }
        
        if (location) {
            query += `;location.name=in=(${location})`;
        }

        try {
            const response = await fetch(`${API_URL}?page_size=${pageSize}&query=${query}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            users = data;
            displayUsers(users);
            enableSorting();
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    // Display the users in the table
    function displayUsers(users) {
        const tableBody = document.querySelector("#users-table tbody");
        tableBody.innerHTML = ""; // Clear existing rows
        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user ? user.dynamicName : 'N/A'}</td>
                <td>${user ? user.email : 'N/A'}</td>
                <td>${user && user.branch ? user.branch.name : 'N/A'}</td>
                <td>${user && user.department ? user.department.name : 'N/A'}</td>
                <td>${user && user.optionalFields1 ? user.optionalFields1.boolean1 : 'N/A'}</td>
                <td>${user && user.optionalFields1 ? user.optionalFields1.boolean2 : 'N/A'}</td>
                <td>${user && user.optionalFields1 ? user.optionalFields1.boolean3 : 'N/A'}</td>
                <td>${user && user.optionalFields1 ? user.optionalFields1.boolean4 : 'N/A'}</td>
                <td>${user && user.optionalFields1 ? user.optionalFields1.boolean5 : 'N/A'}</td>
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

    // Fetch and display departments
    async function getDepartments() {
        const URL = BASE_URL + "/departments"; // Use the appropriate API URL
        try {
            const response = await fetch(URL, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            displayDepartments(data);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }

    // Function to populate dropdown with department data
    function displayDepartments(departments) {
        const departmentFilter = document.getElementById("departmentFilter");

        departmentFilter.innerHTML = ""; 

        departments.forEach(department => {
            const newOption = document.createElement("option");
            newOption.value = department.name; // Assuming 'name' is the department name
            newOption.text = department.name;
            departmentFilter.appendChild(newOption);
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

    // Refresh users when the filters are applied
    departmentSelect.addEventListener("change", function() {
        const department = departmentSelect.value;
        const pageSize = parseInt(pageSizeSelect.value);
        fetchUsers(pageSize, department);
    });

    fetchUsers(); // Initial fetch with default pageSize=50
    getDepartments();
});
