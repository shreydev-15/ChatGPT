import { useState } from 'react';
import { ChatProvider } from '../context/ChatContext';
import ChatWindow from '../components/ChatWindow';
import Sidebar from '../components/Sidebar';

function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="app-main">
        <ChatWindow onOpenSidebar={() => setSidebarOpen(true)} />
      </main>
    </div>
  );
}

export default function Chat() {
  return (
    <ChatProvider>
      <ChatLayout />
    </ChatProvider>
  );
}
