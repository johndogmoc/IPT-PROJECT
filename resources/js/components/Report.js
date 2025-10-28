import React, { useEffect, useState } from 'react';
import { apiCall } from '../utils/api';

const Report = () => {
    const [activeTab, setActiveTab] = useState('student');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    
    const [formData, setFormData] = useState({
        reportType: 'student',
        title: '',
        description: '',
        targetId: '',
        targetName: '',
        dateFrom: '',
        dateTo: '',
        status: 'pending',
        findings: '',
        recommendations: ''
    });

    useEffect(() => {
        loadReports();
    }, [activeTab]);

    const loadReports = async () => {
        setLoading(true);
        setError('');
        try {
            // Mock data - replace with actual API call when backend is ready
            const mockReports = [
                {
                    id: 1,
                    reportType: 'student',
                    title: 'Academic Performance Report',
                    targetName: 'John Doe',
                    dateFrom: '2024-01-01',
                    dateTo: '2024-06-30',
                    status: 'completed',
                    createdAt: '2024-06-30'
                },
                {
                    id: 2,
                    reportType: 'faculty',
                    title: 'Teaching Evaluation',
                    targetName: 'Dr. Jane Smith',
                    dateFrom: '2024-01-01',
                    dateTo: '2024-06-30',
                    status: 'pending',
                    createdAt: '2024-07-01'
                }
            ];
            
            const filtered = mockReports.filter(r => r.reportType === activeTab);
            setReports(filtered);
        } catch (err) {
            setError('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Mock save - replace with actual API call
            console.log('Saving report:', formData);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));
            
            setSuccess('Report created successfully!');
            setShowModal(false);
            resetForm();
            loadReports();
        } catch (err) {
            setError('Failed to create report');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            reportType: activeTab,
            title: '',
            description: '',
            targetId: '',
            targetName: '',
            dateFrom: '',
            dateTo: '',
            status: 'pending',
            findings: '',
            recommendations: ''
        });
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this report?')) return;
        
        try {
            // Mock delete - replace with actual API call
            console.log('Deleting report:', id);
            setSuccess('Report deleted successfully!');
            loadReports();
        } catch (err) {
            setError('Failed to delete report');
        }
    };

    return (
        <div className="container-fluid py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2><i className="fas fa-file-alt me-2"></i>Reports Management</h2>
                <button 
                    className="btn btn-primary"
                    onClick={() => {
                        setFormData({...formData, reportType: activeTab});
                        setShowModal(true);
                    }}
                >
                    <i className="fas fa-plus me-2"></i>Create New Report
                </button>
            </div>

            {/* Alerts */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}
            {success && (
                <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="fas fa-check-circle me-2"></i>
                    {success}
                    <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
                </div>
            )}

            {/* Tabs */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'student' ? 'active' : ''}`}
                        onClick={() => setActiveTab('student')}
                    >
                        <i className="fas fa-user-graduate me-2"></i>Student Reports
                    </button>
                </li>
                <li className="nav-item">
                    <button 
                        className={`nav-link ${activeTab === 'faculty' ? 'active' : ''}`}
                        onClick={() => setActiveTab('faculty')}
                    >
                        <i className="fas fa-chalkboard-teacher me-2"></i>Faculty Reports
                    </button>
                </li>
            </ul>

            {/* Reports Table */}
            <div className="card shadow-sm">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
                            <p>Loading reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-inbox fa-3x mb-3"></i>
                            <p>No reports found. Create your first {activeTab} report!</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Target</th>
                                        <th>Period</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map(report => (
                                        <tr key={report.id}>
                                            <td>
                                                <strong>{report.title}</strong>
                                            </td>
                                            <td>{report.targetName}</td>
                                            <td>
                                                {new Date(report.dateFrom).toLocaleDateString()} - {new Date(report.dateTo).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <span className={`badge ${report.status === 'completed' ? 'bg-success' : 'bg-warning'}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button className="btn btn-sm btn-info me-2">
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button className="btn btn-sm btn-primary me-2">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(report.id)}
                                                >
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-file-alt me-2"></i>
                                    Create {activeTab === 'student' ? 'Student' : 'Faculty'} Report
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label">Report Title *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="e.g., Academic Performance Report"
                                            />
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <label className="form-label">
                                                {activeTab === 'student' ? 'Student Name' : 'Faculty Name'} *
                                            </label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                name="targetName"
                                                value={formData.targetName}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="Enter name"
                                            />
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <label className="form-label">Status</label>
                                            <select
                                                className="form-select"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="completed">Completed</option>
                                            </select>
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <label className="form-label">Date From *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="dateFrom"
                                                value={formData.dateFrom}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="col-md-6">
                                            <label className="form-label">Date To *</label>
                                            <input
                                                type="date"
                                                className="form-control"
                                                name="dateTo"
                                                value={formData.dateTo}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>
                                        
                                        <div className="col-12">
                                            <label className="form-label">Description</label>
                                            <textarea
                                                className="form-control"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                                rows="3"
                                                placeholder="Brief description of the report"
                                            ></textarea>
                                        </div>
                                        
                                        <div className="col-12">
                                            <label className="form-label">Findings</label>
                                            <textarea
                                                className="form-control"
                                                name="findings"
                                                value={formData.findings}
                                                onChange={handleInputChange}
                                                rows="4"
                                                placeholder="Key findings and observations"
                                            ></textarea>
                                        </div>
                                        
                                        <div className="col-12">
                                            <label className="form-label">Recommendations</label>
                                            <textarea
                                                className="form-control"
                                                name="recommendations"
                                                value={formData.recommendations}
                                                onChange={handleInputChange}
                                                rows="4"
                                                placeholder="Recommendations and action items"
                                            ></textarea>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowModal(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <><i className="fas fa-spinner fa-spin me-2"></i>Saving...</>
                                        ) : (
                                            <><i className="fas fa-save me-2"></i>Save Report</>
                                        )}
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

export default Report;
