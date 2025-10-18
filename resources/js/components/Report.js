import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Report = () => {
    const navigate = useNavigate();
    const [reportType, setReportType] = useState('students');
    const [filters, setFilters] = useState({
        course: '',
        department: '',
        academicYear: '',
        status: '',
        dateFrom: '',
        dateTo: ''
    });

    const [reports, setReports] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [user, setUser] = useState(null);

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

    const courses = [
        { id: 1, name: 'Computer Science' },
        { id: 2, name: 'Business Administration' },
        { id: 3, name: 'Nursing' },
        { id: 4, name: 'Engineering' }
    ];

    const departments = [
        { id: 1, name: 'Computer Science' },
        { id: 2, name: 'Business' },
        { id: 3, name: 'Health Sciences' },
        { id: 4, name: 'Engineering' }
    ];

    const academicYears = [
        { id: 1, year: '2023-2024' },
        { id: 2, year: '2024-2025' },
        { id: 3, year: '2025-2026' }
    ];

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const generateReport = async () => {
        setIsGenerating(true);
        
        // Simulate API call
        setTimeout(() => {
            const mockReport = {
                id: Date.now(),
                type: reportType,
                filters: { ...filters },
                generatedAt: new Date().toISOString(),
                data: generateMockData()
            };
            
            setReports(prev => [mockReport, ...prev]);
            setIsGenerating(false);
        }, 2000);
    };

    const generateMockData = () => {
        if (reportType === 'students') {
            return [
                { id: 'STU001', name: 'John Doe', course: 'Computer Science', department: 'Computer Science', year: '2023-2024', status: 'Active' },
                { id: 'STU002', name: 'Jane Smith', course: 'Business Administration', department: 'Business', year: '2023-2024', status: 'Active' },
                { id: 'STU003', name: 'Mike Johnson', course: 'Nursing', department: 'Health Sciences', year: '2024-2025', status: 'Graduated' },
                { id: 'STU004', name: 'Sarah Wilson', course: 'Engineering', department: 'Engineering', year: '2023-2024', status: 'Active' }
            ];
        } else {
            return [
                { id: 'FAC001', name: 'Dr. Robert Brown', department: 'Computer Science', position: 'Professor', email: 'r.brown@university.edu' },
                { id: 'FAC002', name: 'Prof. Lisa Davis', department: 'Business', position: 'Associate Professor', email: 'l.davis@university.edu' },
                { id: 'FAC003', name: 'Dr. Mark Taylor', department: 'Health Sciences', position: 'Professor', email: 'm.taylor@university.edu' },
                { id: 'FAC004', name: 'Prof. Anna Garcia', department: 'Engineering', position: 'Assistant Professor', email: 'a.garcia@university.edu' }
            ];
        }
    };

    const exportReport = (reportId) => {
        const report = reports.find(r => r.id === reportId);
        if (report) {
            const dataStr = JSON.stringify(report.data, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${reportType}_report_${reportId}.json`;
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <div className="report">
            <div className="header">
                <h1 className="mb-0">Reports</h1>
                <div className="user-menu">
                    <div className="user-profile" onClick={handleProfileClick} style={{cursor: 'pointer'}}>
                        <div className="user-avatar">
                            {user ? user.username.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <span>{user ? user.username : 'Admin'}</span>
                    </div>
                </div>
            </div>

            <div className="report-content">
                <div className="row">
                    <div className="col-md-4">
                        <div className="table-container">
                            <h5 className="mb-3">Generate Report</h5>
                            
                            <div className="form-group mb-3">
                                <label htmlFor="reportType">Report Type</label>
                                <select
                                    id="reportType"
                                    name="reportType"
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="form-control"
                                >
                                    <option value="students">Students Report</option>
                                    <option value="faculty">Faculty Report</option>
                                </select>
                            </div>

                            {reportType === 'students' ? (
                                <>
                                    <div className="form-group mb-3">
                                        <label htmlFor="course">Filter by Course</label>
                                        <select
                                            id="course"
                                            name="course"
                                            value={filters.course}
                                            onChange={handleFilterChange}
                                            className="form-control"
                                        >
                                            <option value="">All Courses</option>
                                            {courses.map(course => (
                                                <option key={course.id} value={course.name}>
                                                    {course.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label htmlFor="department">Filter by Department</label>
                                        <select
                                            id="department"
                                            name="department"
                                            value={filters.department}
                                            onChange={handleFilterChange}
                                            className="form-control"
                                        >
                                            <option value="">All Departments</option>
                                            {departments.map(dept => (
                                                <option key={dept.id} value={dept.name}>
                                                    {dept.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label htmlFor="academicYear">Filter by Academic Year</label>
                                        <select
                                            id="academicYear"
                                            name="academicYear"
                                            value={filters.academicYear}
                                            onChange={handleFilterChange}
                                            className="form-control"
                                        >
                                            <option value="">All Academic Years</option>
                                            {academicYears.map(ay => (
                                                <option key={ay.id} value={ay.year}>
                                                    {ay.year}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="form-group mb-3">
                                        <label htmlFor="status">Filter by Status</label>
                                        <select
                                            id="status"
                                            name="status"
                                            value={filters.status}
                                            onChange={handleFilterChange}
                                            className="form-control"
                                        >
                                            <option value="">All Status</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                            <option value="Graduated">Graduated</option>
                                            <option value="Dropped">Dropped</option>
                                        </select>
                                    </div>
                                </>
                            ) : (
                                <div className="form-group mb-3">
                                    <label htmlFor="department">Filter by Department</label>
                                    <select
                                        id="department"
                                        name="department"
                                        value={filters.department}
                                        onChange={handleFilterChange}
                                        className="form-control"
                                    >
                                        <option value="">All Departments</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.name}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="dateFrom">From Date</label>
                                    <input
                                        type="date"
                                        id="dateFrom"
                                        name="dateFrom"
                                        value={filters.dateFrom}
                                        onChange={handleFilterChange}
                                        className="form-control"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dateTo">To Date</label>
                                    <input
                                        type="date"
                                        id="dateTo"
                                        name="dateTo"
                                        value={filters.dateTo}
                                        onChange={handleFilterChange}
                                        className="form-control"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={generateReport}
                                disabled={isGenerating}
                                className="btn btn-primary btn-custom w-100"
                            >
                                {isGenerating ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin me-2"></i>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-file-alt me-2"></i>
                                        Generate Report
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="table-container">
                            <h5 className="mb-3">Generated Reports</h5>
                            
                            {reports.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                                    <p className="text-muted">No reports generated yet. Create your first report using the form on the left.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Report ID</th>
                                                <th>Type</th>
                                                <th>Generated At</th>
                                                <th>Records</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map(report => (
                                                <tr key={report.id}>
                                                    <td>#{report.id}</td>
                                                    <td>
                                                        <span className={`badge ${report.type === 'students' ? 'bg-primary' : 'bg-info'}`}>
                                                            {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(report.generatedAt).toLocaleString()}</td>
                                                    <td>{report.data.length}</td>
                                                    <td>
                                                        <button
                                                            onClick={() => exportReport(report.id)}
                                                            className="btn btn-sm btn-outline-primary me-2"
                                                        >
                                                            <i className="fas fa-download me-1"></i>
                                                            Export
                                                        </button>
                                                        <button className="btn btn-sm btn-outline-info">
                                                            <i className="fas fa-eye me-1"></i>
                                                            View
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
                </div>
            </div>
        </div>
    );
};

export default Report;

