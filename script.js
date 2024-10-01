document.addEventListener("DOMContentLoaded", function() {
    const BASE_URL = "https://demo-uk2.topdesk.net/tas/api";
    let users = [];
    let departments = [];
    let extraAs = [];
    let extraBs = [];
    let optionalFields1Searchlist1s = [];
    let isLoading = false;

    // DOM elements
    const pageSizeSelect = document.getElementById("pageSize");
    const departmentSelect = document.getElementById("departmentFilter");
    const extraASelect = document.getElementById("extraAFilter");
    const extraBSelect = document.getElementById("extraBFilter");
    const optionalFields1Searchlist1Select = document.getElementById("optionalFields1Searchlist1sFilter");
    const checkboxes = document.querySelectorAll(".floating-pane input[type='checkbox']");
    const tableBody = document.querySelector("#users-table tbody");
    const loadingIndicator = document.getElementById("loadingIndicator");

    // Display loading spinner
    function showLoading(isLoading) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }

    // Fetch users with pagination and filters
    async function fetchUsers(pageSize = 50, departments = [], extraAs = [], extraBs = [], optionalFields = []) {
        let query = `branch.name==Delft`;

        if (departments.length > 0) {
            query += `;department.name=in=(${departments.join(',')})`;
        }
        if (extraAs.length > 0) {
            query += `;personExtraFieldA.name=in=(${extraAs.join(',')})`;
        }
        if (extraBs.length > 0) {
            query += `;personExtraFieldB.name=in=(${extraBs.join(',')})`;
        }
        if (optionalFields.length > 0) {
            optionalFields.forEach(field => {
                query += `;${field}==true`;
            });
        }

        showLoading(true); // Show loading spinner during the API call
        try {
            const response = await fetch(`${BASE_URL}/persons?page_size=${pageSize}&query=${query}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            users = response.status === 204 ? [] : await response.json();
            displayUsers(users);
            enableSorting();
        } catch (error) {
            alert('Error fetching users. Please try again later.');
            console.error('Error fetching users:', error);
        } finally {
            showLoading(false); // Hide loading spinner after the API call
        }
    }

    // Display users in the table
    function displayUsers(users) {
        tableBody.innerHTML = ""; // Clear existing rows
        if (users.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='12'>No users found</td></tr>";
            return;
        }
        users.forEach(user => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${user?.firstName || ''}</td>
                <td>${user?.surName || ''}</td>
                <td>${user?.email || ''}</td>
                <td>${user?.branch?.name || ''}</td>
                <td>${user?.department?.name || ''}</td>
                <td>${user?.optionalFields1?.searchlist1.name || ''}</td>
                <td>${user?.optionalFields1?.searchlist2.name || ''}</td>
                <td>${user?.personExtraFieldA?.name || ''}</td>
                <td>${user?.personExtraFieldB?.name || ''}</td>
                <td>${user?.optionalFields1?.boolean1 || 'False'}</td>
                <td>${user?.optionalFields1?.boolean2 || 'False'}</td>
                <td>${user?.optionalFields1?.boolean3 || 'False'}</td>
                <td>${user?.optionalFields1?.boolean4 || 'False'}</td>
                <td>${user?.optionalFields1?.boolean5 || 'False'}</td>
                <td>${user?.optionalFields2?.boolean1 || 'False'}</td>
                <td>${user?.optionalFields2?.boolean2 || 'False'}</td>
                <td>${user?.optionalFields2?.boolean3 || 'False'}</td>
                <td>${user?.optionalFields2?.boolean4 || 'False'}</td>
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

                users.sort((a, b) => {
                    const valueA = getValueForSort(a, sortKey);
                    const valueB = getValueForSort(b, sortKey);
                    return newOrder === "asc" ? (valueA > valueB ? 1 : -1) : (valueA < valueB ? 1 : -1);
                });

                headers.forEach(h => h.removeAttribute("data-order"));
                header.setAttribute("data-order", newOrder);

                displayUsers(users);
            });
        });
    }

    // Fetch and display departments
    async function getDepartments() {
        try {
            const response = await fetch(`${BASE_URL}/departments`, { headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            departments = await response.json();
            populateDropdown(departmentSelect, departments);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    }

    // Fetch and display Extra A entries
    async function getExtraA() {
        try {
            const response = await fetch(`${BASE_URL}/personExtraFieldAEntries`, { headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            extraAs = await response.json();
            populateDropdown(extraASelect, extraAs);
        } catch (error) {
            console.error('Error fetching Extra A fields:', error);
        }
    }

    // Fetch and display Extra B entries
    async function getExtraB() {
        try {
            const response = await fetch(`${BASE_URL}/personExtraFieldBEntries`, { headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            extraBs = await response.json();
            populateDropdown(extraBSelect, extraBs);
        } catch (error) {
            console.error('Error fetching Extra B fields:', error);
        }
    }

    // Fetch and display optional tab 1 searchlist 1
    async function getOptionalFields1Searchlist1s() {
        try {
            const response = await fetch(`${BASE_URL}/persons/free_fields/1/searchlists/1`, { headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            optionalFields1Searchlist1s = await response.json();
            populateDropdown(optionalFields1Searchlist1Select, optionalFields1Searchlist1s);
        } catch (error) {
            console.error('Error fetching optional tab 1 searchlist 1 fields:', error);
        }
    }

    // Populate dropdowns with data
    function populateDropdown(selectElement, data) {
        selectElement.innerHTML = "";
        selectElement.appendChild(new Option("Any", ""));
        data.forEach(item => {
            const newOption = document.createElement("option");
            newOption.value = item.name;
            newOption.text = item.name;
            selectElement.appendChild(newOption);
        });
    }

    // Gather all filter values and fetch users
    function applyFilters() {
        const pageSize = parseInt(pageSizeSelect.value);
        const departments = getSelectedValues(departmentSelect);
        const extraAs = getSelectedValues(extraASelect);
        const extraBs = getSelectedValues(extraBSelect);
        const optionalFields = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.id);
        fetchUsers(pageSize, departments, extraAs, extraBs, optionalFields);
    }

    // Add event listeners
    pageSizeSelect.addEventListener("change", applyFilters);
    departmentSelect.addEventListener("change", applyFilters);
    extraASelect.addEventListener("change", applyFilters);
    extraBSelect.addEventListener("change", applyFilters);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", applyFilters);
    });

    // Copy button
    document.getElementById("copyButton").addEventListener("click", async function() {
        const table = document.getElementById("users-table");
        let tableText = "";
        const rows = table.querySelectorAll("tr");
    
        rows.forEach(row => {
            const cols = row.querySelectorAll("td, th");
            const rowData = Array.from(cols).map(col => col.innerText).join("\t"); // Use tab as delimiter
            tableText += rowData + "\n";
        });
    
        try {
            await navigator.clipboard.writeText(tableText);
            alert("Table copied to clipboard!");
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    });

    // Export button
    document.getElementById("exportButton").addEventListener("click", function() {
        const table = document.getElementById("users-table");
        let csvContent = "";
        const rows = table.querySelectorAll("tr");
    
        rows.forEach(row => {
            const cols = row.querySelectorAll("td, th");
            const rowData = Array.from(cols).map(col => col.innerText).join(",");
            csvContent += rowData + "\r\n";
        });
    
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.setAttribute("href", url);
        a.setAttribute("download", "users.csv");
        a.click();
    });

    // Initialize
    fetchUsers(); // Initial fetch with default pageSize=50
    getDepartments();
    getExtraA();
    getExtraB();
    //getOptionalFields1Searchlist1s()

    // Utility functions
    function getValueForSort(user, sortKey) {
        if (sortKey === 'branch' || sortKey === 'department') {
            return user[sortKey]?.name || 'N/A';
        }
        return user[sortKey] || 'N/A';
    }

    function getSelectedValues(selectElement) {
        return Array.from(selectElement.selectedOptions)
            .map(option => option.value)
            .filter(value => value !== ""); // Exclude 'Any' option
    }
});
