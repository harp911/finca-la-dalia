import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Leaf, Plus, Calendar, Filter, Download, CheckCircle2, Clock } from 'lucide-react';
import { getWeekNumber, getCurrentWeek, getCurrentYear } from '../../utils/weekUtils';
import { formatKg } from '../../utils/formatters';

const CosechaPage = () => {
  const [cosechas, setCosechas] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    lote_id: '',
    kilos_primera: 0,
    kilos_segunda: 0,
    kilos_rechazo: 0,
    observaciones: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch lotes for select
      const lotesSnapshot = await getDocs(collection(db, 'lotes'));
      const lotesData = lotesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLotes(lotesData);

      // Fetch cosechas
      const q = query(collection(db, 'cosechas'), orderBy('timestamp', 'desc'));
      const cosechasSnapshot = await getDocs(q);
      const cosechasData = cosechasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCosechas(cosechasData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const total = Number(formData.kilos_primera) + Number(formData.kilos_segunda) + Number(formData.kilos_rechazo);
    const semana = getWeekNumber(formData.fecha);
    const año = new Date(formData.fecha).getFullYear();
    const lote = lotes.find(l => l.id === formData.lote_id);

    try {
      await addDoc(collection(db, 'cosechas'), {
        ...formData,
        kilos_total: total,
        semana,
        año,
        lote_nombre: lote?.nombre || 'Desconocido',
        timestamp: new Date().toISOString()
      });
      setIsModalOpen(false);
      setFormData({ fecha: new Date().toISOString().split('T')[0], lote_id: '', kilos_primera: 0, kilos_segunda: 0, kilos_rechazo: 0, observaciones: '' });
      fetchData();
    } catch (error) {
      console.error("Error saving cosecha:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Leaf className="text-primary" size={32} />
            Cosecha Semanal
          </h2>
          <p className="text-gray-500 font-medium">Registro y control de producción de limón Tahití</p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
            <Filter size={20} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            Registrar Cosecha
          </button>
        </div>
      </div>

      {/* Resumen Semana Actual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-primary text-white border-none flex items-center justify-between p-8">
          <div>
            <p className="text-primary-light text-xs font-bold uppercase tracking-wider">Semana Actual</p>
            <h3 className="text-4xl font-black mt-1">{getCurrentWeek()}</h3>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
            <Calendar size={32} />
          </div>
        </div>
        <div className="card p-8 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Kilos Totales Semana</p>
            <h3 className="text-4xl font-black mt-1 text-gray-900">{formatKg(12450)}</h3>
          </div>
          <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center text-primary">
            <TrendingUpIcon size={32} />
          </div>
        </div>
        <div className="card p-8 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Lotes Cosechados</p>
            <h3 className="text-4xl font-black mt-1 text-gray-900">4 / {lotes.length}</h3>
          </div>
          <div className="w-16 h-16 bg-secondary-light rounded-2xl flex items-center justify-center text-secondary">
            <CheckCircle2 size={32} />
          </div>
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg">Historial de Cosechas</h3>
          <button className="text-primary font-bold text-sm flex items-center gap-1 hover:underline">
            <Download size={16} /> Exportar Reporte
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4 font-extrabold">Semana</th>
                <th className="pb-4 font-extrabold">Fecha</th>
                <th className="pb-4 font-extrabold">Lote</th>
                <th className="pb-4 font-extrabold">1ª (kg)</th>
                <th className="pb-4 font-extrabold">2ª (kg)</th>
                <th className="pb-4 font-extrabold">Rechazo</th>
                <th className="pb-4 font-extrabold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cosechas.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                  <td className="py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-bold text-gray-600">{item.semana}</span>
                  </td>
                  <td className="py-4 text-sm text-gray-500">{item.fecha}</td>
                  <td className="py-4 font-bold text-gray-800">{item.lote_nombre}</td>
                  <td className="py-4 text-sm font-medium text-primary">{item.kilos_primera}</td>
                  <td className="py-4 text-sm font-medium text-secondary">{item.kilos_segunda}</td>
                  <td className="py-4 text-sm font-medium text-red-500">{item.kilos_rechazo}</td>
                  <td className="py-4 font-black text-gray-900">{item.kilos_total} kg</td>
                </tr>
              ))}
              {cosechas.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Clock size={48} className="opacity-20" />
                      <p className="font-medium italic">No hay registros de cosecha aún</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl font-black text-gray-900 mb-8">Registrar Cosecha</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fecha de Cosecha</label>
                  <input 
                    type="date" 
                    className="input-field" 
                    value={formData.fecha}
                    onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                    required 
                  />
                  <p className="text-xs text-primary font-bold mt-1">Semana calculada: {getWeekNumber(formData.fecha)}</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Lote</label>
                  <select 
                    className="input-field"
                    value={formData.lote_id}
                    onChange={(e) => setFormData({...formData, lote_id: e.target.value})}
                    required
                  >
                    <option value="">Selecciona un lote...</option>
                    {lotes.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
                  </select>
                </div>
                
                <div className="bg-primary-light/50 p-4 rounded-2xl border border-primary/10">
                  <label className="block text-sm font-bold text-primary mb-2">Kilos Primera</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.kilos_primera}
                    onChange={(e) => setFormData({...formData, kilos_primera: e.target.value})}
                    required 
                  />
                </div>
                <div className="bg-secondary-light/50 p-4 rounded-2xl border border-secondary/10">
                  <label className="block text-sm font-bold text-secondary mb-2">Kilos Segunda</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.kilos_segunda}
                    onChange={(e) => setFormData({...formData, kilos_segunda: e.target.value})}
                    required 
                  />
                </div>
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 col-span-2">
                  <label className="block text-sm font-bold text-red-600 mb-2">Kilos Rechazo</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.kilos_rechazo}
                    onChange={(e) => setFormData({...formData, kilos_rechazo: e.target.value})}
                    required 
                  />
                </div>

                <div className="col-span-2 bg-gray-900 text-white p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs font-bold uppercase">Total Cosechado</p>
                    <p className="text-4xl font-black">
                      {Number(formData.kilos_primera) + Number(formData.kilos_segunda) + Number(formData.kilos_rechazo)} kg
                    </p>
                  </div>
                  <CheckCircle2 size={40} className="text-primary" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Observaciones</label>
                  <textarea 
                    className="input-field h-24 resize-none"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  ></textarea>
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">Cerrar</button>
                <button type="submit" className="flex-[2] btn-primary py-4 text-lg">Confirmar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TrendingUpIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export default CosechaPage;
