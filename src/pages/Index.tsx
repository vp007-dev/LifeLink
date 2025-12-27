import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Shield, BarChart3, Heart } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import RoleCard from '@/components/common/RoleCard';

const Index: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout className="p-4">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        {/* Logo and Title */}
        <div className="text-center mb-10 stagger-children">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl primary-gradient primary-shadow mb-6">
            <Heart className="w-10 h-10 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            LifeLink
          </h1>
          <p className="text-muted-foreground">
            Emergency First Responder Network
          </p>
        </div>

        {/* Role Selection */}
        <div className="space-y-4 stagger-children">
          <RoleCard
            title="Emergency Help"
            description="Request immediate medical assistance"
            icon={Phone}
            variant="emergency"
            onClick={() => navigate('/emergency')}
          />
          
          <RoleCard
            title="Responder"
            description="Help people in medical emergencies"
            icon={Shield}
            variant="primary"
            onClick={() => navigate('/responder')}
          />
          
          <RoleCard
            title="Admin Dashboard"
            description="Monitor and manage emergency responses"
            icon={BarChart3}
            onClick={() => navigate('/admin')}
          />
        </div>

        {/* Legal Notice */}
        <div className="mt-10 p-4 rounded-lg bg-secondary/30 border border-border/50">
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
