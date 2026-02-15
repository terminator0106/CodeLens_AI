import React, { useEffect, useState } from 'react';
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

    useEffect(() => {
        // Keep Settings UI static by preventing page-level scrolling while this page is mounted.
        const html = document.documentElement;
        const body = document.body;
        const prevHtmlOverflow = html.style.overflow;
        const prevBodyOverflow = body.style.overflow;

        html.style.overflow = 'hidden';
        body.style.overflow = 'hidden';

        return () => {
            html.style.overflow = prevHtmlOverflow;
            body.style.overflow = prevBodyOverflow;
        };
    }, []);

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
            <div className="h-[calc(100vh-7rem)] min-h-0 overflow-hidden">
                <div className="max-w-4xl mx-auto h-full min-h-0 flex flex-col">
                    <div className="flex-shrink-0">
                        <h1 className="text-3xl md:text-4xl font-display font-bold mb-1 tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-gray-300 via-gray-400 to-gray-500 drop-shadow-lg animate-fade-in">
                            Settings
                        </h1>
                        <p className="text-muted-foreground mb-5 text-base animate-fade-in animation-delay-100">Manage your account and workspace preferences.</p>
                    </div>

                    <div className="flex-1 min-h-0 overflow-hidden">
                        <div className="flex flex-col md:flex-row gap-6 h-full min-h-0">
                            {/* Settings Sidebar */}
                            <div className="w-full md:w-64 flex-shrink-0 animate-fade-in animation-delay-200">
                                <nav className="space-y-2 bg-black/40 backdrop-blur-sm p-2 rounded-xl border border-border shadow-float ai-card">
                                    {tabs.map(tab => (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all duration-300 ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-glow transform scale-105'
                                                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground hover:scale-105 hover:shadow-float'
                                                }`}
                                        >
                                            {tab.icon}
                                            <span>{tab.label}</span>
                                        </button>
                                    ))}
                                </nav>
                            </div>

                            {/* Main Settings Content */}
                            <div className="flex-1 min-h-0 overflow-hidden space-y-5">
                                {activeTab === 'account' && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <section className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl border border-border shadow-float hover:shadow-glow overflow-hidden transition-all duration-500 ai-card">
                                            <div className="px-4 py-3 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-md border-b border-border">
                                                <h3 className="text-base font-bold text-foreground">Profile Information</h3>
                                                <p className="text-muted-foreground text-xs mt-0.5">Public facing details.</p>
                                            </div>
                                            <div className="p-4 space-y-5">
                                                <div className="flex items-center space-x-5">
                                                    <div className="relative">
                                                        {getProfileImageUrl() ? (
                                                            <img
                                                                src={getProfileImageUrl()!}
                                                                alt="Profile"
                                                                className="h-20 w-20 rounded-full object-cover border-4 border-border/60 shadow-float hover:shadow-glow transition-all duration-300"
                                                            />
                                                        ) : (
                                                            <div className="h-20 w-20 bg-gradient-to-br from-primary to-accent text-white rounded-full flex items-center justify-center text-xl font-bold shadow-float border-4 border-border/60">
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
                                                    <div className="space-y-2">
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
                                                        <p className="text-xs text-muted-foreground">
                                                            JPG, PNG or GIF. Max 5MB.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <Input label="Full Name" defaultValue={user?.email.split('@')[0]} />
                                                    <Input label="Email Address" defaultValue={user?.email} disabled className="bg-secondary/60 backdrop-blur-md text-muted-foreground" />
                                                </div>
                                            </div>
                                            <div className="px-4 py-3 bg-gradient-to-r from-secondary/60 to-secondary/40 backdrop-blur-md border-t border-border flex justify-end">
                                                <Button size="sm" className="hover:scale-105 transition-transform duration-200">Save Changes</Button>
                                            </div>
                                        </section>

                                        <section className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl border border-destructive/40 shadow-float hover:shadow-glow overflow-hidden transition-all duration-500 ai-card">
                                            <div className="px-4 py-3 bg-gradient-to-r from-red-500/10 to-red-500/5 backdrop-blur-md border-b border-red-500/30 flex items-center justify-between">
                                                <div>
                                                    <h3 className="text-base font-bold text-red-400">Danger Zone</h3>
                                                </div>
                                                <LogOut size={18} className="text-red-400" />
                                            </div>
                                            <div className="p-4 flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-semibold text-foreground">Delete Account</h4>
                                                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">Permanently remove your account and all data.</p>
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
                                    <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                        <section className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl border border-border shadow-float hover:shadow-glow overflow-hidden transition-all duration-500 ai-card">
                                            <div className="px-4 py-3 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-md border-b border-border">
                                                <h3 className="text-base font-bold text-foreground">Model Configuration</h3>
                                                <p className="text-muted-foreground text-xs mt-0.5">Control how CodeLens analyzes your code.</p>
                                            </div>
                                            <div className="p-4 space-y-5">
                                                <Input label="OpenAI API Key" type="password" placeholder="sk-..." />
                                                <div className="flex items-center justify-between py-3 p-4 bg-gradient-to-r from-primary/10 to-accent/10 backdrop-blur-md rounded-lg border border-border">
                                                    <div>
                                                        <h4 className="font-semibold text-foreground">Default Model</h4>
                                                        <p className="text-xs text-muted-foreground">Choose the reasoning engine.</p>
                                                    </div>
                                                    <select className="block w-48 rounded-lg border border-border bg-black/60 backdrop-blur-md px-4 py-2.5 text-foreground focus:border-primary focus:ring-primary sm:text-sm outline-none shadow-float hover:shadow-glow transition-all duration-300">
                                                        <option className="bg-black text-muted-foreground">GPT-4o (Recommended)</option>
                                                        <option className="bg-black text-muted-foreground">Claude 3.5 Sonnet</option>
                                                        <option className="bg-black text-muted-foreground">Llama 3 70B</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center justify-between border-t border-border pt-6 p-4 bg-gradient-to-r from-accent/20 to-primary/20 backdrop-blur-md rounded-lg border border-border">
                                                    <div>
                                                        <h4 className="font-semibold text-foreground">Auto-Index on Push</h4>
                                                        <p className="text-xs text-muted-foreground">Re-index repos when commits are detected.</p>
                                                    </div>
                                                    <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                                        <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-card border-4 appearance-none cursor-pointer checked:right-0 checked:border-accent shadow-float" />
                                                        <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-secondary/60 cursor-pointer shadow-inner"></label>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-4 py-3 bg-gradient-to-r from-secondary/60 to-secondary/40 backdrop-blur-md border-t border-border flex justify-end">
                                                <Button size="sm" className="hover:scale-105 transition-transform duration-200">Update Config</Button>
                                            </div>
                                        </section>
                                    </div>
                                )}

                                {activeTab === 'notifications' && (
                                    <div className="relative overflow-hidden bg-black/40 backdrop-blur-sm rounded-xl border border-border shadow-float hover:shadow-glow p-10 text-center text-muted-foreground transition-all duration-500 animate-in fade-in slide-in-from-right-4 ai-card">
                                        <div className="w-16 h-16 bg-gradient-to-br from-primary/30 to-accent/30 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-6 shadow-float">
                                            <Bell size={32} className="text-muted-foreground/60" />
                                        </div>
                                        <h3 className="text-xl font-bold text-foreground mb-3">Notifications</h3>
                                        <p className="text-muted-foreground text-lg">Coming soon in v2.1</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};