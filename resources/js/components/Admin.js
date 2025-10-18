import React, { useState } from 'react';

const Admin = () => {
    const [admin, setAdmin] = useState({
        admin_id: '',
        username: '',
        password: '',
        created_at: ''
    });

    const [admins, setAdmins] = useState([]);
    const [isEditing, setIsEditing] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setAdmin(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (isEditing) {
            setAdmins(prev => prev.map(adm => 
                adm.admin_id === admin.admin_id ? admin : adm
            ));
            setIsEditing(false);
        } else {
            const newAdmin = {
                ...admin,
                admin_id: Date.now().toString(),
                created_at: new Date().toISOString()
            };
            setAdmins(prev => [...prev, newAdmin]);
        }
        
        setAdmin({
            admin_id: '',
            username: '',
            password: '',
            created_at: ''
        });
    };

    const handleEdit = (adminToEdit) => {
        setAdmin(adminToEdit);
        setIsEditing(true);
    };

    const handleDelete = (adminId) => {
        setAdmins(prev => prev.filter(adm => adm.admin_id !== adminId));
    };

    return (
        <div className="admin-component">
            <h2>Admin Management</h2>
            
            <form onSubmit={handleSubmit} className="admin-form">
                <div className="form-group">
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={admin.username}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={admin.password}
                        onChange={handleInputChange}
                        required
                        className="form-control"
                    />
                </div>
                
                <button type="submit" className="btn btn-primary">
                    {isEditing ? 'Update Admin' : 'Add Admin'}
                </button>
                
                {isEditing && (
                    <button 
                        type="button" 
                        onClick={() => {
                            setIsEditing(false);
                            setAdmin({
                                admin_id: '',
                                username: '',
                                password: '',
                                created_at: ''
                            });
                        }}
                        className="btn btn-secondary"
                    >
                        Cancel
                    </button>
                )}
            </form>
            
            <div className="admin-list">
                <h3>Admin List</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map(admin => (
                            <tr key={admin.admin_id}>
                                <td>{admin.admin_id}</td>
                                <td>{admin.username}</td>
                                <td>{new Date(admin.created_at).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        onClick={() => handleEdit(admin)}
                                        className="btn btn-sm btn-warning"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(admin.admin_id)}
                                        className="btn btn-sm btn-danger"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Admin;
