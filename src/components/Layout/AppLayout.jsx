import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Map, 
  Leaf, 
  Users, 
  Package, 
  Truck, 
  DollarSign, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { userData, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Lotes', path: '/lotes', icon: Map },
    { name: 'Cosecha', path: '/cosecha', icon: Leaf },
    { name: 'Personal', path: '/personal', icon: Users },
    { name: 'Inventario', path: '/inventario', icon: Package },
    { name: 'Transporte', path: '/transporte', icon: Truck },
    { name: 'Ventas', path: '/ventas', icon: DollarSign },
  ];

  if (isAdmin) {
    navItems.push({ name: 'Configuración', path: '/configuracion', icon: Settings });
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-6 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">L</div>
              <span className="font-extrabold text-xl tracking-tight text-primary">Optifrutas</span>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-primary-light text-primary font-semibold' 
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}
              `}
            >
              <item.icon size={22} />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          >
            <LogOut size={22} />
            {!isCollapsed && <span>Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <h1 className="text-xl font-bold text-gray-800">Finca La Dalia</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-primary transition-colors relative">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-secondary rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 border-l pl-4 border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{userData?.nombre || 'Usuario'}</p>
                <p className="text-xs text-gray-500 capitalize">{userData?.rol || 'Invitado'}</p>
              </div>
              <div className="w-10 h-10 bg-secondary-light rounded-full flex items-center justify-center text-secondary font-bold">
                {userData?.nombre?.charAt(0) || 'U'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
