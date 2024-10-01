document.addEventListener("DOMContentLoaded", function() {
    const API_URL = "https://demo-uk2.topdesk.net/tas/api/persons";
    const BASE_URL = "https://demo-uk2.topdesk.net/tas/api";

    let users = [];
    let departments = [];    
    let extraAs = [];
    let extraBs = [];

    const pageSizeSelect = document.getElementById("pageSize");
    const departmentSelect = document.getElementById("departmentFilter");
    const extraASelect = document.getElementById("extraAFilter");
    const extraBSelect = document.getElementById("extraBFilter");
    const checkboxes = document.querySelectorAll(".floating-pane input[type='checkbox']");

    // Fetch users with pagination and filters
    async function fetchUsers(pageSize = 50, department = '',extraA = '',extraB = '', optionalFields = []) {
        let query = `branch.name==Delft`;
        
        if (department) {
            query += `;department.name=in=(${department})`;
        }
        if (extraA) {
            query += `;personExtraFieldA.name=in=(${extraA})`;
        }
        if (extraB) {
            query += `;personExtraFieldB.name=in=(${extraB})`;
        }
        
        if (optionalFields.length > 0) {
            optionalFields.forEach(field => {
                query += `;optionalFields1.${field}==true`;
            });
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
        
            if (response.status === 204) {
                users = []; // Set users to an empty array to indicate no data
            } else {
                const data = await response.json();
                users = data;
            }
        
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
                <td>${user ? user.firstName : 'N/A'}</td>
                <td>${user ? user.surName : 'N/A'}</td>
                <td>${user ? user.email : 'N/A'}</td>
                <td>${user && user.branch ? user.branch.name : 'N/A'}</td>
                <td>${user && user.department ? user.department.name : 'N/A'}</td>
                <td>${user && user.personExtraFieldA ? user.personExtraFieldA.name : 'N/A'}</td>
                <td>${user && user.personExtraFieldB ? user.personExtraFieldA.name : 'N/A'}</td>
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
        departmentFilter.appendChild(new Option("Any", ""));
        departments.forEach(department => {
            const newOption = document.createElement("option");
            newOption.value = department.name; // Assuming 'name' is the department name
            newOption.text = department.name;
            departmentFilter.appendChild(newOption);
        });
    }

        // Fetch and display extraA
        async function getExtraA() {
            const URL = BASE_URL + "/personExtraFieldAEntries"; // Use the appropriate API URL
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
                displayExtraA(data);
            } catch (error) {
                console.error('Error fetching ExtraA:', error);
            }
        }
    
        // Function to populate dropdown with ExtraA data
        function displayExtraA(extraAs) {
            const extraAFilter = document.getElementById("extraAFilter");
    
            extraAFilter.innerHTML = ""; 
            extraAFilter.appendChild(new Option("Any", ""));
            extraAs.forEach(extraA => {
                const newOption = document.createElement("option");
                newOption.value = extraA.name; // Assuming 'name' is the department name
                newOption.text = extraA.name;
                extraAFilter.appendChild(newOption);
            });
        }

                // Fetch and display extraA
        async function getExtraA() {
            const URL = BASE_URL + "/personExtraFieldAEntries"; // Use the appropriate API URL
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
                displayExtraA(data);
            } catch (error) {
                console.error('Error fetching ExtraA:', error);
            }
        }
    
        // Function to populate dropdown with ExtraA data
        function displayExtraA(extraAs) {
            const extraAFilter = document.getElementById("extraAFilter");
    
            extraAFilter.innerHTML = ""; 
            extraAFilter.appendChild(new Option("Any", ""));
            extraAs.forEach(extraA => {
                const newOption = document.createElement("option");
                newOption.value = extraA.name; // Assuming 'name' is the department name
                newOption.text = extraA.name;
                extraAFilter.appendChild(newOption);
            });
        }

        // Fetch and display extraB
        async function getExtraB() {
            const URL = BASE_URL + "/personExtraFieldBEntries"; // Use the appropriate API URL
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
                displayExtraB(data);
            } catch (error) {
                console.error('Error fetching ExtraB:', error);
            }
        }
    
        // Function to populate dropdown with ExtraA data
        function displayExtraB(extraBs) {
            const extraBFilter = document.getElementById("extraBFilter");
    
            extraBFilter.innerHTML = ""; 
            extraBFilter.appendChild(new Option("Any", ""));
            extraBs.forEach(extraB => {
                const newOption = document.createElement("option");
                newOption.value = extraB.name; // Assuming 'name' is the department name
                newOption.text = extraB.name;
                extraBFilter.appendChild(newOption);
            });
        }        

    function getValueForSort(user, sortKey) {
        if (sortKey === 'branch' || sortKey === 'department') {
            return user[sortKey] ? user[sortKey].name : 'N/A';
        }
        return user[sortKey] || 'N/A';
    }

    // Gather all filter values and fetch users
    function applyFilters() {
        const pageSize = parseInt(pageSizeSelect.value);
        const department = departmentSelect.value;
        const extraA = extraASelect.value;
        const extraB = extraBSelect.value;
        const optionalFields = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.id);
        fetchUsers(pageSize, department, extraA, extraB, optionalFields);
    }

    // Add event listeners
    pageSizeSelect.addEventListener("change", applyFilters);
    departmentSelect.addEventListener("change", applyFilters);
    extraASelect.addEventListener("change", applyFilters);
    extraBSelect.addEventListener("change", applyFilters);
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener("change", applyFilters);
    });

    fetchUsers(); // Initial fetch with default pageSize=50
    getDepartments();
    getExtraA();
    getExtraB();
});
