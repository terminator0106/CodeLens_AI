import React, { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuthStore } from '../store';
import { User, Bell, Lock, Sparkles, Monitor, LogOut } from 'lucide-react';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

export const Settings: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('account');

    const tabs = [
        { id: 'account', label: 'Account', icon: <User size={18} /> },
        { id: 'ai', label: 'AI Behavior', icon: <Sparkles size={18} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 font-display mb-2 tracking-tight">Settings</h1>
                <p className="text-gray-500 mb-8 text-lg">Manage your account and workspace preferences.</p>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Settings Sidebar */}
                    <div className="w-full md:w-64 flex-shrink-0">
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                            ? 'bg-white text-primary shadow-sm ring-1 ring-gray-200'
                                            : 'text-gray-500 hover:bg-white hover:text-gray-900'
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
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100">
                                        <h3 className="text-base font-bold text-gray-900">Profile Information</h3>
                                        <p className="text-gray-500 text-xs mt-0.5">Public facing details.</p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="flex items-center space-x-6">
                                            <div className="h-20 w-20 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-100 border-4 border-indigo-50">
                                                {user?.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="flex space-x-3">
                                                    <Button variant="outline" size="sm">Upload New</Button>
                                                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">Remove</Button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="Full Name" defaultValue={user?.email.split('@')[0]} />
                                            <Input label="Email Address" defaultValue={user?.email} disabled className="bg-gray-50 text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                        <Button size="sm">Save Changes</Button>
                                    </div>
                                </section>

                                <section className="bg-white rounded-xl border border-red-100 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-red-50 bg-red-50/30 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-base font-bold text-red-700">Danger Zone</h3>
                                        </div>
                                        <LogOut size={16} className="text-red-400" />
                                    </div>
                                    <div className="p-6 flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-gray-900">Delete Account</h4>
                                            <p className="text-sm text-gray-500 mt-1 max-w-sm">Permanently remove your account and all data.</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={async () => {
                                                    await api.logout();
                                                    logout();
                                                    navigate('/login');
                                                }}
                                            >
                                                Log out
                                            </Button>
                                            <Button variant="danger" size="sm">Delete Account</Button>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'ai' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                    <div className="px-6 py-4 border-b border-gray-100">
                                        <h3 className="text-base font-bold text-gray-900">Model Configuration</h3>
                                        <p className="text-gray-500 text-xs mt-0.5">Control how CodeLens analyzes your code.</p>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <Input label="OpenAI API Key" type="password" placeholder="sk-..." />
                                        <div className="flex items-center justify-between py-2">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Default Model</h4>
                                                <p className="text-sm text-gray-500">Choose the reasoning engine.</p>
                                            </div>
                                            <select className="block w-48 rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-primary focus:ring-primary sm:text-sm outline-none">
                                                <option>GPT-4o (Recommended)</option>
                                                <option>Claude 3.5 Sonnet</option>
                                                <option>Llama 3 70B</option>
                                            </select>
                                        </div>
                                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                            <div>
                                                <h4 className="font-medium text-gray-900">Auto-Index on Push</h4>
                                                <p className="text-sm text-gray-500">Re-index repos when commits are detected.</p>
                                            </div>
                                            <div className="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                                <input type="checkbox" name="toggle" id="toggle" className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-green-400" />
                                                <label htmlFor="toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                                        <Button size="sm">Update Config</Button>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
                                <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                <p>Coming soon in v2.1</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};