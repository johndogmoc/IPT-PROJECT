import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiCall } from '../utils/api';

const MyProfile = () => {
    const { user, loading: authLoading } = useAuth();
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

    useEffect(() => {
        const loadUserData = async () => {
            // Wait for auth loading to complete
            if (authLoading) {
                return;
            }

            try {
                if (user) {
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
                } else {
                    // No user found, redirect to login
                    navigate('/login');
                }
            } catch (err) {
                setError('Failed to load profile data.');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [user, authLoading, navigate]);

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
            const response = await apiCall('/auth/update-profile', {
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
                // Profile updated successfully, no need to check auth again
            } else {
                setError(response.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('Network error: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const handleLogout = async () => {
        try {
            await apiCall('/auth/logout', { method: 'POST' });
        } catch (err) {
            // Silent fail
        } finally {
            setShowLogoutModal(false);
            navigate('/login');
        }
    };

    if (loading || authLoading) {
        return <div className="text-center py-5">Loading profile...</div>;
    }

    return (
        <div className="modern-profile">
            <div className="profile-header">
                <h2 className="profile-title">My Profile</h2>
                <p className="profile-subtitle">Manage your personal information and account settings</p>
            </div>

            <div className="profile-container">
                {error && (
                    <div className="alert alert-danger">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}
                {success && (
                    <div className="alert alert-success">
                        <i className="fas fa-check-circle me-2"></i>
                        {success}
                    </div>
                )}

                {/* User Profile Header */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body p-4">
                        <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <div style={{width: '70px', height: '70px', borderRadius: '50%', background: '#FFC107', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px', position: 'relative'}}>
                                    <i className="fas fa-user" style={{fontSize: '32px', color: 'white'}}></i>
                                    <div style={{position: 'absolute', bottom: '0', right: '0', width: '24px', height: '24px', background: '#4F46E5', borderRadius: '50%', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <i className="fas fa-check" style={{fontSize: '10px', color: 'white'}}></i>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="mb-1" style={{fontWeight: '600', color: '#1f2937'}}>{admin.firstName} {admin.lastName}</h4>
                                    <p className="mb-1 text-muted" style={{fontSize: '14px'}}>{admin.email}</p>
                                    <div className="d-flex align-items-center gap-3" style={{fontSize: '13px'}}>
                                        <span className="text-success">
                                            <i className="fas fa-check-circle me-1"></i>Verified Account
                                        </span>
                                        <span className="text-muted">
                                            Last login: 2 hours ago
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                className="btn btn-primary"
                                onClick={() => setIsEditing(!isEditing)}
                                style={{borderRadius: '8px', padding: '8px 20px'}}
                            >
                                <i className={`fas ${isEditing ? 'fa-times' : 'fa-edit'} me-2`}></i>
                                {isEditing ? 'Cancel' : 'Edit Profile'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Two Column Layout */}
                <div className="row">
                    {/* Personal Information Section */}
                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-header" style={{background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 20px'}}>
                                <h6 className="mb-0" style={{fontWeight: '600', color: '#1f2937'}}>
                                    <i className="fas fa-user-circle me-2" style={{color: '#4F46E5'}}></i>Personal Information
                                </h6>
                            </div>
                            <div className="card-body" style={{padding: '20px'}}>
                                <div className="row">
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label text-muted" style={{fontSize: '12px', fontWeight: '500'}}>First Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={admin.firstName}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                style={{fontSize: '14px'}}
                                            />
                                        ) : (
                                            <div style={{fontSize: '14px', color: '#1f2937'}}>{admin.firstName || 'N/A'}</div>
                                        )}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label text-muted" style={{fontSize: '12px', fontWeight: '500'}}>Last Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={admin.lastName}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                style={{fontSize: '14px'}}
                                            />
                                        ) : (
                                            <div style={{fontSize: '14px', color: '#1f2937'}}>{admin.lastName || 'N/A'}</div>
                                        )}
                                    </div>
                                    <div className="col-md-4 mb-3">
                                        <label className="form-label text-muted" style={{fontSize: '12px', fontWeight: '500'}}>Username</label>
                                        <div style={{fontSize: '14px', color: '#1f2937'}}>{admin.username}</div>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted" style={{fontSize: '12px', fontWeight: '500'}}>Email Address</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            name="email"
                                            value={admin.email}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            style={{fontSize: '14px'}}
                                        />
                                    ) : (
                                        <div style={{fontSize: '14px', color: '#1f2937'}}>{admin.email}</div>
                                    )}
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted" style={{fontSize: '12px', fontWeight: '500'}}>Phone Number</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="phone"
                                                value={admin.phone}
                                                onChange={handleInputChange}
                                                className="form-control"
                                                style={{fontSize: '14px'}}
                                            />
                                        ) : (
                                            <div style={{fontSize: '14px', color: '#1f2937'}}>{admin.phone || 'N/A'}</div>
                                        )}
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label text-muted" style={{fontSize: '12px', fontWeight: '500'}}>Date of Birth</label>
                                        {isEditing ? (
                                            <input
                                                type="date"
                                                className="form-control"
                                                style={{fontSize: '14px'}}
                                            />
                                        ) : (
                                            <div style={{fontSize: '14px', color: '#1f2937'}}>1999-03-15</div>
                                        )}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted" style={{fontSize: '12px', fontWeight: '500'}}>Address</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            name="address"
                                            value={admin.address}
                                            onChange={handleInputChange}
                                            className="form-control"
                                            placeholder="123 University Ave, College Town, ST 12345"
                                            style={{fontSize: '14px'}}
                                        />
                                    ) : (
                                        <div style={{fontSize: '14px', color: '#1f2937'}}>{admin.address || 'N/A'}</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Information Section */}
                    <div className="col-md-6 mb-4">
                        <div className="card shadow-sm h-100">
                            <div className="card-header" style={{background: 'white', borderBottom: '1px solid #e5e7eb', padding: '16px 20px'}}>
                                <h6 className="mb-0" style={{fontWeight: '600', color: '#1f2937'}}>
                                    <i className="fas fa-info-circle me-2" style={{color: '#4F46E5'}}></i>Account Information
                                </h6>
                            </div>
                            <div className="card-body" style={{padding: '20px'}}>
                                <div className="mb-3">
                                    <div 
                                        className="d-flex align-items-center p-3" 
                                        style={{
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px', 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <i className="fas fa-lock" style={{color: '#4F46E5', fontSize: '18px', marginRight: '12px'}}></i>
                                        <span style={{fontSize: '14px', color: '#1f2937', flex: 1}}>Change Password</span>
                                        <i className="fas fa-chevron-right" style={{color: '#9ca3af', fontSize: '14px'}}></i>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <div 
                                        className="d-flex align-items-center p-3" 
                                        style={{
                                            border: '1px solid #e5e7eb', 
                                            borderRadius: '8px', 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <i className="fas fa-shield-alt" style={{color: '#4F46E5', fontSize: '18px', marginRight: '12px'}}></i>
                                        <span style={{fontSize: '14px', color: '#1f2937', flex: 1}}>Two-Factor Auth</span>
                                        <i className="fas fa-chevron-right" style={{color: '#9ca3af', fontSize: '14px'}}></i>
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted" style={{fontSize: '12px', fontWeight: '500'}}>Created At</label>
                                    <div style={{fontSize: '14px', color: '#1f2937'}}>
                                        {admin.createdAt || '2025-10-18T18:37:18.0000002'}
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label text-muted" style={{fontSize: '12px', fontWeight: '500'}}>Last Login</label>
                                    <div style={{fontSize: '14px', color: '#1f2937'}}>
                                        {admin.lastLogin || '2025-10-18T23:50:26.0000002'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                {isEditing ? (
                    <div className="d-flex justify-content-end gap-2">
                        <button 
                            className="btn btn-outline-secondary"
                            onClick={() => setIsEditing(false)}
                            style={{borderRadius: '8px', padding: '10px 24px'}}
                        >
                            Cancel Changes
                        </button>
                        <button 
                            className="btn btn-primary"
                            onClick={handleSave}
                            disabled={saving}
                            style={{borderRadius: '8px', padding: '10px 24px'}}
                        >
                            {saving ? (
                                <>
                                    <i className="fas fa-spinner fa-spin me-2"></i>Saving...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save me-2"></i>Save Changes
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="text-end">
                        <button 
                            className="btn btn-outline-primary"
                            style={{borderRadius: '8px', padding: '10px 24px'}}
                        >
                            <i className="fas fa-download me-2"></i>Download Data
                        </button>
                    </div>
                )}
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered" role="document">
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
                                <p>Are you sure you want to log out?</p>
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
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyProfile;
