import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store';
import { User, Bell, Lock, Sparkles, Monitor, LogOut, Upload, X } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const updateUserProfileImage = useAuthStore((state) => state.updateUserProfileImage);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('account');

    // Profile image state
    const [uploading, setUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const tabs = [
        { id: 'account', label: 'Account', icon: <User size={18} /> },
        { id: 'ai', label: 'AI Behavior', icon: <Sparkles size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    ];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('File size must be less than 5MB');
            return;
        }

        setSelectedFile(file);

        // Create preview URL
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        try {
            const result = await api.uploadProfileImage(selectedFile);
            updateUserProfileImage(result.profile_image_url);
            setSelectedFile(null);
            setPreviewUrl(null);
            alert('Profile image updated successfully!');
        } catch (error) {
            console.error('Upload failed:', error);
            alert((error as Error).message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const cancelUpload = () => {
        setSelectedFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
    };

    const getProfileImageUrl = () => {
        if (previewUrl) return previewUrl;
        if (user?.profile_image_url) return `/api${user.profile_image_url}`;
        return null;
    };

    const getUserInitials = () => {
        return user?.email.charAt(0).toUpperCase() || 'U';
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 font-display mb-2 tracking-tight animate-fade-in">Settings</h1>
                <p className="text-gray-600 mb-8 text-lg animate-fade-in animation-delay-100">Manage your account and workspace preferences.</p>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Settings Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0 animate-fade-in animation-delay-200">
                        <nav className="space-y-2 bg-white/70 backdrop-blur-md p-2 rounded-xl border border-white/20 shadow-float">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-300 ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow transform scale-105'
                                        : 'text-gray-600 hover:bg-white/60 hover:text-gray-900 hover:scale-105 hover:shadow-float'
                                        }`}
                                >
                                    {tab.icon}
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Settings Content */}
                    <div className="flex-1 space-y-8">
                        {activeTab === 'account' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <section className="bg-white/90 backdrop-blur-md rounded-xl border border-white/20 shadow-float hover:shadow-glow overflow-hidden transition-all duration-500">
                                    <div className="px-6 py-4 bg-gradient-to-r from-blue-50/60 to-indigo-50/40 backdrop-blur-md border-b border-white/20">
                                        <h3 className="text-lg font-bold text-gray-900">Profile Information</h3>
                                        <p className="text-gray-600 text-sm mt-1">Public facing details.</p>
                                    </div>
                                    <div className="p-6 space-y-8">
                                        <div className="flex items-center space-x-6">
                                            <div className="relative">
                                                {getProfileImageUrl() ? (
                                                    <img
                                                        src={getProfileImageUrl()!}
                                                        alt="Profile"
                                                        className="h-24 w-24 rounded-full object-cover border-4 border-white/60 shadow-float hover:shadow-glow transition-all duration-300"
                                                    />
                                                ) : (
                                                    <div className="h-24 w-24 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-float border-4 border-white/60">
                                                        {getUserInitials()}
                                                    </div>
                                                )}
                                                {selectedFile && (
                                                    <button
                                                        onClick={cancelUpload}
                                                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-all duration-300 shadow-float hover:scale-110"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="space-y-3">
                                                {!selectedFile ? (
                                                    <>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleFileSelect}
                                                            className="hidden"
                                                            id="profile-image-input"
                                                        />
                                                        <label htmlFor="profile-image-input">
                                                            <Button variant="outline" size="sm" className="cursor-pointer hover:scale-105 transition-transform duration-200">
                                                                <Upload size={16} className="mr-2" />
                                                                Upload New
                                                            </Button>
                                                        </label>
                                                        {user?.profile_image_url && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50/60 backdrop-blur-md"
                                                                onClick={() => {/* TODO: Implement remove */ }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="flex space-x-3">
                                                        <Button
                                                            size="sm"
                                                            onClick={handleUpload}
                                                            disabled={uploading}
                                                            isLoading={uploading}
                                                            className="hover:scale-105 transition-transform duration-200"
                                                        >
                                                            Save Image
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={cancelUpload}
                                                            disabled={uploading}
                                                            className="hover:scale-105 transition-transform duration-200"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                )}
                                                <p className="text-sm text-gray-500">
                                                    JPG, PNG or GIF. Max 5MB.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="Full Name" defaultValue={user?.email.split('@')[0]} />
                                            <Input label="Email Address" defaultValue={user?.email} disabled className="bg-gray-50/60 backdrop-blur-md text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50/60 to-gray-100/40 backdrop-blur-md border-t border-white/20 flex justify-end">
                                        <Button size="sm" className="hover:scale-105 transition-transform duration-200">Save Changes</Button>
                                    </div>
                                </section>

                                <section className="bg-white/90 backdrop-blur-md rounded-xl border border-red-200/40 shadow-float hover:shadow-glow overflow-hidden transition-all duration-500">
                                    <div className="px-6 py-4 bg-gradient-to-r from-red-50/60 to-red-100/40 backdrop-blur-md border-b border-red-200/30 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-red-700">Danger Zone</h3>
                                        </div>
                                        <LogOut size={18} className="text-red-400" />
                                    </div>
                                    <div className="p-6 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-semibold text-gray-900">Delete Account</h4>
                                            <p className="text-sm text-gray-600 mt-1 max-w-sm">Permanently remove your account and all data.</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                    await api.logout();
                                                    logout();
                                                    navigate('/login');
                                                }}
                                                className="hover:scale-105 transition-transform duration-200"
                                            >
                                                Log out
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                size="sm"
                                                className="hover:scale-105 transition-transform duration-200"
                                            >
                                                Delete Account
                                            </Button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                <section className="bg-white/90 backdrop-blur-md rounded-xl border border-white/20 shadow-float hover:shadow-glow overflow-hidden transition-all duration-500">
                                    <div className="px-6 py-4 bg-gradient-to-r from-purple-50/60 to-indigo-50/40 backdrop-blur-md border-b border-white/20">
                                        <h3 className="text-lg font-bold text-gray-900">Model Configuration</h3>
                                        <p className="text-gray-600 text-sm mt-1">Control how CodeLens analyzes your code.</p>
                                    </div>
                                    <div className="p-6 space-y-8">
                                        <Input label="OpenAI API Key" type="password" placeholder="sk-..." />
                                        <div className="flex items-center justify-between py-3 p-4 bg-gradient-to-r from-blue-50/40 to-purple-50/30 backdrop-blur-md rounded-lg border border-white/20">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Default Model</h4>
                                                <p className="text-sm text-gray-600">Choose the reasoning engine.</p>
                                            </div>
                                            <select className="block w-48 rounded-lg border border-white/20 bg-white/60 backdrop-blur-md px-4 py-2.5 text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm outline-none shadow-float hover:shadow-glow transition-all duration-300">
                                                <option>GPT-4o (Recommended)</option>
                                                <option>Claude 3.5 Sonnet</option>
                                                <option>Llama 3 70B</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-gray-200/60 pt-6 p-4 bg-gradient-to-r from-green-50/40 to-emerald-50/30 backdrop-blur-md rounded-lg border border-white/20">
                                            <div>
                                                <h4 className="font-semibold text-gray-900">Auto-Index on Push</h4>
                                                <p className="text-sm text-gray-600">Re-index repos when commits are detected.</p>
                                            </div>
                                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400 shadow-float" />
                                                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer shadow-inner"></label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-gradient-to-r from-gray-50/60 to-gray-100/40 backdrop-blur-md border-t border-white/20 flex justify-end">
                                        <Button size="sm" className="hover:scale-105 transition-transform duration-200">Update Config</Button>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-white/90 backdrop-blur-md rounded-xl border border-white/20 shadow-float hover:shadow-glow p-16 text-center text-gray-500 transition-all duration-500 animate-in fade-in slide-in-from-right-4">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-100/60 to-purple-100/40 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-float">
                                    <Bell size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">Notifications</h3>
                                <p className="text-gray-600 text-lg">Coming soon in v2.1</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};