import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';

const MyProfile = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState({
        admin_id: '',
        username: '',
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        createdAt: '',
        lastLogin: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [user, setUser] = useState(null);

    // Load user data and fetch admin profile
    useEffect(() => {
        const loadUserData = async () => {
            try {
                // Load user data from localStorage
                const userData = localStorage.getItem('user');
                if (userData) {
                    const parsedUser = JSON.parse(userData);
                    setUser(parsedUser);
                    
                    // Fetch admin profile from API
                    const response = await apiCall('/auth/me');
                    if (response.success && response.data) {
                        setAdmin({
                            admin_id: response.data.admin_id,
                            username: response.data.username,
                            email: response.data.email || '',
                            firstName: response.data.first_name || '',
                            lastName: response.data.last_name || '',
                            phone: response.data.phone || '',
                            address: response.data.address || '',
                            createdAt: response.data.created_at || '',
                            lastLogin: response.data.updated_at || ''
                        });
                    }
                }
            } catch (err) {
                console.error('Error loading user data:', err);
                setError('Failed to load profile data');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdmin(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            // Update admin profile via API
            const response = await apiCall(`/auth/update-profile`, {
                method: 'PUT',
                body: JSON.stringify({
                    email: admin.email,
                    first_name: admin.firstName,
                    last_name: admin.lastName,
                    phone: admin.phone,
                    address: admin.address
                })
            });

            if (response.success) {
                setSuccess('Profile updated successfully!');
                setIsEditing(false);
                
                // Update localStorage with new data
                const updatedUser = {
                    ...user,
                    email: admin.email,
                    first_name: admin.firstName,
                    last_name: admin.lastName
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            } else {
                setError(response.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
        // Reset to original values if needed
    };

    const handleLogout = async () => {
        try {
            // Call logout API to clear cookies
            await apiCall('/auth/logout', {
                method: 'POST'
            });
        } catch (err) {
            console.error('Logout API call failed:', err);
        } finally {
            // Clear localStorage and redirect regardless of API call result
            localStorage.removeItem('user');
            setShowLogoutModal(false);
            navigate('/login');
        }
    };

    return (
        <div className="my-profile">
            <div className="header">
                <h1 className="mb-0">My Profile</h1>
                <div className="user-menu">
                    <div className="user-profile">
                        <div className="user-avatar">
                            {user ? user.username.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <span>{user ? user.username : 'Admin'}</span>
                    </div>
                </div>
            </div>

            {/* Error/Success Messages */}
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

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{height: '50vh'}}>
                    <div className="text-center">
                        <i className="fas fa-spinner fa-spin fa-2x mb-3"></i>
                        <p>Loading profile data...</p>
                    </div>
                </div>
            ) : (
            <div className="profile-content">
                <div className="row">
                    <div className="col-md-4">
                        <div className="table-container">
                            <div className="text-center mb-4">
                                <div className="user-avatar mx-auto mb-3" style={{ width: '100px', height: '100px', fontSize: '2rem' }}>
                                    {admin.firstName.charAt(0)}
                                </div>
                                <h4>{admin.firstName} {admin.lastName}</h4>
                                <p className="text-muted">Administrator</p>
                            </div>

                            <div className="profile-stats">
                                <div className="stat-item">
                                    <div className="stat-label">Account Created</div>
                                    <div className="stat-value">{new Date(admin.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">Last Login</div>
                                    <div className="stat-value">{new Date(admin.lastLogin).toLocaleString()}</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">Role</div>
                                    <div className="stat-value">Super Admin</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="btn btn-primary btn-custom w-100 mb-2"
                                >
                                    <i className="fas fa-edit me-2"></i>
                                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                                </button>
                                
                                <button
                                    onClick={() => setShowLogoutModal(true)}
                                    className="btn btn-outline-danger btn-custom w-100"
                                >
                                    <i className="fas fa-sign-out-alt me-2"></i>
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-8">
                        <div className="table-container">
                            <h5 className="mb-3">Profile Information</h5>
                            
                            <form>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={admin.firstName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={admin.lastName}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="username">Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={admin.username}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="form-control"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="email">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={admin.email}
                                            onChange={handleInputChange}
                                            disabled={!isEditing}
                                            className="form-control"
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number</label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={admin.phone}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="form-control"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="address">Address</label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={admin.address}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        className="form-control"
                                        rows="3"
                                    />
                                </div>

                                {isEditing && (
                                    <div className="form-group">
                                        <label htmlFor="currentPassword">Current Password</label>
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            name="currentPassword"
                                            placeholder="Enter current password to save changes"
                                            className="form-control"
                                        />
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label htmlFor="newPassword">New Password</label>
                                            <input
                                                type="password"
                                                id="newPassword"
                                                name="newPassword"
                                                placeholder="Enter new password (optional)"
                                                className="form-control"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="confirmPassword">Confirm New Password</label>
                                            <input
                                                type="password"
                                                id="confirmPassword"
                                                name="confirmPassword"
                                                placeholder="Confirm new password"
                                                className="form-control"
                                            />
                                        </div>
                                    </div>
                                )}

                                {isEditing && (
                                    <div className="mt-3">
                                        <button
                                            type="button"
                                            onClick={handleSave}
                                            className="btn btn-success btn-custom me-2"
                                            disabled={saving}
                                        >
                                            {saving ? (
                                                <>
                                                    <i className="fas fa-spinner fa-spin me-2"></i>
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-save me-2"></i>
                                                    Save Changes
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleCancel}
                                            className="btn btn-secondary btn-custom"
                                        >
                                            <i className="fas fa-times me-2"></i>
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            )}

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Logout</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowLogoutModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>Are you sure you want to log out? You will need to sign in again to access the system.</p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowLogoutModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleLogout}
                                >
                                    <i className="fas fa-sign-out-alt me-2"></i>
                                    Log Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            

            {/* Modal Backdrop */}
            {showLogoutModal && <div className="modal-backdrop fade show"></div>}

            <style jsx>{`
                .profile-stats {
                    border-top: 1px solid #e9ecef;
                    padding-top: 20px;
                }
                
                .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #f8f9fa;
                }
                
                .stat-item:last-child {
                    border-bottom: none;
                }
                
                .stat-label {
                    font-weight: 500;
                    color: #6c757d;
                }
                
                .stat-value {
                    font-weight: 600;
                    color: #495057;
                }
            `}</style>
        </div>
    );
};

export default MyProfile;

