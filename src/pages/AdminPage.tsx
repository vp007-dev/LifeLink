import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Users, Clock, CheckCircle, Download, Map } from 'lucide-react';
import MobileLayout from '@/components/layout/MobileLayout';
import Header from '@/components/common/Header';
import StatCard from '@/components/admin/StatCard';
import ActivityLog from '@/components/admin/ActivityLog';
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

        {/* Heatmap Placeholder */}
        <Card variant="gradient" className="animate-fade-in-up">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="w-5 h-5 text-primary" />
              Incident Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video rounded-lg bg-secondary/50 flex items-center justify-center relative overflow-hidden">
              {/* Simulated heatmap */}
              <div className="absolute inset-0">
                <div className="absolute top-1/4 left-1/3 w-16 h-16 rounded-full bg-emergency/30 blur-xl" />
                <div className="absolute top-1/2 left-1/2 w-20 h-20 rounded-full bg-emergency/40 blur-xl" />
                <div className="absolute bottom-1/3 right-1/4 w-12 h-12 rounded-full bg-warning/30 blur-xl" />
                <div className="absolute top-1/3 right-1/3 w-10 h-10 rounded-full bg-warning/20 blur-xl" />
              </div>
              <div className="relative z-10 text-center">
                <Map className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Delhi NCR Region
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emergency/50" />
                <span>High</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-warning/50" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-success/50" />
                <span>Low</span>
              </div>
            </div>
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
