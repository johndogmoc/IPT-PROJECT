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

            const data = await apiCall(`/students?${params}`);

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
            }
        } catch (err) {
            console.error('Error fetching dropdown data:', err);
        }
    };

    // Add or update student
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const url = editingStudent 
                ? `/students/${editingStudent.student_id}`
                : '/students';
            
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

    // Delete student
    const handleDelete = async (studentId) => {
        if (!window.confirm('Are you sure you want to delete this student?')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await apiCall(`/students/${studentId}`, {
                method: 'DELETE'
            });

            if (data.success) {
                setSuccess(data.message);
                fetchStudents();
            } else {
                setError(data.message || 'Failed to delete student');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Edit student
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

    // Load data on component mount
    useEffect(() => {
        // Load user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        
        fetchStudents();
        fetchDropdownData();
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
                <div className="user-menu">
                    <div className="user-profile" onClick={handleProfileClick} style={{cursor: 'pointer'}}>
                        <div className="user-avatar">
                            {user ? user.username.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <span>{user ? user.username : 'Admin'}</span>
                    </div>
                </div>
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
                                onClick={() => setShowForm(true)}
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
                                        <div className="col-md-6">
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
                                        <div className="col-md-6">
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
                                                    {dropdownData.departments.map(dept => (
                                                        <option key={dept.department_id} value={dept.department_id}>
                                                            {dept.department_name}
                                                        </option>
                                                    ))}
                                                </select>
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
                                                    {dropdownData.courses.map(course => (
                                                        <option key={course.course_id} value={course.course_id}>
                                                            {course.course_name}
                                                        </option>
                                                    ))}
                                                </select>
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
                                                    {dropdownData.academic_years.map(year => (
                                                        <option key={year.academic_year_id} value={year.academic_year_id}>
                                                            {year.school_year}
                                                        </option>
                                                    ))}
                                                </select>
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
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Department</th>
                                        <th>Course</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-4">
                                                No students found
                                            </td>
                                        </tr>
                                    ) : (
                                        students.map(student => (
                                            <tr key={student.student_id}>
                                                <td>
                                                    {student.f_name} {student.m_name} {student.l_name} {student.suffix}
                                                </td>
                                                <td>{student.email_address}</td>
                                                <td>{student.phone_number}</td>
                                                <td>{student.department_name}</td>
                                                <td>{student.course_name}</td>
                                                <td>
                                                    <span className={`status-badge status-${student.status.toLowerCase()}`}>
                                                        {student.status}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        onClick={() => handleEdit(student)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(student.student_id)}
                                                    >
                                                        <i className="fas fa-trash"></i>
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