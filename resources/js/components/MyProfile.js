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
        <div className="container py-4">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">
                        <i className="fas fa-user-circle me-2"></i> My Profile
                    </h3>
                </div>
                <div className="card-body">
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

                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={admin.username}
                                    disabled
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={admin.email}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={admin.firstName}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={admin.lastName}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>

                        <div className="col-md-6">
                            <div className="mb-3">
                                <label className="form-label">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={admin.phone}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Address</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={admin.address}
                                    onChange={handleInputChange}
                                    className="form-control"
                                    disabled={!isEditing}
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Created At</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={admin.createdAt}
                                    disabled
                                />
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Last Login</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={admin.lastLogin}
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-between mt-3">
                        {!isEditing ? (
                            <button
                                className="btn btn-warning"
                                onClick={() => setIsEditing(true)}
                            >
                                <i className="fas fa-edit me-2"></i>Edit Profile
                            </button>
                        ) : (
                            <button
                                className="btn btn-success"
                                onClick={handleSave}
                                disabled={saving}
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
                        )}
                        <button className="btn btn-danger" onClick={handleLogoutClick}>
                            <i className="fas fa-sign-out-alt me-2"></i>Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Logout Modal */}
            {showLogoutModal && (
                <div className="modal fade show d-block" tabIndex="-1" role="dialog">
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
