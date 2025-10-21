import React, { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';

const Archive = () => {
    const [activeTab, setActiveTab] = useState('students');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [archived, setArchived] = useState({
        students: [],
        faculty: [],
        courses: [],
        departments: []
    });

    const fetchArchived = async (tab) => {
        setLoading(true);
        setError('');
        try {
            const endpointMap = {
                students: '/archive/students',
                faculty: '/archive/faculty',
                courses: '/archive/courses',
                departments: '/archive/departments'
            };
            const endpoint = endpointMap[tab];
            const res = await apiCall(endpoint);
            if (res.success) {
                setArchived(prev => ({ ...prev, [tab]: res.data || [] }));
            } else {
                setError(res.message || 'Failed to load archived data');
            }
        } catch (e) {
            setError('Network error loading archived data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchArchived(activeTab);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab]);

    const handleRestore = async (tab, id) => {
        if (!confirm('Restore this record?')) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const endpointMap = {
                students: `/archive/students/${id}/restore`,
                faculty: `/archive/faculty/${id}/restore`,
                courses: `/archive/courses/${id}/restore`,
                departments: `/archive/departments/${id}/restore`
            };
            const endpoint = endpointMap[tab];
            const res = await apiCall(endpoint, { method: 'POST' });
            if (res.success) {
                setSuccess(res.message || 'Restored successfully');
                fetchArchived(tab);
            } else {
                setError(res.message || 'Failed to restore');
            }
        } catch (e) {
            setError('Network error while restoring');
        } finally {
            setLoading(false);
        }
    };

    const handlePermanentDelete = async (tab, id) => {
        if (!confirm('Permanently delete this record? This cannot be undone.')) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const endpointMap = {
                students: `/archive/students/${id}/permanent-delete`,
                faculty: `/archive/faculty/${id}/permanent-delete`,
                courses: `/archive/courses/${id}/permanent-delete`,
                departments: `/archive/departments/${id}/permanent-delete`
            };
            const endpoint = endpointMap[tab];
            const res = await apiCall(endpoint, { method: 'DELETE' });
            if (res.success) {
                setSuccess(res.message || 'Deleted permanently');
                fetchArchived(tab);
            } else {
                setError(res.message || 'Failed to delete permanently');
            }
        } catch (e) {
            setError('Network error while deleting');
        } finally {
            setLoading(false);
        }
    };

    const TabButton = ({ id, icon, label }) => (
        <button
            className={`btn ${activeTab === id ? 'btn-primary' : 'btn-light'} me-2`}
            onClick={() => setActiveTab(id)}
        >
            <i className={`${icon} me-2`}></i>{label}
        </button>
    );

    const StudentsTable = () => (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead className="table-light">
                    <tr>
                        <th>Name</th>
                        <th>Course</th>
                        <th>Department</th>
                        <th>Deleted At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {archived.students.length === 0 ? (
                        <tr><td colSpan="5" className="text-center py-4">No archived students</td></tr>
                    ) : (
                        archived.students.map(s => (
                            <tr key={s.student_id}>
                                <td>{`${s.f_name} ${s.m_name ? s.m_name + ' ' : ''}${s.l_name}`}</td>
                                <td>{s.course?.course_name || 'N/A'}</td>
                                <td>{s.department?.department_name || 'N/A'}</td>
                                <td>{s.deleted_at ? new Date(s.deleted_at).toLocaleString() : '—'}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleRestore('students', s.student_id)}>
                                        <i className="fas fa-undo"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handlePermanentDelete('students', s.student_id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const FacultyTable = () => (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead className="table-light">
                    <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Deleted At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {archived.faculty.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-4">No archived faculty</td></tr>
                    ) : (
                        archived.faculty.map(f => (
                            <tr key={f.faculty_id}>
                                <td>{`${f.f_name} ${f.m_name ? f.m_name + ' ' : ''}${f.l_name}`}</td>
                                <td>{f.department?.department_name || 'N/A'}</td>
                                <td>{f.deleted_at ? new Date(f.deleted_at).toLocaleString() : '—'}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleRestore('faculty', f.faculty_id)}>
                                        <i className="fas fa-undo"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handlePermanentDelete('faculty', f.faculty_id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const CoursesTable = () => (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead className="table-light">
                    <tr>
                        <th>Course</th>
                        <th>Department</th>
                        <th>Deleted At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {archived.courses.length === 0 ? (
                        <tr><td colSpan="4" className="text-center py-4">No archived courses</td></tr>
                    ) : (
                        archived.courses.map(c => (
                            <tr key={c.course_id}>
                                <td>{c.course_name}</td>
                                <td>{c.department?.department_name || 'N/A'}</td>
                                <td>{c.deleted_at ? new Date(c.deleted_at).toLocaleString() : '—'}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleRestore('courses', c.course_id)}>
                                        <i className="fas fa-undo"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handlePermanentDelete('courses', c.course_id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    const DepartmentsTable = () => (
        <div className="table-responsive">
            <table className="table table-hover">
                <thead className="table-light">
                    <tr>
                        <th>Department</th>
                        <th>Deleted At</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {archived.departments.length === 0 ? (
                        <tr><td colSpan="3" className="text-center py-4">No archived departments</td></tr>
                    ) : (
                        archived.departments.map(d => (
                            <tr key={d.department_id}>
                                <td>{d.department_name}</td>
                                <td>{d.deleted_at ? new Date(d.deleted_at).toLocaleString() : '—'}</td>
                                <td>
                                    <button className="btn btn-sm btn-outline-success me-1" onClick={() => handleRestore('departments', d.department_id)}>
                                        <i className="fas fa-undo"></i>
                                    </button>
                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handlePermanentDelete('departments', d.department_id)}>
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1">
                        <i className="fas fa-archive me-2 text-primary"></i>
                        Archive Management
                    </h2>
                    <p className="text-muted mb-0">View and restore archived records</p>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger mb-3">
                    <i className="fas fa-exclamation-triangle me-2"></i>{error}
                </div>
            )}
            {success && (
                <div className="alert alert-success mb-3">
                    <i className="fas fa-check me-2"></i>{success}
                </div>
            )}

            <div className="mb-3">
                <TabButton id="students" icon="fas fa-user-graduate" label="Students" />
                <TabButton id="faculty" icon="fas fa-chalkboard-teacher" label="Faculty" />
                <TabButton id="courses" icon="fas fa-book" label="Courses" />
                <TabButton id="departments" icon="fas fa-building" label="Departments" />
            </div>

            <div className="card">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary"></div>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'students' && <StudentsTable />}
                            {activeTab === 'faculty' && <FacultyTable />}
                            {activeTab === 'courses' && <CoursesTable />}
                            {activeTab === 'departments' && <DepartmentsTable />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Archive;
