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

            // No mock data - top performers and notifications will be empty
            setTopPerformers([]);
            setNotifications([]);

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
        <div className="modern-dashboard">
            {/* Header */}
            <div className="dashboard-header">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h2 className="dashboard-title">Admin Dashboard</h2>
                        <div className="search-bar">
                            <input 
                                type="text" 
                                className="form-control" 
                                placeholder="What do you wanna find?"
                            />
                            <i className="fas fa-search search-icon"></i>
                        </div>
                    </div>
                    <div className="header-actions">
                        <div className="notification-icons">
                            <div className="icon-badge">
                                <i className="fas fa-bell"></i>
                                <span className="badge">3</span>
                            </div>
                            <div className="icon-badge">
                                <i className="fas fa-envelope"></i>
                                <span className="badge">5</span>
                            </div>
                            <div className="user-avatar-header" onClick={() => navigate('/profile')} style={{cursor: 'pointer'}}>
                                <i className="fas fa-user"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards Row */}
            <div className="stats-grid">
                <div className="stat-card stat-card-blue">
                    <div className="stat-content">
                        <h6 className="stat-label">Students</h6>
                        <h2 className="stat-number">{stats.totalStudents}</h2>
                    </div>
                </div>
                <div className="stat-card stat-card-purple">
                    <div className="stat-content">
                        <h6 className="stat-label">Teachers</h6>
                        <h2 className="stat-number">{stats.totalFaculty}</h2>
                    </div>
                </div>
                <div className="stat-card stat-card-green">
                    <div className="stat-content">
                        <h6 className="stat-label">Departments</h6>
                        <h2 className="stat-number">{stats.totalDepartments}</h2>
                    </div>
                </div>
                <div className="stat-card stat-card-mint">
                    <div className="stat-content">
                        <h6 className="stat-label">Earnings</h6>
                        <h2 className="stat-number">23.27M</h2>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="content-grid">
                {/* Left Column */}
                <div className="left-column">
                    {/* Programs Chart */}
                    <div className="chart-card">
                        <div className="chart-content">
                            {studentsPerCourse.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={studentsPerCourse}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            dataKey="value"
                                        >
                                            {studentsPerCourse.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-chart-pie fa-2x text-muted mb-2"></i>
                                    <p className="text-muted">No data available</p>
                                </div>
                            )}
                        </div>
                        <div className="chart-legend">
                            <div className="legend-item">
                                <span className="legend-dot" style={{backgroundColor: '#4285f4'}}></span>
                                <span>Nursing Program</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{backgroundColor: '#ea4335'}}></span>
                                <span>Business & Administration Program</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{backgroundColor: '#34a853'}}></span>
                                <span>Computer Science Program</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{backgroundColor: '#fbbc04'}}></span>
                                <span>Engineering Program</span>
                            </div>
                        </div>
                    </div>

                    {/* Top Performers */}
                    <div className="performers-card">
                        <h6 className="card-title">Top Performer</h6>
                        <div className="performers-tabs">
                            <button className="tab-btn active">Weekly</button>
                            <button className="tab-btn">Monthly</button>
                            <button className="tab-btn">Year</button>
                        </div>
                        <div className="performers-list">
                            {topPerformers.length > 0 ? (
                                topPerformers.map((performer, index) => (
                                    <div key={index} className="performer-row">
                                        <div className="performer-avatar">
                                            <i className="fas fa-user"></i>
                                        </div>
                                        <div className="performer-details">
                                            <h6>{performer.name}</h6>
                                            <span className="performer-id">{performer.id}</span>
                                            <span className="performer-year">{performer.year}</span>
                                        </div>
                                        <div className="performer-percentage">
                                            {performer.percentage}%
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-trophy fa-2x text-muted mb-2"></i>
                                    <p className="text-muted">No top performers data available</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="right-column">
                    {/* Top Earnings Chart */}
                    <div className="earnings-card">
                        <h6 className="card-title">Top Earnings</h6>
                        <div className="earnings-chart">
                            {facultyPerDepartment.length > 0 ? (
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={facultyPerDepartment}>
                                        <Bar dataKey="faculty" fill="#4285f4" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fas fa-chart-bar fa-2x text-muted mb-2"></i>
                                    <p className="text-muted">No data available</p>
                                </div>
                            )}
                        </div>
                        <div className="earnings-years">
                            <span>2020</span>
                            <span>2021</span>
                            <span>2022</span>
                        </div>
                    </div>

                    {/* Attendance Circle */}
                    <div className="attendance-card">
                        <h6 className="card-title">Attendance</h6>
                        <div className="attendance-circle">
                            <div className="circle-progress">
                                <svg width="120" height="120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#e0e0e0" strokeWidth="8"/>
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#8b5cf6" strokeWidth="8" 
                                            strokeDasharray="314" strokeDashoffset="94" strokeLinecap="round"/>
                                </svg>
                                <div className="circle-text">
                                    <span className="percentage">70%</span>
                                    <span className="label">Present</span>
                                </div>
                            </div>
                        </div>
                        <div className="attendance-legend">
                            <div className="legend-item">
                                <span className="legend-dot" style={{backgroundColor: '#8b5cf6'}}></span>
                                <span>Present</span>
                            </div>
                            <div className="legend-item">
                                <span className="legend-dot" style={{backgroundColor: '#f59e0b'}}></span>
                                <span>Sick</span>
                            </div>
                        </div>
                    </div>

                    {/* Library Section */}
                    <div className="library-card">
                        <h6 className="card-title">Library</h6>
                        <div className="library-items">
                            <div className="library-item">
                                <div className="library-icon red">
                                    <i className="fas fa-book"></i>
                                </div>
                                <div className="library-details">
                                    <span className="library-name">Literature</span>
                                    <span className="library-count">Available</span>
                                </div>
                                <span className="library-status">Reading</span>
                            </div>
                            <div className="library-item">
                                <div className="library-icon blue">
                                    <i className="fas fa-calculator"></i>
                                </div>
                                <div className="library-details">
                                    <span className="library-name">Mathematics</span>
                                    <span className="library-count">Available</span>
                                </div>
                                <span className="library-status">Reading</span>
                            </div>
                            <div className="library-item">
                                <div className="library-icon green">
                                    <i className="fas fa-flask"></i>
                                </div>
                                <div className="library-details">
                                    <span className="library-name">Science</span>
                                    <span className="library-count">Available</span>
                                </div>
                                <span className="library-status">Reading</span>
                            </div>
                            <div className="library-item">
                                <div className="library-icon purple">
                                    <i className="fas fa-globe"></i>
                                </div>
                                <div className="library-details">
                                    <span className="library-name">English</span>
                                    <span className="library-count">Available</span>
                                </div>
                                <span className="library-status">Reading</span>
                            </div>
                        </div>
                    </div>

                    {/* Notifications */}
                    <div className="notifications-card">
                        <h6 className="card-title">Notifications</h6>
                        <div className="notifications-list">
                            <div className="notification-item">
                                <div className="notification-avatar blue">
                                    <i className="fas fa-chalkboard-teacher"></i>
                                </div>
                                <div className="notification-content">
                                    <h6>New Teacher</h6>
                                    <p>A new teacher has joined the faculty</p>
                                </div>
                                <span className="notification-time">Today</span>
                            </div>
                            <div className="notification-item">
                                <div className="notification-avatar green">
                                    <i className="fas fa-calendar"></i>
                                </div>
                                <div className="notification-content">
                                    <h6>Meetings Sched</h6>
                                    <p>Faculty meeting scheduled for tomorrow</p>
                                </div>
                                <span className="notification-time">Today</span>
                            </div>
                            <div className="notification-item">
                                <div className="notification-avatar purple">
                                    <i className="fas fa-book-open"></i>
                                </div>
                                <div className="notification-content">
                                    <h6>New Course</h6>
                                    <p>New course has been added to curriculum</p>
                                </div>
                                <span className="notification-time">1 day ago</span>
                            </div>
                            <div className="notification-item">
                                <div className="notification-avatar orange">
                                    <i className="fas fa-tools"></i>
                                </div>
                                <div className="notification-content">
                                    <h6>Free Structure</h6>
                                    <p>System maintenance completed</p>
                                </div>
                                <span className="notification-time">2 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;