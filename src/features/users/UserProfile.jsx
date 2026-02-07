import React, { useState, useEffect } from 'react';
import api from '../../api/api';

const UserProfile = () => {
    const [profile, setProfile] = useState({ name: '', email: '', role: '', department: '' });
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const fetchProfile = async () => {
        try {
            const res = await api.get('/users/me');
            setProfile(res.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to load profile');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const payload = { name: profile.name };

            const res = await api.patch('/users/me', payload);
            setProfile({ ...profile, ...res.data });
            setMessage('Profile updated successfully');
        } catch (err) {
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    if (loading) return <div>Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="md:flex md:items-center md:justify-between md:space-x-5">
                <div className="flex items-center space-x-5">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                        <p className="text-sm font-medium text-gray-500">Manage your account settings</p>
                    </div>
                </div>
            </div>

            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                        {error}
                    </div>
                )}

                <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Your account details. Email cannot be changed.
                            </p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6 sm:col-span-4">
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={profile.name}
                                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-4">
                                    <label className="block text-sm font-medium text-gray-700">Email (Read Only)</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={profile.email}
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Role</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={profile.role}
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700">Department</label>
                                    <input
                                        type="text"
                                        disabled
                                        value={profile.department}
                                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100 text-gray-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserProfile;
