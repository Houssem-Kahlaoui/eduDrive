import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import ProfileModal from '../ui/ProfileModal'; 

export default function DashboardLayout() {
  return (
    <div className="dashboard">
      <Header />
      <ProfileModal /> 

      <div className="dash-body">
        <Sidebar />
        <main className="dash-main">
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}