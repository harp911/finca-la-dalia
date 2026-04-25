import { useState } from 'react';
import { Settings, Users, Building2, ShieldCheck, Database, Save, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ConfiguracionPage = () => {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState('empresa');

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <Settings className="text-primary" size={32} />
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Configuración Global</h2>
          <p className="text-gray-500 font-medium">Gestiona parámetros del sistema, usuarios y datos de la empresa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-2">
          <TabButton 
            active={activeTab === 'empresa'} 
            onClick={() => setActiveTab('empresa')} 
            icon={<Building2 size={20}/>} 
            label="Datos Empresa" 
          />
          <TabButton 
            active={activeTab === 'usuarios'} 
            onClick={() => setActiveTab('usuarios')} 
            icon={<Users size={20}/>} 
            label="Usuarios y Roles" 
          />
          <TabButton 
            active={activeTab === 'parametros'} 
            onClick={() => setActiveTab('parametros')} 
            icon={<ShieldCheck size={20}/>} 
            label="Parámetros Sistema" 
          />
          <TabButton 
            active={activeTab === 'backup'} 
            onClick={() => setActiveTab('backup')} 
            icon={<Database size={20}/>} 
            label="Respaldo de Datos" 
          />
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'empresa' && (
            <div className="card space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Información de Optifrutas</h3>
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Nombre de la Empresa" value="Optifrutas S.A.S." />
                <InputGroup label="NIT" value="900.123.456-7" />
                <InputGroup label="Dirección" value="Vía Principal, Chigorodó, Antioquia" />
                <InputGroup label="Teléfono" value="+57 300 123 4567" />
              </div>
              <button className="btn-primary flex items-center gap-2 px-6">
                <Save size={18} /> Guardar Cambios
              </button>
            </div>
          )}

          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Usuarios del Sistema</h3>
                <button className="btn-primary flex items-center gap-2 text-sm px-4">
                  <UserPlus size={18} /> Nuevo Usuario
                </button>
              </div>
              <div className="card overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 border-b">
                    <tr className="text-[10px] font-black uppercase text-gray-400">
                      <th className="p-4">Nombre</th>
                      <th className="p-4">Correo</th>
                      <th className="p-4">Rol</th>
                      <th className="p-4">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <UserRow nombre="Hamilton Restrepo" email="hrestrepo@optifrutas.com" rol="Propietario" estado="activo" />
                    <UserRow nombre="Carlos Mario" email="cmario@optifrutas.com" rol="Mayordomo" estado="activo" />
                    <UserRow nombre="Sandra López" email="slopez@optifrutas.com" rol="Contador" estado="activo" />
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'parametros' && (
            <div className="card space-y-6">
              <h3 className="text-xl font-bold text-gray-800">Parámetros de Operación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Precios Referencia / Kg</h4>
                  <InputGroup label="Primera Calidad" value="$ 3.200" />
                  <InputGroup label="Segunda Calidad" value="$ 1.800" />
                  <InputGroup label="Rechazo" value="$ 800" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b pb-2">Costos Operativos</h4>
                  <InputGroup label="Valor Jornal Base" value="$ 50.000" />
                  <InputGroup label="Combustible Ltr" value="$ 4.200" />
                  <InputGroup label="Hora Tractor" value="$ 85.000" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
      active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:bg-gray-100'
    }`}
  >
    {icon}
    {label}
  </button>
);

const InputGroup = ({ label, value }) => (
  <div>
    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1">{label}</label>
    <input className="input-field bg-white" defaultValue={value} />
  </div>
);

const UserRow = ({ nombre, email, rol, estado }) => (
  <tr className="hover:bg-gray-50 text-sm">
    <td className="p-4 font-bold text-gray-800">{nombre}</td>
    <td className="p-4 text-gray-500">{email}</td>
    <td className="p-4">
      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase">{rol}</span>
    </td>
    <td className="p-4">
      <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-[10px] font-black uppercase">{estado}</span>
    </td>
  </tr>
);

export default ConfiguracionPage;
