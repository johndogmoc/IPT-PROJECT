import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiCall } from '../utils/api';

const Dashboard = () => {
    const { user, loading, authenticated } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        totalDepartments: 0,
        totalCourses: 0
    });

    const [studentsPerCourse, setStudentsPerCourse] = useState([]);
    const [facultyPerDepartment, setFacultyPerDepartment] = useState([]);
    const [dashboardLoading, setDashboardLoading] = useState(true);
    const [error, setError] = useState('');

    const [topPerformers, setTopPerformers] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!loading) {
            if (!authenticated) {
                navigate('/login');
            } else {
                fetchDashboardData();
            }
        }
    }, [authenticated, loading, navigate]);

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
        setDashboardLoading(true);
        setError('');
        
        try {
            // Fetch all data in parallel
            const [studentsData, facultyData, departmentsData, coursesData] = await Promise.all([
                apiCall('/students/list'),
                apiCall('/faculty/list'),
                apiCall('/departments/list'),
                apiCall('/courses/list')
            ]);

            // Update stats
            setStats({
                totalStudents: studentsData.success ? studentsData.data.total || 0 : 0,
                totalFaculty: facultyData.success ? facultyData.data.total || 0 : 0,
                totalDepartments: departmentsData.success ? departmentsData.data.total || 0 : 0,
                totalCourses: coursesData.success ? coursesData.data.total || 0 : 0
            });

            // Process students per course data
            if (studentsData.success && studentsData.data.data) {
                const courseCounts = {};
                studentsData.data.data.forEach(student => {
                    const courseName = student.course?.course_name || student.course_name || 'Unknown Course';
                    courseCounts[courseName] = (courseCounts[courseName] || 0) + 1;
                });

                const colors = ['#007bff', '#ffc107', '#6f42c1', '#fd7e14', '#20c997', '#dc3545', '#6c757d', '#17a2b8'];
                const studentsPerCourseData = Object.entries(courseCounts).map(([course, count], index) => ({
                    name: course,
                    value: count,
                    fill: colors[index % colors.length]
                }));
                setStudentsPerCourse(studentsPerCourseData);
            }

            // Process faculty per department data
            if (facultyData.success && facultyData.data.data) {
                const departmentCounts = {};
                facultyData.data.data.forEach(faculty => {
                    const deptName = faculty.department?.department_name || faculty.department_name || 'Unknown Department';
                    departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
                });

                const facultyPerDepartmentData = Object.entries(departmentCounts).map(([dept, count]) => ({
                    name: dept,
                    faculty: count
                }));
                setFacultyPerDepartment(facultyPerDepartmentData);
            }

            // Mock top performers and notifications (replace with real API if available)
            setTopPerformers([
                { id: 'STU001', name: 'John Doe', course: 'Computer Science', year: 'Senior', percentage: 95 },
                { id: 'STU002', name: 'Jane Smith', course: 'Business', year: 'Junior', percentage: 92 },
                { id: 'STU003', name: 'Mike Johnson', course: 'Nursing', year: 'Senior', percentage: 90 }
            ]);

            setNotifications([
                { message: 'New student enrollment deadline approaching', time: '2 hours ago' },
                { message: 'Faculty meeting scheduled for tomorrow', time: '1 day ago' },
                { message: 'System maintenance planned for weekend', time: '3 days ago' }
            ]);

        } catch (err) {
            setError('Failed to load dashboard data');
        } finally {
            setDashboardLoading(false);
        }
    };

    if (dashboardLoading) {
        return (
            <div className="text-center py-5">
                <i className="fas fa-spinner fa-spin fa-3x mb-3"></i>
                <p>Loading dashboard data...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="header">
                <h1 className="mb-0">Dashboard</h1>
                <div className="user-menu">
                    <div className="user-profile" onClick={() => navigate('/profile')} style={{cursor: 'pointer'}}>
                        <div className="user-avatar">
                            {user ? user.username.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <span>{user ? user.username : 'Admin'}</span>
                    </div>
                </div>
            </div>

            <div className="row">
                {/* Stats Cards */}
                <div className="col-md-3">
                    <div className="card stat-card">
                        <div className="card-body">
                            <div className="stat-icon bg-primary">
                                <i className="fas fa-user-graduate"></i>
                            </div>
                            <h5 className="card-title">Total Students</h5>
                            <h2 className="stat-value">{stats.totalStudents}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card stat-card">
                        <div className="card-body">
                            <div className="stat-icon bg-success">
                                <i className="fas fa-chalkboard-teacher"></i>
                            </div>
                            <h5 className="card-title">Total Faculty</h5>
                            <h2 className="stat-value">{stats.totalFaculty}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card stat-card">
                        <div className="card-body">
                            <div className="stat-icon bg-info">
                                <i className="fas fa-building"></i>
                            </div>
                            <h5 className="card-title">Departments</h5>
                            <h2 className="stat-value">{stats.totalDepartments}</h2>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="card stat-card">
                        <div className="card-body">
                            <div className="stat-icon bg-warning">
                                <i className="fas fa-book"></i>
                            </div>
                            <h5 className="card-title">Courses</h5>
                            <h2 className="stat-value">{stats.totalCourses}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                {/* Students per Course Pie Chart */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Students per Course</h5>
                        </div>
                        <div className="card-body">
                            {studentsPerCourse.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={studentsPerCourse}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            dataKey="value"
                                        >
                                            {studentsPerCourse.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                                    <p className="text-muted">No student data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Faculty per Department Bar Chart */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Faculty per Department</h5>
                        </div>
                        <div className="card-body">
                            {facultyPerDepartment.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={facultyPerDepartment}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="faculty" fill="#007bff" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-chart-bar fa-2x text-muted mb-2"></i>
                                    <p className="text-muted">No faculty data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-4">
                {/* Top Performers */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Top Student Performers</h5>
                        </div>
                        <div className="card-body">
                            {topPerformers.length > 0 ? (
                                <div className="performers-list">
                                    {topPerformers.map((performer, index) => (
                                        <div key={index} className="performer-item">
                                            <div className="performer-info">
                                                <h6 className="mb-1">{performer.name}</h6>
                                                <p className="mb-0 text-muted">{performer.id} • {performer.year}</p>
                                            </div>
                                            <div className="performer-score">
                                                <span className="score-badge">{performer.percentage}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-user-graduate fa-2x text-muted mb-2"></i>
                                    <p className="text-muted">No student data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Recent Notifications</h5>
                        </div>
                        <div className="card-body">
                            {notifications.length > 0 ? (
                                <div className="notifications-list">
                                    {notifications.map((notification, index) => (
                                        <div key={index} className="notification-item">
                                            <div className="notification-icon">
                                                <i className="fas fa-info-circle"></i>
                                            </div>
                                            <div className="notification-content">
                                                <p className="mb-1">{notification.message}</p>
                                                <small className="text-muted">{notification.time}</small>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-bell fa-2x text-muted mb-2"></i>
                                    <p className="text-muted">No notifications available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;