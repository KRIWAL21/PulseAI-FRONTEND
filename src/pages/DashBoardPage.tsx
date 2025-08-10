import Sidebar from '../components/dashboard/Sidebar';
import ChatWindow from '../components/dashboard/ChatWindow';

const DashboardPage = () => {
  return (
    <div className="h-screen w-screen flex bg-gray-50">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <ChatWindow />
      </main>
    </div>
  );
};
export default DashboardPage;
