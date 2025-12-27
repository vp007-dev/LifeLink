import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Shield, BarChart3 } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import RoleCard from '@/components/common/RoleCard';
import ThemeToggle from '@/components/theme/ThemeToggle';
import logo from '@/assets/logo.png';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout className="px-5 pb-5">
      <div className="flex-1 flex flex-col justify-center relative">
        {/* Theme toggle */}
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>

        {/* Logo and Title */}
        <div className="text-center mb-10 stagger-children">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4">
            <img src={logo} alt="LifeLink Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-1">
            LifeLink
          </h1>
          <p className="text-sm text-muted-foreground">
            Emergency First Responder Network
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-3 stagger-children">
          <RoleCard
            title="Emergency Help"
            description="Request immediate assistance"
            icon={Phone}
            variant="emergency"
            onClick={() => navigate('/emergency')}
          />
          
          <RoleCard
            title="Responder"
            description="Help people in emergencies"
            icon={Shield}
            variant="primary"
            onClick={() => navigate('/responder')}
          />
          
          <RoleCard
            title="Admin Dashboard"
            description="Monitor emergency responses"
            icon={BarChart3}
            onClick={() => navigate('/admin')}
          />
        </div>

        {/* Legal Notice */}
        <div className="mt-8 p-4 rounded-2xl bg-secondary">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            <span className="font-semibold text-foreground">Good Samaritan Protection:</span>{' '}
            Under Indian law, anyone helping a road accident victim is protected from legal liability.
          </p>
        </div>

        {/* Version */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          v1.0.0 • Government of India Initiative
        </p>
      </div>
    </MobileLayout>
  );
};

export default Index;
