import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

const Settings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('courses');
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCourseForm, setShowCourseForm] = useState(false);
    const [showDepartmentForm, setShowDepartmentForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [editingDepartment, setEditingDepartment] = useState(null);
    
    const [courseFormData, setCourseFormData] = useState({
        course_name: '',
        description: '',
        credits: '',
        department_id: ''
    });

    const [departmentFormData, setDepartmentFormData] = useState({
        department_name: '',
        department_head: ''
    });

    useEffect(() => {
        fetchCourses();
        fetchDepartments();
    }, []);

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/courses/list');
            if (response.success) {
                setCourses(response.data.data || []);
            }
        } catch (err) {
            setError('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        setLoading(true);
        try {
            const response = await apiCall('/departments/list');
            if (response.success) {
                setDepartments(response.data.data || []);
            }
        } catch (err) {
            setError('Failed to load departments');
        } finally {
            setLoading(false);
        }
    };

    const handleCourseSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const url = editingCourse 
                ? `/courses/${editingCourse.course_id}/update`
                : '/courses/create';
            const method = editingCourse ? 'PUT' : 'POST';

            const response = await apiCall(url, {
                method,
                body: JSON.stringify(courseFormData)
            });

            if (response.success) {
                setSuccess(editingCourse ? 'Course updated successfully' : 'Course created successfully');
                setShowCourseForm(false);
                setEditingCourse(null);
                setCourseFormData({ course_name: '', description: '', credits: '', department_id: '' });
                fetchCourses();
            } else {
                setError(response.message || 'Failed to save course');
            }
        } catch (err) {
            setError('Error saving course');
        } finally {
            setLoading(false);
        }
    };

    const handleDepartmentSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const url = editingDepartment 
                ? `/departments/${editingDepartment.department_id}/update`
                : '/departments/create';
            const method = editingDepartment ? 'PUT' : 'POST';

            const response = await apiCall(url, {
                method,
                body: JSON.stringify(departmentFormData)
            });

            if (response.success) {
                setSuccess(editingDepartment ? 'Department updated successfully' : 'Department created successfully');
                setShowDepartmentForm(false);
                setEditingDepartment(null);
                setDepartmentFormData({ department_name: '', department_head: '' });
                fetchDepartments();
            } else {
                setError(response.message || 'Failed to save department');
            }
        } catch (err) {
            setError('Error saving department');
        } finally {
            setLoading(false);
        }
    };

    const handleArchiveCourse = async (courseId) => {
        if (!confirm('Are you sure you want to archive this course?')) return;

        try {
            const response = await apiCall(`/courses/${courseId}/delete`, { method: 'DELETE' });
            if (response.success) {
                setSuccess('Course archived successfully');
                fetchCourses();
            } else {
                setError(response.message || 'Failed to archive course');
            }
        } catch (err) {
            setError('Error archiving course');
        }
    };

    const handleArchiveDepartment = async (departmentId) => {
        if (!confirm('Are you sure you want to archive this department?')) return;

        try {
            const response = await apiCall(`/departments/${departmentId}/delete`, { method: 'DELETE' });
            if (response.success) {
                setSuccess('Department archived successfully');
                fetchDepartments();
            } else {
                setError(response.message || 'Failed to archive department');
            }
        } catch (err) {
            setError('Error archiving department');
        }
    };

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <i className="fas fa-cog me-2 text-primary"></i>
                        Settings
                    </h2>
                    <p className="text-muted mb-0">Manage courses and departments</p>
                </div>
                <button 
                    className="btn btn-secondary"
                    onClick={() => navigate('/dashboard')}
                >
                    <i className="fas fa-arrow-left me-2"></i>Back to Dashboard
                </button>
            </div>

            {/* Alert Messages */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}
            {success && (
                <div className="alert alert-success alert-dismissible fade show">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
            )}

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'courses' ? 'active' : ''}`}
                        onClick={() => setActiveTab('courses')}
                    >
                        <i className="fas fa-book me-2"></i>Courses
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'departments' ? 'active' : ''}`}
                        onClick={() => setActiveTab('departments')}
                    >
                        <i className="fas fa-building me-2"></i>Departments
                    </button>
                </li>
            </ul>

            {/* Courses Tab */}
            {activeTab === 'courses' && (
                <div className="card shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="fas fa-book me-2 text-primary"></i>
                            Courses Management
                        </h5>
                        <button 
                            className="btn btn-primary"
                            onClick={() => {
                                setShowCourseForm(true);
                                setEditingCourse(null);
                                setCourseFormData({ course_name: '', description: '', credits: '', department_id: '' });
                            }}
                        >
                            <i className="fas fa-plus me-2"></i>Add Course
                        </button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Course Name</th>
                                            <th>Department</th>
                                            <th>Credits</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {courses.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center py-4">No courses found</td>
                                            </tr>
                                        ) : (
                                            courses.map(course => (
                                                <tr key={course.course_id}>
                                                    <td>{course.course_name}</td>
                                                    <td>{course.department?.department_name || 'N/A'}</td>
                                                    <td>{course.credits}</td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                            onClick={() => {
                                                                setEditingCourse(course);
                                                                setCourseFormData({
                                                                    course_name: course.course_name,
                                                                    description: course.description || '',
                                                                    credits: course.credits,
                                                                    department_id: course.department_id
                                                                });
                                                                setShowCourseForm(true);
                                                            }}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-warning"
                                                            onClick={() => handleArchiveCourse(course.course_id)}
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
            )}

            {/* Departments Tab */}
            {activeTab === 'departments' && (
                <div className="card shadow-sm">
                    <div className="card-header bg-white d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <i className="fas fa-building me-2 text-primary"></i>
                            Departments Management
                        </h5>
                        <button 
                            className="btn btn-primary"
                            onClick={() => {
                                setShowDepartmentForm(true);
                                setEditingDepartment(null);
                                setDepartmentFormData({ department_name: '', department_head: '' });
                            }}
                        >
                            <i className="fas fa-plus me-2"></i>Add Department
                        </button>
                    </div>
                    <div className="card-body">
                        {loading ? (
                            <div className="text-center py-4">
                                <div className="spinner-border text-primary"></div>
                            </div>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Department Name</th>
                                            <th>Department Head</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {departments.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center py-4">No departments found</td>
                                            </tr>
                                        ) : (
                                            departments.map(dept => (
                                                <tr key={dept.department_id}>
                                                    <td>{dept.department_name}</td>
                                                    <td>{dept.department_head || 'N/A'}</td>
                                                    <td>
                                                        <button 
                                                            className="btn btn-sm btn-outline-primary me-1"
                                                            onClick={() => {
                                                                setEditingDepartment(dept);
                                                                setDepartmentFormData({
                                                                    department_name: dept.department_name,
                                                                    department_head: dept.department_head || ''
                                                                });
                                                                setShowDepartmentForm(true);
                                                            }}
                                                        >
                                                            <i className="fas fa-edit"></i>
                                                        </button>
                                                        <button 
                                                            className="btn btn-sm btn-outline-warning"
                                                            onClick={() => handleArchiveDepartment(dept.department_id)}
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
            )}

            {/* Course Form Modal */}
            {showCourseForm && (
                <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingCourse ? 'Edit Course' : 'Add New Course'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowCourseForm(false)}></button>
                            </div>
                            <form onSubmit={handleCourseSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Course Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={courseFormData.course_name}
                                            onChange={(e) => setCourseFormData({...courseFormData, course_name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Department</label>
                                        <select
                                            className="form-select"
                                            value={courseFormData.department_id}
                                            onChange={(e) => setCourseFormData({...courseFormData, department_id: e.target.value})}
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
                                    <div className="mb-3">
                                        <label className="form-label">Credits</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={courseFormData.credits}
                                            onChange={(e) => setCourseFormData({...courseFormData, credits: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Description</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={courseFormData.description}
                                            onChange={(e) => setCourseFormData({...courseFormData, description: e.target.value})}
                                        ></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowCourseForm(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Saving...' : (editingCourse ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Department Form Modal */}
            {showDepartmentForm && (
                <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingDepartment ? 'Edit Department' : 'Add New Department'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowDepartmentForm(false)}></button>
                            </div>
                            <form onSubmit={handleDepartmentSubmit}>
                                <div className="modal-body">
                                    <div className="mb-3">
                                        <label className="form-label">Department Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={departmentFormData.department_name}
                                            onChange={(e) => setDepartmentFormData({...departmentFormData, department_name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Department Head</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={departmentFormData.department_head}
                                            onChange={(e) => setDepartmentFormData({...departmentFormData, department_head: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={() => setShowDepartmentForm(false)}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={loading}>
                                        {loading ? 'Saving...' : (editingDepartment ? 'Update' : 'Create')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
