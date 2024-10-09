document.addEventListener("DOMContentLoaded", function() {
    const BASE_URL = "https://demo-uk2.topdesk.net/tas/api";
    let users = [];
    let departments = [];
    let extraAs = [];
    let extraBs = [];
    let optionalFields1Searchlist1s = [];
    let optionalFields1Searchlist2s = [];
    let isLoading = false;

    // DOM elements
    const pageSizeSelect = document.getElementById("pageSize");
    const departmentSelect = document.getElementById("departmentFilter");
    const extraASelect = document.getElementById("extraAFilter");
    const extraBSelect = document.getElementById("extraBFilter");
    const optionalFields1Searchlist1Select = document.getElementById("optionalFields1Searchlist1sFilter");
    const optionalFields1Searchlist2Select = document.getElementById("optionalFields1Searchlist2sFilter");
    const optionalFields1T1Select = document.getElementById("optionalFields1T1sFilter");
    const optionalFields1T2Select = document.getElementById("optionalFields1T2sFilter");
    const optionalFields1T3Select = document.getElementById("optionalFields1T3sFilter");
    const optionalFields1D1Select = document.getElementById("optionalFields1D1sFilter");
    const optionalFields1N1Select = document.getElementById("optionalFields1N1sFilter");
    const optionalFields2D1Select = document.getElementById("optionalFields2D1sFilter");
    const checkboxes = document.querySelectorAll(".floating-pane input[type='checkbox']");
    const tableBody = document.querySelector("#users-table tbody");
    const loadingIndicator = document.getElementById("loadingIndicator");

    // Display loading spinner
    function showLoading(isLoading) {
        loadingIndicator.style.display = isLoading ? 'block' : 'none';
    }

    // Fetch users with pagination and filters
    async function fetchUsers(pageSize = 50, departments = [], extraAs = [], extraBs = [], optionalFields1Searchlist1s = [], optionalFields1Searchlist2s = [], optionalFields = []) {
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
        // Only add search lists to the query if they are not empty
        if (optionalFields1Searchlist1s.length > 0) {
            query += `;optionalFields1.searchlist1.name=in=(${optionalFields1Searchlist1s.join(',')})`;
        }
        if (optionalFields1Searchlist2s.length > 0) {
            query += `;optionalFields1.searchlist2.name=in=(${optionalFields1Searchlist2s.join(',')})`;
        }
        // Add boolean fields only if they are checked
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
            enableSorting(users);
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
                <td>${user?.optionalFields1?.searchlist1?.name || ''}</td> <!-- Region -->
                <td>${user?.optionalFields1?.searchlist2?.name || ''}</td> <!-- Location setting -->
                <td>${user?.personExtraFieldA?.name || ''}</td> <!--Host Organisation-->
                <td>${user?.personExtraFieldB?.name || ''}</td> <!--Host Trust-->
                <td>${user?.optionalFields1?.text1 || ''}</td> <!-- GMC/GDCP/Public Health Number -->
                <td>${user?.optionalFields1?.text2 || ''}</td> <!-- Assignment Number -->
                <td>${user?.optionalFields1?.text3 || ''}</td> <!-- NHS OMP Scheme -->
                <td>${user?.optionalFields1?.date1 ? new Date(user.optionalFields1.date1).toLocaleDateString() : ''}</td> <!-- Professional Registration Expiry Date -->
                <td>${user?.optionalFields1?.number1 || ''}</td> <!-- FTE -->
                <td>${user?.optionalFields2?.searchlist1?.name || ''}</td> <!-- Host Org - Position -->
                <td>${user?.optionalFields2?.searchlist2?.name || ''}</td> <!-- Host Org - Specialism -->
                <td>${user?.optionalFields1?.boolean1 ? 'True' : 'False'}</td> <!-- Industrial Action -->
                <td>${user?.optionalFields1?.boolean2 ? 'True' : 'False'}</td> <!-- Pay and Work Schedules -->
                <td>${user?.optionalFields1?.boolean3 ? 'True' : 'False'}</td> <!-- Pre-Employment Checks -->
                <td>${user?.optionalFields1?.boolean4 ? 'True' : 'False'}</td> <!-- Rotation and Contracts -->
                <td>${user?.optionalFields1?.boolean5 ? 'True' : 'False'}</td> <!-- Management Information -->
                <td>${user?.optionalFields2?.boolean1 ? 'True' : 'False'}</td> <!-- Sickness / Absence Management -->
                <td>${user?.optionalFields2?.boolean2 ? 'True' : 'False'}</td> <!-- Employee Relations Cases -->
                <td>${user?.optionalFields2?.boolean3 ? 'True' : 'False'}</td> <!-- Reasonable Adjustments -->
                <td>${user?.optionalFields2?.boolean4 ? 'True' : 'False'}</td> <!-- New Parent Support & Leave -->
                <td>${user?.optionalFields2?.date1 ? new Date(user.optionalFields2.date1).toLocaleDateString() : ''}</td> <!-- Last updated -->
            `;
            tableBody.appendChild(row);
        });
    }

    // Sorting functionality
    function enableSortingOld() {
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

    function enableSorting(users) {
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
    
                displayUsers(users); // Update the display with the sorted users
            });
        });
    }

    function getValueForSort(user, sortKey) {
        if (sortKey === 'branch' || sortKey === 'department') {
            return user[sortKey]?.name || 'N/A';
        }
        return user[sortKey] || 'N/A';
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

    // Fetch and display optional tab 1 searchlist 2
    async function getOptionalFields1Searchlist2s() {
        try {
            const response = await fetch(`${BASE_URL}/persons/free_fields/1/searchlists/2`, { headers: { 'Content-Type': 'application/json' } });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            optionalFields1Searchlist2s = await response.json();
            populateDropdown(optionalFields1Searchlist2Select, optionalFields1Searchlist2s);
        } catch (error) {
            console.error('Error fetching optional tab 1 searchlist 2 fields:', error);
        }
    }

    // Populate dropdown options
    function populateDropdown(selectElement, data) {
        data.forEach(item => {
            const option = document.createElement("option");
            option.value = item.name;
            option.text = item.name;
            selectElement.add(option);
        });
    }

    // Apply filters based on selections
    async function applyFilters() {
        const pageSize = pageSizeSelect.value;
        const selectedDepartments = Array.from(departmentSelect.selectedOptions).map(option => option.value);
        const selectedExtraAs = Array.from(extraASelect.selectedOptions).map(option => option.value);
        const selectedExtraBs = Array.from(extraBSelect.selectedOptions).map(option => option.value);
        const selectedOptionalFields1Searchlist1s = Array.from(optionalFields1Searchlist1Select.selectedOptions).map(option => option.value);
        const selectedOptionalFields1Searchlist2s = Array.from(optionalFields1Searchlist2Select.selectedOptions).map(option => option.value);

        const selectedBooleans = Array.from(checkboxes).filter(checkbox => checkbox.checked).map(checkbox => checkbox.id);

        await fetchUsers(
            pageSize,
            selectedDepartments,
            selectedExtraAs,
            selectedExtraBs,
            selectedOptionalFields1Searchlist1s,
            selectedOptionalFields1Searchlist2s,
            selectedBooleans
        );
    }

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

    // Initialize filters and table
    async function initializeFilters() {
        await Promise.all([
            getDepartments(),
            getExtraA(),
            getExtraB(),
            getOptionalFields1Searchlist1s(),
            getOptionalFields1Searchlist2s()
        ]);
        await fetchUsers(); // Initial fetch without filters
    }

    initializeFilters();

    // Event listener for the "Apply Filters" button
    document.getElementById("applyFiltersButton").addEventListener("click", applyFilters);
    pageSizeSelect.addEventListener("change", applyFilters);
});
