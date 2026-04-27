import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Users, UserPlus, Receipt, Download, Search, CheckCircle, Clock, 
  MoreVertical, Calendar, Plus, Trash2, ClipboardList
} from 'lucide-react';
import { formatCOP } from '../../utils/formatters';

const PersonalPage = () => {
  const [activeTab, setActiveTab] = useState('trabajadores');
  const [trabajadores, setTrabajadores] = useState([]);
  const [jornales, setJornales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    cargo: 'Jornalero',
    valor_jornal: '',
    estado: 'activo'
  });

  // Jornal Form State
  const [jornalData, setJornalData] = useState({
    trabajador_id: '',
    fecha: new Date().toISOString().split('T')[0],
    cantidad: 1,
    observaciones: ''
  });

  useEffect(() => {
    fetchTrabajadores();
    const unsubscribeJornales = listenJornales();
    return () => unsubscribeJornales();
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

  const listenJornales = () => {
    const q = query(collection(db, 'jornales'), orderBy('fecha', 'desc'));
    return onSnapshot(q, (snapshot) => {
      setJornales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'trabajadores'), {
        ...formData,
        fecha_registro: new Date().toISOString()
      });
      setIsModalOpen(false);
      setFormData({ nombre: '', cedula: '', cargo: 'Jornalero', valor_jornal: '', estado: 'activo' });
      fetchTrabajadores();
    } catch (error) {
      console.error("Error adding worker:", error);
    }
  };

  const handleSaveJornal = async (e) => {
    e.preventDefault();
    if (!jornalData.trabajador_id) return alert("Selecciona un trabajador");
    
    const trabajador = trabajadores.find(t => t.id === jornalData.trabajador_id);
    const valorUnitario = Number(trabajador.valor_jornal || 0);
    const total = valorUnitario * Number(jornalData.cantidad);

    try {
      await addDoc(collection(db, 'jornales'), {
        ...jornalData,
        trabajador_nombre: trabajador.nombre,
        valor_unitario: valorUnitario,
        total_pago: total,
        estado_pago: 'pendiente',
        timestamp: new Date().toISOString()
      });
      setJornalData({ ...jornalData, observaciones: '', cantidad: 1 });
      alert("Jornal registrado con éxito");
    } catch (error) {
      console.error("Error saving jornal:", error);
    }
  };

  const handleDeleteJornal = async (id) => {
    if (window.confirm("¿Eliminar este registro de jornal?")) {
      await deleteDoc(doc(db, 'jornales', id));
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
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <UserPlus size={20} />
            Nuevo Trabajador
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('trabajadores')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'trabajadores' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <Users size={18} />
          Trabajadores
        </button>
        <button 
          onClick={() => setActiveTab('jornales')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'jornales' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <ClipboardList size={18} />
          Registro de Jornales
        </button>
        <button 
          onClick={() => setActiveTab('liquidaciones')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'liquidaciones' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <Receipt size={18} />
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

      {activeTab === 'jornales' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="card bg-gray-50 p-6 border-none shadow-inner">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Plus className="text-primary" size={20} />
              Registrar Nuevo Jornal
            </h3>
            <form onSubmit={handleSaveJornal} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Trabajador</label>
                <select 
                  className="input-field bg-white"
                  value={jornalData.trabajador_id}
                  onChange={e => setJornalData({...jornalData, trabajador_id: e.target.value})}
                  required
                >
                  <option value="">Selecciona trabajador...</option>
                  {trabajadores.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Fecha</label>
                <input 
                  type="date"
                  className="input-field bg-white"
                  value={jornalData.fecha}
                  onChange={e => setJornalData({...jornalData, fecha: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Cantidad (Jornales)</label>
                <input 
                  type="number"
                  step="0.5"
                  className="input-field bg-white"
                  value={jornalData.cantidad}
                  onChange={e => setJornalData({...jornalData, cantidad: e.target.value})}
                  required
                />
              </div>
              <button type="submit" className="btn-primary h-[45px] flex items-center justify-center gap-2">
                <CheckCircle size={18} />
                Guardar Registro
              </button>
              <div className="md:col-span-4 mt-2">
                <input 
                  className="input-field bg-white"
                  placeholder="Observaciones o labor específica..."
                  value={jornalData.observaciones}
                  onChange={e => setJornalData({...jornalData, observaciones: e.target.value})}
                />
              </div>
            </form>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr className="text-left text-[10px] font-black uppercase text-gray-400 tracking-widest">
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Trabajador</th>
                    <th className="p-4 text-center">Cant.</th>
                    <th className="p-4">V. Unitario</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jornales.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="p-8 text-center text-gray-400 italic">No hay jornales registrados este mes</td>
                    </tr>
                  ) : (
                    jornales.map(j => (
                      <tr key={j.id} className="hover:bg-gray-50">
                        <td className="p-4 text-sm font-bold text-gray-700">{j.fecha}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-primary-light rounded-full flex items-center justify-center text-[10px] font-black text-primary">
                              {j.trabajador_nombre?.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900 text-sm">{j.trabajador_nombre}</span>
                          </div>
                        </td>
                        <td className="p-4 text-center font-black text-primary">{j.cantidad}</td>
                        <td className="p-4 text-sm text-gray-500">{formatCOP(j.valor_unitario)}</td>
                        <td className="p-4 font-black text-gray-900">{formatCOP(j.total_pago)}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${j.estado_pago === 'pagado' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            {j.estado_pago}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDeleteJornal(j.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal CRUD Trabajadores */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-primary-light text-primary rounded-xl"><UserPlus size={20}/></div>
              Registrar Nuevo Trabajador
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo</label>
                  <input 
                    className="input-field" 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Juan Pérez"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cédula / ID</label>
                  <input 
                    className="input-field" 
                    value={formData.cedula}
                    onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                    placeholder="12345678"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Cargo</label>
                  <select 
                    className="input-field"
                    value={formData.cargo}
                    onChange={(e) => setFormData({...formData, cargo: e.target.value})}
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Mayordomo">Mayordomo</option>
                    <option value="Jornalero">Jornalero</option>
                    <option value="Cosechador">Cosechador</option>
                    <option value="Conductor">Conductor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Valor Jornal / Mes</label>
                  <input 
                    type="number"
                    className="input-field" 
                    value={formData.valor_jornal}
                    onChange={(e) => setFormData({...formData, valor_jornal: e.target.value})}
                    placeholder="50000"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
                  <select 
                    className="input-field"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary py-3 px-4 shadow-lg shadow-primary/20">Guardar Trabajador</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sección de Liquidaciones */}
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
                    <th className="p-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {/* ... (resto del código de liquidaciones se mantiene igual) */}
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
      )}
    </div>
  );
};

export default PersonalPage;
