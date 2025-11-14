import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

const StudentProfile = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [formData, setFormData] = useState({
        f_name: '',
        m_name: '',
        l_name: '',
        suffix: '',
        date_of_birth: '',
        sex: 'Male',
        phone_number: '',
        email_address: '',
        address: '',
        status: 'Active',
        department_id: '',
        course_id: '',
        academic_year_id: '',
        year_level: 1
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterCourse, setFilterCourse] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [dropdownData, setDropdownData] = useState({
        departments: [],
        courses: [],
        academic_years: []
    });
    const [user, setUser] = useState(null);

    // Use API utility for all calls

    // Fetch students from API
    const fetchStudents = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterDepartment) params.append('department_id', filterDepartment);
            if (filterCourse) params.append('course_id', filterCourse);
            if (filterStatus) params.append('status', filterStatus);

            const data = await apiCall(`/students/list?${params}`);

            if (data.success) {
                setStudents(data.data.data || []);
            } else {
                setError(data.message || 'Failed to fetch students');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch dropdown data
    const fetchDropdownData = async () => {
        try {
            const data = await apiCall('/students/dropdown-data');

            if (data.success) {
                setDropdownData(data.data);
            } else {
                setError('Failed to load dropdown data');
            }
        } catch (err) {
            setError('Error loading dropdown data');
        }
    };

    // Generate random Learner ID
    const generateLearnerId = () => {
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${timestamp}${random}`;
    };

    // Add or update student
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const url = editingStudent 
                ? `/students/${editingStudent.student_id}/update`
                : '/students/create';
            
            const method = editingStudent ? 'PUT' : 'POST';
            
            const data = await apiCall(url, {
                method: method,
                body: JSON.stringify(formData)
            });

            if (data.success) {
                setSuccess(data.message);
                setShowForm(false);
                setEditingStudent(null);
                resetForm();
                fetchStudents();
            } else {
                setError(data.message || 'Operation failed');
                if (data.errors) {
                    setError(Object.values(data.errors).flat().join(', '));
                }
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Archive student
    const handleArchive = async (studentId) => {
        if (!window.confirm('Are you sure you want to archive this student?')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await apiCall(`/students/${studentId}/archive`, {
                method: 'POST'
            });

            if (data.success) {
                setSuccess('Student archived successfully');
                fetchStudents();
            } else {
                setError(data.message || 'Failed to archive student');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Edit student
    // Calculate age from date of birth
    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Allow editing age directly: derive date_of_birth from entered age
    const handleAgeChange = (e) => {
        const raw = e.target.value;
        const ageNum = parseInt(raw, 10);
        if (!raw) {
            setFormData(prev => ({ ...prev, date_of_birth: '' }));
            return;
        }
        if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
            return;
        }
        const today = new Date();
        const dob = new Date(today.getFullYear() - ageNum, today.getMonth(), today.getDate());
        const yyyy = dob.getFullYear();
        const mm = String(dob.getMonth() + 1).padStart(2, '0');
        const dd = String(dob.getDate()).padStart(2, '0');
        const iso = `${yyyy}-${mm}-${dd}`;
        setFormData(prev => ({ ...prev, date_of_birth: iso }));
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setFormData({
            f_name: student.f_name || '',
            m_name: student.m_name || '',
            l_name: student.l_name || '',
            suffix: student.suffix || '',
            date_of_birth: student.date_of_birth || '',
            sex: student.sex || 'Male',
            phone_number: student.phone_number || '',
            email_address: student.email_address || '',
            address: student.address || '',
            status: student.status || 'Active',
            department_id: student.department_id || '',
            course_id: student.course_id || '',
            academic_year_id: student.academic_year_id || '',
            year_level: student.year_level || 1
        });
        setShowForm(true);
    };

    // Handle opening form for new student
    const handleAddStudent = () => {
        setEditingStudent(null);
        setShowForm(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            f_name: '',
            m_name: '',
            l_name: '',
            suffix: '',
            date_of_birth: '',
            sex: 'Male',
            phone_number: '',
            email_address: '',
            address: '',
            status: 'Active',
            department_id: '',
            course_id: '',
            academic_year_id: '',
            year_level: 1
        });
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Close form
    const handleCloseForm = () => {
        setShowForm(false);
        setEditingStudent(null);
        resetForm();
        setError('');
        setSuccess('');
    };

    // Handle profile navigation
    const handleProfileClick = () => {
        navigate('/profile');
    };

    useEffect(() => {
        // Load user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        
        // Only fetch data if we're on the students page
        if (window.location.pathname === '/students') {
            fetchStudents();
            fetchDropdownData();
        }
    }, []);

    // Refetch when filters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchStudents();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterDepartment, filterCourse, filterStatus]);

    return (
        <div className="student-profile-component">
            <div className="header">
                <h1 className="mb-0">Student Management</h1>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
            )}

            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Filters */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-3">
                            <label className="form-label">Filter by Department</label>
                            <select 
                                className="form-control" 
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                            >
                                <option value="">All Departments</option>
                                {dropdownData.departments.map(dept => (
                                    <option key={dept.department_id} value={dept.department_id}>
                                        {dept.department_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Filter by Course</label>
                            <select 
                                className="form-control" 
                                value={filterCourse}
                                onChange={(e) => setFilterCourse(e.target.value)}
                            >
                                <option value="">All Courses</option>
                                {dropdownData.courses.map(course => (
                                    <option key={course.course_id} value={course.course_id}>
                                        {course.course_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label">Filter by Status</label>
                            <select 
                                className="form-control" 
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Graduated">Graduated</option>
                                <option value="Dropped">Dropped</option>
                            </select>
                        </div>
                        <div className="col-md-3 d-flex align-items-end">
                            <button 
                                className="btn btn-primary w-100"
                                onClick={handleAddStudent}
                            >
                                <i className="fas fa-plus me-2"></i>Add Student
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Student Form Modal */}
            {showForm && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingStudent ? 'Edit Student' : 'Add New Student'}
                                </h5>
                                <button type="button" className="btn-close" onClick={handleCloseForm}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>First Name *</label>
                                                <input
                                                    type="text"
                                                    name="f_name"
                                                    className="form-control"
                                                    value={formData.f_name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Last Name *</label>
                                                <input
                                                    type="text"
                                                    name="l_name"
                                                    className="form-control"
                                                    value={formData.l_name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Middle Name</label>
                                                <input
                                                    type="text"
                                                    name="m_name"
                                                    className="form-control"
                                                    value={formData.m_name}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Suffix</label>
                                                <input
                                                    type="text"
                                                    name="suffix"
                                                    className="form-control"
                                                    value={formData.suffix}
                                                    onChange={handleInputChange}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Date of Birth *</label>
                                                <input
                                                    type="date"
                                                    name="date_of_birth"
                                                    className="form-control"
                                                    value={formData.date_of_birth}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Age</label>
                                                <input
                                                    type="number"
                                                    name="age"
                                                    className="form-control"
                                                    min="1"
                                                    max="120"
                                                    value={formData.date_of_birth ? calculateAge(formData.date_of_birth) : ''}
                                                    onChange={handleAgeChange}
                                                    placeholder="Enter age"
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Sex *</label>
                                                <select
                                                    name="sex"
                                                    className="form-control"
                                                    value={formData.sex}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    name="phone_number"
                                                    className="form-control"
                                                    value={formData.phone_number}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Email Address *</label>
                                                <input
                                                    type="email"
                                                    name="email_address"
                                                    className="form-control"
                                                    value={formData.email_address}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Address *</label>
                                        <textarea
                                            name="address"
                                            className="form-control"
                                            rows="3"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Status *</label>
                                                <select
                                                    name="status"
                                                    className="form-control"
                                                    value={formData.status}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="Active">Active</option>
                                                    <option value="Inactive">Inactive</option>
                                                    <option value="Graduated">Graduated</option>
                                                    <option value="Dropped">Dropped</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Department *</label>
                                                <select
                                                    name="department_id"
                                                    className="form-control"
                                                    value={formData.department_id}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Select Department</option>
                                                    {dropdownData.departments && dropdownData.departments.length > 0 ? (
                                                        dropdownData.departments.map(dept => (
                                                            <option key={dept.department_id} value={dept.department_id}>
                                                                {dept.department_name}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>No departments available - Add in Settings</option>
                                                    )}
                                                </select>
                                                {(!dropdownData.departments || dropdownData.departments.length === 0) && (
                                                    <small className="text-danger">Please add departments in Settings first</small>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Course *</label>
                                                <select
                                                    name="course_id"
                                                    className="form-control"
                                                    value={formData.course_id}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Select Course</option>
                                                    {dropdownData.courses && dropdownData.courses.length > 0 ? (
                                                        dropdownData.courses.map(course => (
                                                            <option key={course.course_id} value={course.course_id}>
                                                                {course.course_name}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>No courses available - Add in Settings</option>
                                                    )}
                                                </select>
                                                {(!dropdownData.courses || dropdownData.courses.length === 0) && (
                                                    <small className="text-danger">Please add courses in Settings first</small>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Academic Year *</label>
                                                <select
                                                    name="academic_year_id"
                                                    className="form-control"
                                                    value={formData.academic_year_id}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Select Academic Year</option>
                                                    {dropdownData.academic_years && dropdownData.academic_years.length > 0 ? (
                                                        dropdownData.academic_years.map(year => (
                                                            <option key={year.academic_year_id} value={year.academic_year_id}>
                                                                {year.school_year}
                                                            </option>
                                                        ))
                                                    ) : (
                                                        <option value="" disabled>No academic years available</option>
                                                    )}
                                                </select>
                                                {(!dropdownData.academic_years || dropdownData.academic_years.length === 0) && (
                                                    <small className="text-danger">Academic years are missing - Contact admin</small>
                                                )}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Year Level *</label>
                                                <select
                                                    name="year_level"
                                                    className="form-control"
                                                    value={formData.year_level}
                                                    onChange={handleInputChange}
                                                    required
                                                >
                                                    <option value="">Select Year Level</option>
                                                    {[1, 2, 3, 4, 5].map(level => (
                                                        <option key={level} value={level}>
                                                            Year {level}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={handleCloseForm}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin me-2"></i>
                                                {editingStudent ? 'Updating...' : 'Adding...'}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>
                                                {editingStudent ? 'Update Student' : 'Add Student'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Students List */}
            <div className="student-list">
                <div className="table-container">
                    <h5>Students List</h5>
                    {loading ? (
                        <div className="text-center py-4">
                            <i className="fas fa-spinner fa-spin fa-2x"></i>
                            <p>Loading students...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th style={{width: '40px'}}><input type="checkbox" /></th>
                                        <th>Students Name</th>
                                        <th>Learner ID</th>
                                        <th>Address</th>
                                        <th>Phone#</th>
                                        <th>Date of Birth</th>
                                        <th>Age</th>
                                        <th>Course Name</th>
                                        <th>Student Year</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan="11" className="text-center py-4">
                                                No students found
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map(student => (
                                            <tr key={student.student_id}>
                                                <td><input type="checkbox" /></td>
                                                <td>
                                                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                        <div style={{width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                            <i className="fas fa-user" style={{color: '#666'}}></i>
                                                        </div>
                                                        <span>{student.f_name} {student.l_name}</span>
                                                    </div>
                                                </td>
                                                <td>{student.student_id}</td>
                                                <td>{student.address || 'N/A'}</td>
                                                <td>{student.phone_number}</td>
                                                <td>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}) : 'N/A'}</td>
                                                <td>{calculateAge(student.date_of_birth)}</td>
                                                <td>{student.course?.course_name || student.course_name || 'N/A'}</td>
                                                <td>{student.year_level ? `${student.year_level}${student.year_level === 1 ? 'st' : student.year_level === 2 ? 'nd' : student.year_level === 3 ? 'rd' : 'th'} Year` : 'N/A'}</td>
                                                <td>
                                                    <span className={`badge ${
                                                        student.status === 'Active' ? 'bg-success' : 
                                                        student.status === 'Inactive' ? 'bg-secondary' : 
                                                        student.status === 'Graduated' ? 'bg-primary' : 
                                                        student.status === 'Suspended' ? 'bg-warning' : 
                                                        student.status === 'Expelled' ? 'bg-danger' : 
                                                        'bg-secondary'
                                                    }`}>
                                                        {student.status || 'Active'}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        onClick={() => handleEdit(student)}
                                                        title="Edit"
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-warning"
                                                        onClick={() => handleArchive(student.student_id)}
                                                        title="Archive"
                                                    >
                                                        <i className="fas fa-archive"></i>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;