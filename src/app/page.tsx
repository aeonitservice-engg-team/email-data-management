import { Header } from '@/components/layout';
import { DashboardContent } from './DashboardContent';

/**
 * Dashboard Page
 * 
 * Main dashboard showing analytics and statistics.
 */
export default function DashboardPage() {
  return (
    <>
      <Header
        title="Dashboard"
        description="Overview of your email collection data"
      />
      <DashboardContent />
    </>
  );
}
