import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Users, UserPlus, Receipt, Download, Search, CheckCircle, Clock, MoreVertical } from 'lucide-react';
import { formatCOP } from '../../utils/formatters';

const PersonalPage = () => {
  const [activeTab, setActiveTab] = useState('trabajadores');
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrabajadores();
  }, []);

  const fetchTrabajadores = async () => {
    try {
      const q = query(collection(db, 'trabajadores'), orderBy('nombre'));
      const snapshot = await getDocs(q);
      setTrabajadores(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Users className="text-primary" size={32} />
            Gestión de Personal
          </h2>
          <p className="text-gray-500 font-medium">Administra trabajadores, jornales y liquidaciones quincenales</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20">
            <UserPlus size={20} />
            Nuevo Trabajador
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('trabajadores')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'trabajadores' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Trabajadores
        </button>
        <button 
          onClick={() => setActiveTab('jornales')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'jornales' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Registro de Jornales
        </button>
        <button 
          onClick={() => setActiveTab('liquidaciones')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'liquidaciones' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Liquidación Quincenal
        </button>
      </div>

      {activeTab === 'trabajadores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trabajadores.length === 0 ? (
            <div className="col-span-full py-20 text-center card bg-gray-50 border-dashed border-2">
              <p className="text-gray-400 font-medium">No hay trabajadores registrados. Comienza agregando uno.</p>
            </div>
          ) : (
            trabajadores.map(t => (
              <div key={t.id} className="card p-6 flex flex-col gap-4 group hover:border-primary/20 transition-all">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 bg-primary-light rounded-2xl flex items-center justify-center text-primary font-bold text-xl">
                    {t.nombre.charAt(0)}
                  </div>
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${t.estado === 'activo' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                    {t.estado}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{t.nombre}</h3>
                  <p className="text-sm text-gray-500 font-medium uppercase tracking-tight">{t.cargo}</p>
                </div>
                <div className="space-y-2 pt-2 border-t border-gray-50">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Cédula:</span>
                    <span className="font-bold text-gray-700">{t.cedula}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Salario/Jornal:</span>
                    <span className="font-black text-primary">{formatCOP(t.salario_mensual || t.valor_jornal)}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'liquidaciones' && (
        <div className="space-y-6">
          <div className="card p-8 bg-gray-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 border-none shadow-xl">
            <div>
              <p className="text-primary font-bold uppercase text-xs tracking-widest mb-1">Corte Actual</p>
              <h3 className="text-3xl font-black">Quincena Q1 — Abril 2026</h3>
              <p className="text-gray-400 text-sm mt-1">Periodo del 01 al 15 de abril</p>
            </div>
            <button className="bg-primary hover:bg-opacity-90 px-8 py-4 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-lg shadow-primary/30">
              Generar Nómina Quincenal
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <th className="p-4">Trabajador</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Devengado</th>
                    <th className="p-4">Deducciones</th>
                    <th className="p-4">Neto a Pagar</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {[1, 2, 3].map(i => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">Ejemplo Trabajador {i}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">C.C. 12345678</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4"><span className="text-xs font-bold text-gray-500">Jornalero</span></td>
                      <td className="p-4 font-bold text-sm text-gray-800">{formatCOP(750000)}</td>
                      <td className="p-4 font-bold text-sm text-red-500">{formatCOP(50000)}</td>
                      <td className="p-4 font-black text-sm text-gray-900">{formatCOP(700000)}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-[10px] font-black uppercase">Pendiente</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button className="p-2 bg-primary-light text-primary rounded-lg hover:bg-primary hover:text-white transition-all"><Download size={16}/></button>
                          <button className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-all"><MoreVertical size={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalPage;
