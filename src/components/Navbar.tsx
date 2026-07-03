/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraduationCap, Lock, LogOut, Award, ShieldAlert, LayoutDashboard, Globe } from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  session: UserSession | null;
  onLoginClick: () => void;
  onLogout: () => void;
  currentView: 'public' | 'dashboard';
  onNavigate: (view: 'public' | 'dashboard') => void;
}

export default function Navbar({ session, onLoginClick, onLogout, currentView, onNavigate }: NavbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Section */}
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => onNavigate('public')}
            id="navbar-logo"
          >
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="font-sans font-bold text-lg tracking-tight text-slate-800">
                AkridaKampus
              </span>
              <span className="block text-[10px] font-mono tracking-wider uppercase text-slate-400 font-semibold leading-none mt-0.5">
                Akreditasi & Mutu Internal
              </span>
            </div>
          </div>

          {/* Nav Links / Profile */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onNavigate('public')}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'public'
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              id="nav-btn-public"
            >
              <Globe className="h-4 w-4" />
              <span>Portal Publik</span>
            </button>

            {session && (
              <button
                onClick={() => onNavigate('dashboard')}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  currentView === 'dashboard'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
                id="nav-btn-dashboard"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard Admin</span>
              </button>
            )}

            <div className="h-5 w-[1px] bg-slate-200" />

            {session ? (
              <div className="flex items-center space-x-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-800 leading-tight">
                    {session.name}
                  </span>
                  <span className="text-[10px] font-mono font-medium text-slate-400 capitalize">
                    {session.role === 'superadmin' ? 'Super Admin' : 'Admin Prodi'}
                  </span>
                </div>
                
                {/* Avatar Badge */}
                <div className="h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold select-none">
                  {session.name.substring(0, 2).toUpperCase()}
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Logout dari sistem"
                  id="navbar-btn-logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition-all duration-200 cursor-pointer"
                id="navbar-btn-login"
              >
                <Lock className="h-4 w-4" />
                <span>Login Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
