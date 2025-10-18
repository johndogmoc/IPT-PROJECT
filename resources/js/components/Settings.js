import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Department Component
const Department = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [formData, setFormData] = useState({ department_name: '', department_head: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const API_BASE = '/api';

    // Fetch departments
    const fetchDepartments = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`${API_BASE}/departments?${params}`);
            const data = await response.json();

            if (data.success) {
                setDepartments(data.data.data || []);
            } else {
                setError(data.message || 'Failed to fetch departments');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Add or update department
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const url = editingDepartment 
                ? `${API_BASE}/departments/${editingDepartment.department_id}`
                : `${API_BASE}/departments`;
            
            const method = editingDepartment ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                setShowForm(false);
                setEditingDepartment(null);
                resetForm();
                fetchDepartments();
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

    // Delete department
    const handleDelete = async (departmentId) => {
        if (!window.confirm('Are you sure you want to archive this department?')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE}/departments/${departmentId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                fetchDepartments();
            } else {
                setError(data.message || 'Failed to archive department');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Edit department
    const handleEdit = (department) => {
        setEditingDepartment(department);
        setFormData({
            department_name: department.department_name || '',
            department_head: department.department_head || ''
        });
        setShowForm(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({ department_name: '', department_head: '' });
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
        setEditingDepartment(null);
        resetForm();
        setError('');
        setSuccess('');
    };

    // Load data on component mount
    useEffect(() => {
        fetchDepartments();
    }, []);

    // Refetch when search changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchDepartments();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <div className="table-container">
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

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Department Management</h5>
                <div className="d-flex gap-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search departments..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{width: '250px'}}
                    />
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <i className="fas fa-plus me-2"></i>Add Department
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card mb-3">
                    <div className="card-header">
                        <h6 className="mb-0">
                            {editingDepartment ? 'Edit Department' : 'Add New Department'}
                        </h6>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Department Name *</label>
                                    <input
                                        type="text"
                                        name="department_name"
                                        className="form-control"
                                        value={formData.department_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Department Head *</label>
                                    <input
                                        type="text"
                                        name="department_head"
                                        className="form-control"
                                        value={formData.department_head}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin me-2"></i>
                                            {editingDepartment ? 'Updating...' : 'Adding...'}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            {editingDepartment ? 'Update Department' : 'Add Department'}
                                        </>
                                    )}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Department Name</th>
                            <th>Department Head</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                    Loading departments...
                                </td>
                            </tr>
                        ) : departments.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    No departments found
                                </td>
                            </tr>
                        ) : (
                            departments.map(department => (
                                <tr key={department.department_id}>
                                    <td>{department.department_name}</td>
                                    <td>{department.department_head}</td>
                                    <td>{new Date(department.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-outline-primary me-1"
                                            onClick={() => handleEdit(department)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(department.department_id)}
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
        </div>
    );
};

// Course Component
const Course = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({ course_name: '', department_id: '' });
    const [searchTerm, setSearchTerm] = useState('');
    const [departments, setDepartments] = useState([]);

    const API_BASE = '/api';

    // Fetch courses
    const fetchCourses = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`${API_BASE}/courses?${params}`);
            const data = await response.json();

            if (data.success) {
                setCourses(data.data.data || []);
            } else {
                setError(data.message || 'Failed to fetch courses');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch departments for dropdown
    const fetchDepartments = async () => {
        try {
            const response = await fetch(`${API_BASE}/courses/dropdown-data`);
            const data = await response.json();

            if (data.success) {
                setDepartments(data.data.departments || []);
            }
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    // Add or update course
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const url = editingCourse 
                ? `${API_BASE}/courses/${editingCourse.course_id}`
                : `${API_BASE}/courses`;
            
            const method = editingCourse ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                setShowForm(false);
                setEditingCourse(null);
                resetForm();
                fetchCourses();
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

    // Delete course
    const handleDelete = async (courseId) => {
        if (!window.confirm('Are you sure you want to archive this course?')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE}/courses/${courseId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                fetchCourses();
            } else {
                setError(data.message || 'Failed to archive course');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Edit course
    const handleEdit = (course) => {
        setEditingCourse(course);
        setFormData({
            course_name: course.course_name || '',
            department_id: course.department_id || ''
        });
        setShowForm(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({ course_name: '', department_id: '' });
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
        setEditingCourse(null);
        resetForm();
        setError('');
        setSuccess('');
    };

    // Load data on component mount
    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    }, []);

    // Refetch when search changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchCourses();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <div className="table-container">
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

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Course Management</h5>
                <div className="d-flex gap-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{width: '250px'}}
                    />
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <i className="fas fa-plus me-2"></i>Add Course
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card mb-3">
                    <div className="card-header">
                        <h6 className="mb-0">
                            {editingCourse ? 'Edit Course' : 'Add New Course'}
                        </h6>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Course Name *</label>
                                    <input
                                        type="text"
                                        name="course_name"
                                        className="form-control"
                                        value={formData.course_name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
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
                                        {departments.map(dept => (
                                            <option key={dept.department_id} value={dept.department_id}>
                                                {dept.department_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin me-2"></i>
                                            {editingCourse ? 'Updating...' : 'Adding...'}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            {editingCourse ? 'Update Course' : 'Add Course'}
                                        </>
                                    )}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Course Name</th>
                            <th>Department</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                    Loading courses...
                                </td>
                            </tr>
                        ) : courses.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-4">
                                    No courses found
                                </td>
                            </tr>
                        ) : (
                            courses.map(course => (
                                <tr key={course.course_id}>
                                    <td>{course.course_name}</td>
                                    <td>{course.department_name}</td>
                                    <td>{new Date(course.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-outline-primary me-1"
                                            onClick={() => handleEdit(course)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(course.course_id)}
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
        </div>
    );
};

// Academic Year Component
const AcademicYear = () => {
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editingAcademicYear, setEditingAcademicYear] = useState(null);
    const [formData, setFormData] = useState({ school_year: '' });
    const [searchTerm, setSearchTerm] = useState('');

    const API_BASE = '/api';

    // Fetch academic years
    const fetchAcademicYears = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);

            const response = await fetch(`${API_BASE}/academic-years?${params}`);
            const data = await response.json();

            if (data.success) {
                setAcademicYears(data.data.data || []);
            } else {
                setError(data.message || 'Failed to fetch academic years');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Add or update academic year
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const url = editingAcademicYear 
                ? `${API_BASE}/academic-years/${editingAcademicYear.academic_year_id}`
                : `${API_BASE}/academic-years`;
            
            const method = editingAcademicYear ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                setShowForm(false);
                setEditingAcademicYear(null);
                resetForm();
                fetchAcademicYears();
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

    // Delete academic year
    const handleDelete = async (academicYearId) => {
        if (!window.confirm('Are you sure you want to archive this academic year?')) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE}/academic-years/${academicYearId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(data.message);
                fetchAcademicYears();
            } else {
                setError(data.message || 'Failed to archive academic year');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    // Edit academic year
    const handleEdit = (academicYear) => {
        setEditingAcademicYear(academicYear);
        setFormData({
            school_year: academicYear.school_year || ''
        });
        setShowForm(true);
    };

    // Reset form
    const resetForm = () => {
        setFormData({ school_year: '' });
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
        setEditingAcademicYear(null);
        resetForm();
        setError('');
        setSuccess('');
    };

    // Load data on component mount
    useEffect(() => {
        fetchAcademicYears();
    }, []);

    // Refetch when search changes
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchAcademicYears();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    return (
        <div className="table-container">
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

            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Academic Year Management</h5>
                <div className="d-flex gap-2">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search academic years..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{width: '250px'}}
                    />
                    <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                        <i className="fas fa-plus me-2"></i>Add Academic Year
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card mb-3">
                    <div className="card-header">
                        <h6 className="mb-0">
                            {editingAcademicYear ? 'Edit Academic Year' : 'Add New Academic Year'}
                        </h6>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>School Year *</label>
                                <input
                                    type="text"
                                    name="school_year"
                                    className="form-control"
                                    value={formData.school_year}
                                    onChange={handleInputChange}
                                    placeholder="e.g., 2024-2025"
                                    required
                                />
                            </div>
                            <div className="d-flex gap-2">
                                <button type="submit" className="btn btn-success" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin me-2"></i>
                                            {editingAcademicYear ? 'Updating...' : 'Adding...'}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-save me-2"></i>
                                            {editingAcademicYear ? 'Update Academic Year' : 'Add Academic Year'}
                                        </>
                                    )}
                                </button>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="table-responsive">
                <table className="table">
                    <thead>
                        <tr>
                            <th>School Year</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="3" className="text-center py-4">
                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                    Loading academic years...
                                </td>
                            </tr>
                        ) : academicYears.length === 0 ? (
                            <tr>
                                <td colSpan="3" className="text-center py-4">
                                    No academic years found
                                </td>
                            </tr>
                        ) : (
                            academicYears.map(academicYear => (
                                <tr key={academicYear.academic_year_id}>
                                    <td>{academicYear.school_year}</td>
                                    <td>{new Date(academicYear.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            className="btn btn-sm btn-outline-primary me-1"
                                            onClick={() => handleEdit(academicYear)}
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button 
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(academicYear.academic_year_id)}
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
        </div>
    );
};

const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('department');
    const [user, setUser] = useState(null);

    const tabs = [
        { id: 'department', name: 'Department', component: Department },
        { id: 'course', name: 'Course', component: Course },
        { id: 'academic-year', name: 'Academic Year', component: AcademicYear }
    ];

    const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

    useEffect(() => {
        // Load user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Handle profile navigation
    const handleProfileClick = () => {
        navigate('/profile');
    };

    return (
        <div className="settings">
            <div className="header">
                <h1 className="mb-0">System Settings</h1>
                <div className="user-menu">
                    <div className="user-profile" onClick={handleProfileClick} style={{cursor: 'pointer'}}>
                        <div className="user-avatar">
                            {user ? user.username.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <span>{user ? user.username : 'Admin'}</span>
                    </div>
                </div>
            </div>

            <div className="settings-content">
                <ul className="nav nav-tabs">
                    {tabs.map(tab => (
                        <li className="nav-item" key={tab.id}>
                            <button
                                className={`nav-link ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={`fas fa-${tab.id === 'department' ? 'building' : tab.id === 'course' ? 'book' : 'calendar'}`}></i>
                                {tab.name}
                            </button>
                        </li>
                    ))}
                </ul>

                <div className="tab-content">
                    <div className="tab-pane active">
                        {ActiveComponent && <ActiveComponent />}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;

