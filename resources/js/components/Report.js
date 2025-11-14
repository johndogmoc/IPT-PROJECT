import React, { useEffect, useState, useRef } from 'react';
// apiCall is imported but never used, consider removing if not needed
import { apiCall } from '../utils/api';

const Report = () => {
    const [activeTab, setActiveTab] = useState('student');
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [editingReport, setEditingReport] = useState(null);
    const [viewingReport, setViewingReport] = useState(null);
    const fileInputRef = useRef(null);
    
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
    }, []);

    const loadReports = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/reports/list`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to load reports');
            }
            
            console.log('Loaded reports:', data);
            setReports(data);
        } catch (err) {
            console.error('Error loading reports:', err);
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
            // Automatically set status to 'pending' for new reports
            const reportData = {
                ...formData,
                status: formData.status || 'pending',
                createdAt: new Date().toISOString().split('T')[0]
            };
            
            const response = await fetch('/api/reports/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                body: JSON.stringify(reportData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to create report');
            }
            
            console.log('Report created:', data);
            setSuccess('Report created successfully!');
            setShowModal(false);
            resetForm();
            await loadReports();
        } catch (err) {
            console.error('Error creating report:', err);
            setError('Failed to create report: ' + (err.message || 'Unknown error'));
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

    // Filter reports by active tab
    const filteredReports = reports.filter(report => report.reportType === activeTab);

    const handleView = (report) => {
        setViewingReport(report);
        setShowViewModal(true);
    };

    const handleEdit = (report) => {
        setEditingReport(report);
        setFormData({
            reportType: report.reportType,
            title: report.title,
            description: report.description || '',
            targetId: report.targetId || '',
            targetName: report.targetName,
            dateFrom: report.dateFrom,
            dateTo: report.dateTo,
            status: report.status,
            findings: report.findings || '',
            recommendations: report.recommendations || ''
        });
        setShowEditModal(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`/api/reports/${editingReport.id}/update`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to update report');
            }
            
            setSuccess('Report updated successfully!');
            setShowEditModal(false);
            setEditingReport(null);
            resetForm();
            loadReports();
        } catch (err) {
            console.error('Error updating report:', err);
            setError('Failed to update report: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this report?')) return;
        
        try {
            const response = await fetch(`/api/reports/${id}/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                }
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete report');
            }
            
            setSuccess('Report deleted successfully!');
            loadReports();
        } catch (err) {
            console.error('Error deleting report:', err);
            setError('Failed to delete report: ' + (err.message || 'Unknown error'));
        }
    };

    // Export to Excel
    const exportToExcel = () => {
        try {
            // Use the backend API for export with type filter
            window.open(`/api/reports/export?type=${activeTab}`, '_blank');
            setSuccess(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} reports exported successfully!`);
        } catch (err) {
            setError('Failed to export reports');
        }
    };

    // Export single report
    const exportSingleReport = (report) => {
        try {
            // Use the backend API for export with specific report ID
            window.open(`/api/reports/export?type=${report.reportType}&id=${report.id}`, '_blank');
            setSuccess('Report exported successfully!');
        } catch (err) {
            setError('Failed to export report');
        }
    };

    // Import from Excel/CSV
    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                const importedReports = [];
                for (let i = 1; i < lines.length; i++) {
                    if (!lines[i].trim()) continue;
                    
                    const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
                    const cleanValues = values.map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
                    
                    const report = {};
                    headers.forEach((header, index) => {
                        report[header] = cleanValues[index] || '';
                    });
                    
                    // Map CSV columns to form data
                    const reportTypeRaw = report['Report Type']?.toLowerCase();
                    const mappedReport = {
                        reportType: reportTypeRaw === 'faculty' ? 'faculty' : reportTypeRaw === 'student' ? 'student' : 'general',
                        title: report['Title'] || '',
                        targetName: report['Target Name'] || '',
                        dateFrom: report['Date From'] || '',
                        dateTo: report['Date To'] || '',
                        status: report['Status'] || 'pending',
                        description: report['Description'] || '',
                        findings: report['Findings'] || '',
                        recommendations: report['Recommendations'] || ''
                    };
                    
                    importedReports.push(mappedReport);
                }

                // Import reports via API
                const importPromises = importedReports.map(report => 
                    fetch('/api/reports/create', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        body: JSON.stringify(report)
                    })
                );
                
                await Promise.all(importPromises);
                setSuccess(`Successfully imported ${importedReports.length} report(s)!`);
                setShowImportModal(false);
                loadReports();
            } catch (err) {
                setError('Failed to import file. Please check the format.');
            }
        };
        reader.readAsText(file);
    };

    // Download Excel template
    const downloadTemplate = () => {
        const template = [
            'Report Type,Title,Target Name,Date From,Date To,Status,Description,Findings,Recommendations',
            'Student,Sample Report,John Doe,2024-01-01,2024-06-30,pending,Sample description,Sample findings,Sample recommendations'
        ].join('\n');

        const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'reports_template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSuccess('Template downloaded successfully!');
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


            {/* Reports Table */}
            <div className="card shadow-sm">
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-5">
                            <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
                            <p>Loading reports...</p>
                        </div>
                    ) : filteredReports.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <i className="fas fa-inbox fa-3x mb-3"></i>
                            <p>No {activeTab} reports found. Create your first {activeTab} report!</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Subject</th>
                                        <th>Report Period</th>
                                        <th>Status</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.map(report => (
                                        <tr key={report.id}>
                                            <td>
                                                <strong>{report.title}</strong>
                                            </td>
                                            <td>{report.targetName}</td>
                                            <td>
                                                {new Date(report.dateFrom).toLocaleDateString()} - {new Date(report.dateTo).toLocaleDateString()}
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    report.status === 'completed' ? 'bg-success' : 
                                                    report.status === 'in-progress' ? 'bg-info' : 
                                                    'bg-warning'
                                                }`}>
                                                    {report.status === 'in-progress' ? 'In Progress' : 
                                                     report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                                </span>
                                            </td>
                                            <td>{new Date(report.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-sm btn-info me-2" 
                                                    onClick={() => handleView(report)}
                                                    title="View"
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-primary me-2" 
                                                    onClick={() => handleEdit(report)}
                                                    title="Edit"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(report.id)}
                                                    title="Delete"
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
                                    Create Report
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
                                        
                                        <div className="col-12">
                                            <label className="form-label">Target Name *</label>
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
                                        
                                        <div className="col-12">
                                            <div className="alert alert-info py-2">
                                                <i className="fas fa-info-circle me-2"></i>
                                                <small><strong>Note:</strong> New reports will be created with status: <span className="badge bg-warning">Pending</span></small>
                                            </div>
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

            {/* Import Modal */}
            {showImportModal && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-file-import me-2"></i>
                                    Import Reports from Excel
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowImportModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-info">
                                    <i className="fas fa-sync me-2"></i>
                                    <strong>Excel Sync Instructions:</strong>
                                    <ul className="mb-0 mt-2">
                                        <li><strong>Step 1:</strong> Click "Sync to Excel" to download current reports</li>
                                        <li><strong>Step 2:</strong> Open the CSV file in Microsoft Excel</li>
                                        <li><strong>Step 3:</strong> Edit, add, or modify reports in Excel</li>
                                        <li><strong>Step 4:</strong> Save the file (keep as CSV format)</li>
                                        <li><strong>Step 5:</strong> Upload the modified CSV file below to sync back</li>
                                    </ul>
                                </div>

                                <div className="mb-3">
                                    <button 
                                        className="btn btn-outline-primary w-100 mb-3"
                                        onClick={downloadTemplate}
                                    >
                                        <i className="fas fa-download me-2"></i>
                                        Download Excel Template
                                    </button>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Upload CSV File</label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        className="form-control"
                                        accept=".csv,.xlsx,.xls"
                                        onChange={handleImport}
                                    />
                                    <small className="text-muted">
                                        Supported formats: CSV, Excel (.xlsx, .xls)
                                    </small>
                                </div>

                                <div className="alert alert-warning">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    <strong>Note:</strong> Make sure your Excel file follows the template format exactly.
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => setShowImportModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingReport && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-edit me-2"></i>
                                    Edit {editingReport.reportType === 'student' ? 'Student' : 'Faculty'} Report
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingReport(null);
                                        resetForm();
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleUpdate}>
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
                                                Target Name *
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
                                            <label className="form-label">Status *</label>
                                            <select
                                                className="form-select"
                                                name="status"
                                                value={formData.status}
                                                onChange={handleInputChange}
                                                required
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
                                            setShowEditModal(false);
                                            setEditingReport(null);
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
                                            <><i className="fas fa-spinner fa-spin me-2"></i>Updating...</>
                                        ) : (
                                            <><i className="fas fa-save me-2"></i>Update Report</>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* View Modal */}
            {showViewModal && viewingReport && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fas fa-eye me-2"></i>
                                    View {viewingReport.reportType === 'student' ? 'Student' : 'Faculty'} Report
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setViewingReport(null);
                                    }}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="row g-3">
                                    <div className="col-12">
                                        <div className="card bg-light">
                                            <div className="card-body">
                                                <h6 className="text-muted mb-1">Report Title</h6>
                                                <h4 className="mb-0">{viewingReport.title}</h4>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label text-muted fw-bold">
                                            {viewingReport.reportType === 'student' ? 'Student Name' : 'Faculty Name'}
                                        </label>
                                        <p className="form-control-plaintext">{viewingReport.targetName}</p>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label text-muted fw-bold">Status</label>
                                        <p className="form-control-plaintext">
                                            <span className={`badge ${
                                                viewingReport.status === 'completed' ? 'bg-success' : 
                                                viewingReport.status === 'in-progress' ? 'bg-info' : 
                                                'bg-warning'
                                            }`}>
                                                {viewingReport.status === 'in-progress' ? 'In Progress' : 
                                                 viewingReport.status.charAt(0).toUpperCase() + viewingReport.status.slice(1)}
                                            </span>
                                        </p>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label text-muted fw-bold">Date From</label>
                                        <p className="form-control-plaintext">
                                            {new Date(viewingReport.dateFrom).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    
                                    <div className="col-md-6">
                                        <label className="form-label text-muted fw-bold">Date To</label>
                                        <p className="form-control-plaintext">
                                            {new Date(viewingReport.dateTo).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </p>
                                    </div>
                                    
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-bold">Description</label>
                                        <p className="form-control-plaintext">
                                            {viewingReport.description || <em className="text-muted">No description provided</em>}
                                        </p>
                                    </div>
                                    
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-bold">Findings</label>
                                        <div className="card">
                                            <div className="card-body">
                                                {viewingReport.findings || <em className="text-muted">No findings recorded</em>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-12">
                                        <label className="form-label text-muted fw-bold">Recommendations</label>
                                        <div className="card">
                                            <div className="card-body">
                                                {viewingReport.recommendations || <em className="text-muted">No recommendations provided</em>}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="col-12">
                                        <hr />
                                        <small className="text-muted">
                                            <i className="fas fa-calendar me-2"></i>
                                            Created on: {new Date(viewingReport.createdAt).toLocaleDateString('en-US', { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </small>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setViewingReport(null);
                                    }}
                                >
                                    <i className="fas fa-times me-2"></i>Close
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary"
                                    onClick={() => {
                                        setShowViewModal(false);
                                        setViewingReport(null);
                                        handleEdit(viewingReport);
                                    }}
                                >
                                    <i className="fas fa-edit me-2"></i>Edit Report
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-success"
                                    onClick={() => {
                                        exportSingleReport(viewingReport);
                                    }}
                                >
                                    <i className="fas fa-file-excel me-2"></i>Export to Excel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Report;
