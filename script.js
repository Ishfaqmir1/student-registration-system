// DOM Elements
const studentForm = document.getElementById('studentForm');
const recordsBody = document.getElementById('recordsBody');
const emptyState = document.getElementById('emptyState');
const recordCount = document.getElementById('recordCount');
const searchInput = document.getElementById('searchInput');
const clearAllBtn = document.getElementById('clearAllBtn');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const confirmationModal = document.getElementById('confirmationModal');
const cancelDeleteBtn = document.getElementById('cancelDelete');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const toast = document.getElementById('toast');

// Variables to track current operation
let currentOperation = 'create'; // 'create' or 'edit'
let editIndex = null;
let students = JSON.parse(localStorage.getItem('students')) || [];
let studentToDelete = null;

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    displayStudents();
    updateRecordCount();
});

// Form submission handler
studentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const student = {
        name: document.getElementById('studentName').value.trim(),
        id: document.getElementById('studentID').value.trim(),
        email: document.getElementById('email').value.trim(),
        contact: document.getElementById('contactNo').value.trim()
    };
    
    // Validate inputs
    if (!validateForm(student)) return;
    
    if (currentOperation === 'create') {
        addStudent(student);
    } else {
        updateStudent(student);
    }
    
    resetForm();
});

// Cancel edit operation
cancelBtn.addEventListener('click', resetForm);

// Search functionality
searchInput.addEventListener('input', function() {
    displayStudents(this.value.toLowerCase());
});

// Clear all records
clearAllBtn.addEventListener('click', function() {
    if (students.length > 0) {
        showConfirmationModal(null, () => {
            students = [];
            localStorage.setItem('students', JSON.stringify(students));
            displayStudents();
            updateRecordCount();
            showToast('All records cleared!', 'warning');
        });
    }
});

// Modal handlers
cancelDeleteBtn.addEventListener('click', () => {
    confirmationModal.classList.remove('active');
    studentToDelete = null;
});

confirmDeleteBtn.addEventListener('click', () => {
    if (studentToDelete !== null) {
        // Delete single record
        students.splice(studentToDelete, 1);
        showToast('Student record deleted!', 'warning');
    } else {
        // Clear all records
        students = [];
        showToast('All records cleared!', 'warning');
    }
    
    localStorage.setItem('students', JSON.stringify(students));
    displayStudents();
    updateRecordCount();
    confirmationModal.classList.remove('active');
    studentToDelete = null;
});

// Function to add a new student
function addStudent(student) {
    students.push(student);
    localStorage.setItem('students', JSON.stringify(students));
    displayStudents();
    updateRecordCount();
    showToast('Student registered successfully!', 'success');
}

// Function to update an existing student
function updateStudent(student) {
    students[editIndex] = student;
    localStorage.setItem('students', JSON.stringify(students));
    displayStudents();
    updateRecordCount();
    showToast('Student record updated!', 'success');
}

