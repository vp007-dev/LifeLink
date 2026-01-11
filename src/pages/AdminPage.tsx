import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, Clock, CheckCircle, Download, Map } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import Header from '@/components/common/Header';
import ThemeToggle from '@/components/theme/ThemeToggle';
import StatCard from '@/components/admin/StatCard';
import ActivityLog from '@/components/admin/ActivityLog';
import IncidentHeatmap from '@/components/admin/IncidentHeatmap';
import { Button } from '@/components/ui/button';

const mockActivities = [
  {
    id: '1',
    type: 'resolved' as const,
    title: 'Medical Emergency - Cardiac',
    location: 'Sector 18, Noida',
    time: '5 min ago',
    responder: 'Rajesh Kumar',
  },
  {
    id: '2',
    type: 'emergency' as const,
    title: 'Road Accident',
    location: 'NH-24, Ghaziabad',
    time: '12 min ago',
  },
  {
    id: '3',
    type: 'resolved' as const,
    title: 'Medical Emergency',
    location: 'Sector 62, Noida',
    time: '28 min ago',
    responder: 'Amit Singh',
  },
  {
    id: '4',
    type: 'cancelled' as const,
    title: 'False Alarm',
    location: 'Greater Noida',
    time: '45 min ago',
  },
];

const AdminPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout
      header={
        <Header
          title="Admin Dashboard"
          subtitle="Emergency response analytics"
          showBack
          onBack={() => navigate('/')}
          action={
            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center touch-feedback" aria-label="Download report" title="Download">
                <Download className="w-5 h-5 text-foreground" />
              </button>
              <ThemeToggle />
            </div>
          }
        />
      }
    >
      <div className="flex-1 px-5 pb-5 space-y-4 overflow-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Active"
            value={3}
            icon={AlertTriangle}
            variant="emergency"
            trend="up"
            trendValue="2"
          />
          <StatCard
            title="Responders"
            value={47}
            icon={Users}
            variant="success"
            trend="up"
            trendValue="12%"
          />
          <StatCard
            title="Avg Time"
            value="3.2m"
            icon={Clock}
            variant="primary"
            trend="down"
            trendValue="15%"
          />
          <StatCard
            title="Resolved"
            value={28}
            icon={CheckCircle}
            variant="success"
          />
        </div>

        {/* Heatmap Section */}
        <div className="rounded-2xl bg-secondary p-4 animate-fade-in-up">
          <div className="flex items-center gap-2 mb-3">
            <Map className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Incident Heatmap</h3>
          </div>
          <IncidentHeatmap />
        </div>

        {/* Activity Log */}
        <ActivityLog activities={mockActivities} />

        {/* Export Button */}
        <Button variant="outline" size="lg" className="w-full">
          <Download className="w-5 h-5 mr-2" />
          Export Report
        </Button>
      </div>
    </MobileLayout>
  );
};

export default AdminPage;
