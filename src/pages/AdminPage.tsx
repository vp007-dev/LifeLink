import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, Clock, CheckCircle, Download, Map } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import Header from '@/components/common/Header';
import StatCard from '@/components/admin/StatCard';
import ActivityLog from '@/components/admin/ActivityLog';
import IncidentHeatmap from '@/components/admin/IncidentHeatmap';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
            <Button variant="glass" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          }
        />
      }
    >
      <div className="flex-1 p-4 space-y-4 overflow-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Active Emergencies"
            value={3}
            icon={AlertTriangle}
            variant="emergency"
            trend="up"
            trendValue="2"
          />
          <StatCard
            title="Responders Online"
            value={47}
            icon={Users}
            variant="success"
            trend="up"
            trendValue="12%"
          />
          <StatCard
            title="Avg Response Time"
            value="3.2m"
            icon={Clock}
            variant="primary"
            trend="down"
            trendValue="15%"
          />
          <StatCard
            title="Resolved Today"
            value={28}
            icon={CheckCircle}
            variant="success"
          />
        </div>

        {/* Real Heatmap */}
        <Card variant="gradient" className="animate-fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Incident Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IncidentHeatmap />
          </CardContent>
        </Card>

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
