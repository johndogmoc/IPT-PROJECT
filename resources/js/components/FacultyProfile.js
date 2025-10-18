import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

const FacultyProfile = () => {
    const navigate = useNavigate();
    const [faculty, setFaculty] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [user, setUser] = useState(null);
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
        position: '',
        department_id: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterPosition, setFilterPosition] = useState('');
    const [dropdownData, setDropdownData] = useState({
        departments: []
    });

    // Using apiCall utility for all API requests

    // Fetch faculty from API
    const fetchFaculty = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (filterDepartment) params.append('department_id', filterDepartment);
            if (filterPosition) params.append('position', filterPosition);

            const data = await apiCall(`/faculty/list?${params}`);

            if (data.success) {
                setFaculty(data.data.data || []);
            } else {
                setError(data.message || 'Failed to fetch faculty');
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
            console.log('FacultyProfile: Fetching dropdown data from:', window.location.pathname);
            const data = await apiCall('/faculty/dropdown-data');

            if (data.success) {
                setDropdownData(data.data);
            } else {
                console.error('FacultyProfile: Dropdown data fetch failed:', data.message);
            }
        } catch (err) {
            console.error('FacultyProfile: Error fetching dropdown data:', err);
        }
    };

    // Add or update faculty
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const url = editingFaculty 
                ? `/faculty/${editingFaculty.faculty_id}/update`
                : '/faculty/create';
            
            const method = editingFaculty ? 'PUT' : 'POST';
            
            const data = await apiCall(url, {
                method: method,
                body: JSON.stringify(formData)
            });

            if (data.success) {
                setSuccess(data.message);
                setShowForm(false);
                setEditingFaculty(null);
                resetForm();
                fetchFaculty();
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

    // Delete faculty
    const handleDelete = async (facultyId) => {
        if (!window.confirm('Are you sure you want to delete this faculty member?')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const data = await apiCall(`/faculty/${facultyId}/delete`, {
                method: 'DELETE'
            });

            if (data.success) {
                setSuccess(data.message);
                fetchFaculty();
            } else {
                setError(data.message || 'Failed to delete faculty member');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Edit faculty
    const handleEdit = (facultyMember) => {
        setEditingFaculty(facultyMember);
        setFormData({
            f_name: facultyMember.f_name || '',
            m_name: facultyMember.m_name || '',
            l_name: facultyMember.l_name || '',
            suffix: facultyMember.suffix || '',
            date_of_birth: facultyMember.date_of_birth || '',
            sex: facultyMember.sex || 'Male',
            phone_number: facultyMember.phone_number || '',
            email_address: facultyMember.email_address || '',
            address: facultyMember.address || '',
            position: facultyMember.position || '',
            department_id: facultyMember.department_id || ''
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
            position: '',
            department_id: ''
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
        setEditingFaculty(null);
        resetForm();
        setError('');
        setSuccess('');
    };

    // Handle profile navigation
    const handleProfileClick = () => {
        navigate('/profile');
    };

    useEffect(() => {
        console.log('FacultyProfile: Component mounted, current path:', window.location.pathname);
        
        // Load user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        
        // Only fetch data if we're on the faculty page
        if (window.location.pathname === '/faculty') {
            console.log('FacultyProfile: On faculty page, fetching data...');
            fetchFaculty();
            fetchDropdownData();
        } else {
            console.log('FacultyProfile: Not on faculty page, skipping data fetch');
        }
    }, []);

    // Refetch when filters change
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchFaculty();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, filterDepartment, filterPosition]);

    return (
        <div className="faculty-profile-component">
            <div className="header">
                <h1 className="mb-0">Faculty Management</h1>
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
                        <div className="col-md-4">
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
                        <div className="col-md-4">
                            <label className="form-label">Filter by Position</label>
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="Enter position..."
                                value={filterPosition}
                                onChange={(e) => setFilterPosition(e.target.value)}
                            />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button 
                                className="btn btn-primary w-100"
                                onClick={() => setShowForm(true)}
                            >
                                <i className="fas fa-plus me-2"></i>Add Faculty
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Faculty Form Modal */}
            {showForm && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingFaculty ? 'Edit Faculty Member' : 'Add New Faculty Member'}
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
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Position *</label>
                                                <input
                                                    type="text"
                                                    name="position"
                                                    className="form-control"
                                                    value={formData.position}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Professor, Assistant Professor"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
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
                                                {editingFaculty ? 'Updating...' : 'Adding...'}
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-save me-2"></i>
                                                {editingFaculty ? 'Update Faculty' : 'Add Faculty'}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Faculty List */}
            <div className="faculty-list">
                <div className="table-container">
                    <h5>Faculty List</h5>
                    {loading ? (
                        <div className="text-center py-4">
                            <i className="fas fa-spinner fa-spin fa-2x"></i>
                            <p>Loading faculty...</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Phone</th>
                                        <th>Position</th>
                                        <th>Department</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {faculty.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-4">
                                                No faculty members found
                                            </td>
                                        </tr>
                                    ) : (
                                        faculty.map(facultyMember => (
                                            <tr key={facultyMember.faculty_id}>
                                                <td>
                                                    {facultyMember.f_name} {facultyMember.m_name} {facultyMember.l_name} {facultyMember.suffix}
                                                </td>
                                                <td>{facultyMember.email_address}</td>
                                                <td>{facultyMember.phone_number}</td>
                                                <td>{facultyMember.position}</td>
                                                <td>{facultyMember.department?.department_name || facultyMember.department_name || 'N/A'}</td>
                                                <td>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary me-1"
                                                        onClick={() => handleEdit(facultyMember)}
                                                    >
                                                        <i className="fas fa-edit"></i>
                                                    </button>
                                                    <button 
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleDelete(facultyMember.faculty_id)}
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

export default FacultyProfile;