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
  Bell,
  Info,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../firebase/config';
import { signOut } from 'firebase/auth';
import { CURRENT_VERSION, VERSION_HISTORY } from '../../utils/versions';

const AppLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
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

        <div className="p-4 border-t border-gray-100 space-y-2">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
          >
            <LogOut size={22} />
            {!isCollapsed && <span className="font-semibold">Cerrar Sesión</span>}
          </button>
          
          <button
            onClick={() => setIsChangelogOpen(true)}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all w-full text-xs font-bold border border-gray-100/60"
          >
            <Info size={14} />
            {!isCollapsed && <span>Versión {CURRENT_VERSION}</span>}
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
      {/* Modal de Versiones */}
      {isChangelogOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-light text-primary rounded-2xl">
                  <Sparkles size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 leading-none">Historial de Actualizaciones</h3>
                  <p className="text-gray-400 text-xs mt-1 font-semibold">Registro de versiones y mejoras de Optifrutas</p>
                </div>
              </div>
              <button 
                onClick={() => setIsChangelogOpen(false)}
                className="text-sm font-bold text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all"
              >
                Cerrar
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin">
              {VERSION_HISTORY.map((v, idx) => (
                <div key={v.version} className="relative pl-8 border-l border-gray-100 last:border-l-0">
                  {/* Dot */}
                  <div className={`absolute -left-[9px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
                    idx === 0 ? 'bg-primary animate-ping' : 'bg-gray-300'
                  }`}></div>
                  {/* Active Dot */}
                  {idx === 0 && (
                    <div className="absolute -left-[9px] top-1.5 w-4.5 h-4.5 rounded-full border-4 border-white shadow-sm bg-primary"></div>
                  )}

                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase ${
                        idx === 0 ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'
                      }`}>
                        v{v.version}
                      </span>
                      <span className="text-gray-400 text-xs font-bold">{v.date}</span>
                      {idx === 0 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Versión Activa
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-extrabold text-gray-900">{v.title}</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{v.description}</p>
                    
                    {v.changes && v.changes.length > 0 && (
                      <ul className="mt-3 bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100/50">
                        {v.changes.map((change, cIdx) => (
                          <li key={cIdx} className="text-xs text-gray-600 flex items-start gap-2 leading-relaxed">
                            <span className="text-primary font-bold mt-0.5">•</span>
                            <span className="font-semibold">{change}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center text-xs text-gray-400">
              <span className="font-semibold">Optifrutas © 2026</span>
              <span className="font-bold bg-gray-50 px-3 py-1 rounded-full text-[10px] uppercase text-gray-500">
                Finca La Dalia
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLayout;
