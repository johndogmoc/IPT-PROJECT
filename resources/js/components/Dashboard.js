import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiCall } from '../utils/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        totalDepartments: 0,
        totalCourses: 0
    });

    const [studentsPerCourse, setStudentsPerCourse] = useState([]);
    const [facultyPerDepartment, setFacultyPerDepartment] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [topPerformers, setTopPerformers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        // Load user data from localStorage
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        
        // Fetch dashboard data when component mounts
        fetchDashboardData();
    }, []);

    // Fetch all dashboard data
    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');
        
        try {
            // Fetch all data in parallel
            const [studentsData, facultyData, departmentsData, coursesData] = await Promise.all([
                apiCall('/students'),
                apiCall('/faculty'),
                apiCall('/departments'),
                apiCall('/courses')
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
                    const courseName = student.course_name || 'Unknown Course';
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
                    const deptName = faculty.department_name || 'Unknown Department';
                    departmentCounts[deptName] = (departmentCounts[deptName] || 0) + 1;
                });

                const facultyPerDeptData = Object.entries(departmentCounts).map(([department, count]) => ({
                    department,
                    count
                }));
                setFacultyPerDepartment(facultyPerDeptData);
            }

            // Process top performers from actual student data
            if (studentsData.success && studentsData.data.data) {
                // Since we don't have grades/performance data in the current schema,
                // we'll show the most recent students as "top performers"
                // In a real system, you'd have a grades table with performance metrics
                const recentStudents = studentsData.data.data
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 3)
                    .map((student, index) => ({
                        name: `${student.f_name} ${student.m_name} ${student.l_name}`.trim(),
                        id: `STU${String(student.student_id).padStart(3, '0')}`,
                        year: `Year ${student.year_level}`,
                        percentage: Math.floor(Math.random() * 20) + 80 // Random percentage 80-100% for demo
                    }));
                setTopPerformers(recentStudents);
            }

            // Generate real notifications based on data
            const realNotifications = [];
            
            if (studentsData.success && studentsData.data.data) {
                const studentCount = studentsData.data.data.length;
                if (studentCount > 0) {
                    realNotifications.push({
                        message: `${studentCount} student${studentCount > 1 ? 's' : ''} registered`,
                        time: 'Today'
                    });
                }
            }
            
            if (facultyData.success && facultyData.data.data) {
                const facultyCount = facultyData.data.data.length;
                if (facultyCount > 0) {
                    realNotifications.push({
                        message: `${facultyCount} faculty member${facultyCount > 1 ? 's' : ''} active`,
                        time: 'Today'
                    });
                }
            }
            
            if (departmentsData.success && departmentsData.data.data) {
                const deptCount = departmentsData.data.data.length;
                if (deptCount > 0) {
                    realNotifications.push({
                        message: `${deptCount} department${deptCount > 1 ? 's' : ''} available`,
                        time: 'Today'
                    });
                }
            }
            
            if (coursesData.success && coursesData.data.data) {
                const courseCount = coursesData.data.data.length;
                if (courseCount > 0) {
                    realNotifications.push({
                        message: `${courseCount} course${courseCount > 1 ? 's' : ''} offered`,
                        time: 'Today'
                    });
                }
            }
            
            setNotifications(realNotifications);

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    // Custom label function for pie chart
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Handle profile navigation
    const handleProfileClick = () => {
        navigate('/profile');
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div className="d-flex justify-content-center align-items-center" style={{height: '50vh'}}>
                    <div className="text-center">
                        <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
                        <p>Loading dashboard data...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <div className="header">
                <h1 className="mb-0">Dashboard</h1>
                <div className="user-menu">
                    <div className="user-profile" onClick={handleProfileClick} style={{cursor: 'pointer'}}>
                        <div className="user-avatar">
                            {user ? user.username.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <span>{user ? user.username : 'Admin'}</span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                    <button type="button" className="btn-close" onClick={() => setError('')}></button>
                </div>
            )}

            {/* Stats Cards */}
            <div className="row mb-4">
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-user-graduate"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalStudents.toLocaleString()}</h3>
                            <p>Total Students</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-chalkboard-teacher"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalFaculty.toLocaleString()}</h3>
                            <p>Total Faculty</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-building"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalDepartments.toLocaleString()}</h3>
                            <p>Total Departments</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-3">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="fas fa-book"></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalCourses.toLocaleString()}</h3>
                            <p>Total Courses</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row mb-4">
                {/* Students per Course Chart */}
                <div className="col-md-6">
                    <div className="chart-card">
                        <div className="chart-header">
                            <h5>Students per Course</h5>
                        </div>
                        <div className="chart-body">
                            {studentsPerCourse.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={studentsPerCourse}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={renderCustomizedLabel}
                                            outerRadius={80}
                                            fill="#8884d8"
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

                {/* Faculty per Department Chart */}
                <div className="col-md-6">
                    <div className="chart-card">
                        <div className="chart-header">
                            <h5>Faculty per Department</h5>
                        </div>
                        <div className="chart-body">
                            {facultyPerDepartment.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={facultyPerDepartment}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="department" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#007bff" />
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

            {/* Bottom Row */}
            <div className="row">
                {/* Recent Students */}
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h5 className="mb-0">Recent Students</h5>
                        </div>
                        <div className="card-body">
                            {topPerformers.length > 0 ? (
                                <div className="performers-list">
                                    {topPerformers.map((performer, index) => (
                                        <div key={index} className="performer-item">
                                            <div className="performer-rank">
                                                <span className="rank-number">{index + 1}</span>
                                            </div>
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