// Function to display students (with optional search filter)
function displayStudents(searchTerm = '') {
    recordsBody.innerHTML = '';
    
    const filteredStudents = searchTerm 
        ? students.filter(student => 
            student.name.toLowerCase().includes(searchTerm) || 
            student.id.toLowerCase().includes(searchTerm) ||
            student.email.toLowerCase().includes(searchTerm) ||
            student.contact.toLowerCase().includes(searchTerm))
        : students;
    
    if (filteredStudents.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        filteredStudents.forEach((student, index) => {
            const tr = document.createElement('tr');
            tr.className = 'student-record';
            tr.innerHTML = `
                <td>${student.name}</td>
                <td>${student.id}</td>
                <td>${student.email}</td>
                <td>${student.contact}</td>
                <td>
                    <button onclick="editStudent(${students.indexOf(student)})" class="action-btn edit-btn">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteStudent(${students.indexOf(student)})" class="action-btn delete-btn">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            recordsBody.appendChild(tr);
        });
    }
}

// Function to edit a student
function editStudent(index) {
    const student = students[index];
    document.getElementById('studentName').value = student.name;
    document.getElementById('studentID').value = student.id;
    document.getElementById('email').value = student.email;
    document.getElementById('contactNo').value = student.contact;
    
    currentOperation = 'edit';
    editIndex = index;
    
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Student';
    cancelBtn.style.display = 'block';
    
    // Scroll to form
    document.querySelector('#studentForm').scrollIntoView({ behavior: 'smooth' });
}

// Function to delete a student
function deleteStudent(index) {
    showConfirmationModal(index, () => {
        students.splice(index, 1);
        localStorage.setItem('students', JSON.stringify(students));
        displayStudents();
        updateRecordCount();
        showToast('Student record deleted!', 'warning');
    });
}

// Function to show confirmation modal
function showConfirmationModal(index, callback) {
    studentToDelete = index;
    confirmationModal.classList.add('active');
    
    // Set up one-time event listener for confirmation
    const confirmHandler = () => {
        callback();
        confirmDeleteBtn.removeEventListener('click', confirmHandler);
    };
    
    confirmDeleteBtn.addEventListener('click', confirmHandler);
}

// Function to reset the form
function resetForm() {
    studentForm.reset();
    currentOperation = 'create';
    editIndex = null;
    
    submitBtn.innerHTML = '<i class="fas fa-save"></i> Register Student';
    cancelBtn.style.display = 'none';
    
    // Reset validation styles
    document.querySelectorAll('.validation-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('valid-input', 'invalid-input');
    });
}

// Function to update the record count display
function updateRecordCount() {
    const count = students.length;
    recordCount.textContent = `${count} student${count !== 1 ? 's' : ''} registered`;
    clearAllBtn.style.display = count > 0 ? 'block' : 'none';
}

// Function to validate form inputs
function validateForm(student) {
    let isValid = true;
    
    // Reset previous validations
    document.querySelectorAll('.validation-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(input => {
        input.classList.remove('valid-input', 'invalid-input');
    });
    
    // Name validation (letters and spaces only)
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!student.name) {
        document.getElementById('nameValidation').textContent = 'Name is required';
        document.getElementById('studentName').classList.add('invalid-input');
        isValid = false;
    } else if (!nameRegex.test(student.name)) {
        document.getElementById('nameValidation').textContent = 'Name can only contain letters and spaces';
        document.getElementById('studentName').classList.add('invalid-input');
        isValid = false;
    } else {
        document.getElementById('studentName').classList.add('valid-input');
    }
    
    // ID validation (numbers only)
    const idRegex = /^\d+$/;
    if (!student.id) {
        document.getElementById('idValidation').textContent = 'ID is required';
        document.getElementById('studentID').classList.add('invalid-input');
        isValid = false;
    } else if (!idRegex.test(student.id)) {
        document.getElementById('idValidation').textContent = 'ID can only contain numbers';
        document.getElementById('studentID').classList.add('invalid-input');
        isValid = false;
    } else {
        document.getElementById('studentID').classList.add('valid-input');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!student.email) {
        document.getElementById('emailValidation').textContent = 'Email is required';
        document.getElementById('email').classList.add('invalid-input');
        isValid = false;
    } else if (!emailRegex.test(student.email)) {
        document.getElementById('emailValidation').textContent = 'Please enter a valid email';
        document.getElementById('email').classList.add('invalid-input');
        isValid = false;
    } else {
        document.getElementById('email').classList.add('valid-input');
    }
    
    // Contact validation (numbers only, 10 digits)
    const contactRegex = /^\d{10}$/;
    if (!student.contact) {
        document.getElementById('contactValidation').textContent = 'Contact number is required';
        document.getElementById('contactNo').classList.add('invalid-input');
        isValid = false;
    } else if (!contactRegex.test(student.contact)) {
        document.getElementById('contactValidation').textContent = 'Contact must be 10 digits';
        document.getElementById('contactNo').classList.add('invalid-input');
        isValid = false;
    } else {
        document.getElementById('contactNo').classList.add('valid-input');
    }
    
    return isValid;
}

// Function to show toast notifications
function showToast(message, type) {
    toast.textContent = message;
    toast.className = 'toast show ' + type;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Make functions available in global scope for inline event handlers
window.editStudent = editStudent;
window.deleteStudent = deleteStudent;
