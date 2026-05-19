import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Map, Plus, Edit2, Trash2, TreeDeciduous, Maximize, Calendar, Info, 
  ClipboardList, History, Loader2, User, Activity, Leaf
} from 'lucide-react';
import { getWeekNumber } from '../../utils/weekUtils';
import { formatKg } from '../../utils/formatters';

const LotesPage = () => {
  const [activeTab, setActiveTab] = useState('lotes');
  const [lotes, setLotes] = useState([]);
  const [trabajadores, setTrabajadores] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [cosechas, setCosechas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLote, setEditingLote] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    area_ha: '',
    numero_arboles: '',
    edad_cultivo_años: '',
    estado: 'activo',
    observaciones: ''
  });

  const [selectedLote, setSelectedLote] = useState(null);
  const [dateRange, setDateRange] = useState('30');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const qLotes = query(collection(db, 'lotes'), orderBy('nombre'));
      const lotesSnap = await getDocs(qLotes);
      setLotes(lotesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const qTrabajadores = query(collection(db, 'trabajadores'), orderBy('nombre'));
      const trabajadoresSnap = await getDocs(qTrabajadores);
      setTrabajadores(trabajadoresSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const qActividades = query(collection(db, 'actividades'), orderBy('fecha', 'desc'));
      const actividadesSnap = await getDocs(qActividades);
      setActividades(actividadesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const qCosechas = query(collection(db, 'cosechas'), orderBy('fecha', 'desc'));
      const cosechasSnap = await getDocs(qCosechas);
      setCosechas(cosechasSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLote) {
        await updateDoc(doc(db, 'lotes', editingLote.id), formData);
      } else {
        await addDoc(collection(db, 'lotes'), {
          ...formData,
          fecha_creacion: new Date().toISOString()
        });
      }
      setIsModalOpen(false);
      setEditingLote(null);
      setFormData({ nombre: '', area_ha: '', numero_arboles: '', edad_cultivo_años: '', estado: 'activo', observaciones: '' });
      fetchData();
    } catch (error) {
      console.error("Error saving lote:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este lote?')) {
      try {
        await deleteDoc(doc(db, 'lotes', id));
        fetchData();
      } catch (error) {
        console.error("Error deleting lote:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Map className="text-primary" size={32} />
            Gestión de Lotes
          </h2>
          <p className="text-gray-500 font-medium">Administra áreas, actividades y cosechas por lote</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => { setEditingLote(null); setIsModalOpen(true); }}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            Nuevo Lote
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('lotes')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'lotes' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <Map size={18} />
          Inventario
        </button>
        <button 
          onClick={() => setActiveTab('actividades')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'actividades' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <ClipboardList size={18} />
          Registro de Labores
        </button>
        <button 
          onClick={() => setActiveTab('historial')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'historial' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <History size={18} />
          Historial Unificado
        </button>
      </div>

      {activeTab === 'lotes' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-300">
          {lotes.map((lote) => {
            const loteActividades = actividades.filter(act => act.lote_id === lote.id);
            const totalHoras = loteActividades.reduce((sum, act) => sum + Number(act.horas || 0), 0);
            
            const loteCosechas = cosechas.filter(cos => cos.lote_id === lote.id);
            const totalKilos = loteCosechas.reduce((sum, cos) => sum + Number(cos.kilos_total || 0), 0);

            return (
              <div 
                key={lote.id} 
                onClick={() => setSelectedLote(lote)}
                className="card group hover:border-primary/30 cursor-pointer hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${lote.estado === 'activo' ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'}`}>
                    {lote.estado}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); setEditingLote(lote); setFormData(lote); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-primary transition-colors"><Edit2 size={18} /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(lote.id); }} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{lote.nombre}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <Maximize size={16} className="text-primary" />
                    <span className="text-sm font-bold">{lote.area_ha} ha</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100">
                    <TreeDeciduous size={16} className="text-primary" />
                    <span className="text-sm font-bold">{lote.numero_arboles} árb.</span>
                  </div>
                </div>

                {/* Historial de Labores de este Lote */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Historial de Labores</span>
                    <span className="text-[10px] font-black bg-primary-light text-primary px-2 py-0.5 rounded-full">{totalHoras} hrs</span>
                  </div>
                  {loteActividades.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Sin labores registradas</p>
                  ) : (
                    <div className="space-y-2">
                      {loteActividades.slice(0, 2).map(act => (
                        <div key={act.id} className="flex justify-between items-center text-xs bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                          <span className="font-semibold text-gray-700">{act.tipo} ({act.horas}h)</span>
                          <span className="text-gray-400 font-medium text-[10px]">{act.fecha}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Producción Cosechada de este Lote */}
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Producción Cosechada</span>
                    <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">{formatKg(totalKilos)}</span>
                  </div>
                  {loteCosechas.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Sin cosechas registradas</p>
                  ) : (
                    <div className="space-y-2">
                      {loteCosechas.slice(0, 2).map(cos => (
                        <div key={cos.id} className="flex justify-between items-center text-xs bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                          <span className="font-semibold text-gray-700">Semana {cos.semana}: {formatKg(cos.kilos_total)}</span>
                          <span className="text-gray-400 font-medium text-[10px]">{cos.fecha}</span>
                        </div>
                      ))}
                      {loteCosechas.length > 2 && (
                        <span className="text-[10px] text-orange-600 font-black block pt-1 hover:underline text-left">
                          + Ver detalles al hacer clic
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {lote.observaciones && (
                  <div className="mt-4 pt-4 border-t border-gray-50 flex items-start gap-2 text-gray-500 italic text-[11px]">
                    <Info size={14} className="mt-0.5 shrink-0 text-primary/40" />
                    <p>{lote.observaciones}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'actividades' && (
        <ActividadesSection lotes={lotes} trabajadores={trabajadores} actividades={actividades} onRefresh={fetchData} />
      )}

      {activeTab === 'historial' && (
        <HistorialUnificado lotes={lotes} />
      )}

      {/* Modal CRUD Lotes */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
              <div className="p-2 bg-primary-light text-primary rounded-xl"><Map size={20}/></div>
              {editingLote ? 'Editar Lote' : 'Crear Nuevo Lote'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Lote</label>
                  <input className="input-field" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} placeholder="Ej: Lote El Oasis" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Área (ha)</label>
                  <input type="number" step="0.1" className="input-field" value={formData.area_ha} onChange={(e) => setFormData({...formData, area_ha: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Núm. Árboles</label>
                  <input type="number" className="input-field" value={formData.numero_arboles} onChange={(e) => setFormData({...formData, numero_arboles: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Edad Cultivo (años)</label>
                  <input type="number" className="input-field" value={formData.edad_cultivo_años} onChange={(e) => setFormData({...formData, edad_cultivo_años: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
                  <select className="input-field" value={formData.estado} onChange={(e) => setFormData({...formData, estado: e.target.value})}>
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Observaciones</label>
                  <textarea className="input-field h-24 resize-none" value={formData.observaciones} onChange={(e) => setFormData({...formData, observaciones: e.target.value})}></textarea>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary py-3 px-4 shadow-lg shadow-primary/20">Guardar Lote</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle de Lote con Dashboard Parametrizable */}
      {selectedLote && (() => {
        const getFilteredLoteActividades = (loteId) => {
          let filtered = actividades.filter(act => act.lote_id === loteId);
          
          const today = new Date();
          let startDate = null;
          
          if (dateRange === '7') {
            startDate = new Date();
            startDate.setDate(today.getDate() - 7);
          } else if (dateRange === '30') {
            startDate = new Date();
            startDate.setDate(today.getDate() - 30);
          } else if (dateRange === '90') {
            startDate = new Date();
            startDate.setDate(today.getDate() - 90);
          } else if (dateRange === 'custom') {
            if (customStartDate) {
              filtered = filtered.filter(act => new Date(act.fecha) >= new Date(customStartDate + 'T00:00:00'));
            }
            if (customEndDate) {
              filtered = filtered.filter(act => new Date(act.fecha) <= new Date(customEndDate + 'T23:59:59'));
            }
            return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          }
          
          if (startDate) {
            startDate.setHours(0,0,0,0);
            filtered = filtered.filter(act => new Date(act.fecha) >= startDate);
          }
          
          return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        };

        const getFilteredLoteCosechas = (loteId) => {
          let filtered = cosechas.filter(cos => cos.lote_id === loteId);
          
          const today = new Date();
          let startDate = null;
          
          if (dateRange === '7') {
            startDate = new Date();
            startDate.setDate(today.getDate() - 7);
          } else if (dateRange === '30') {
            startDate = new Date();
            startDate.setDate(today.getDate() - 30);
          } else if (dateRange === '90') {
            startDate = new Date();
            startDate.setDate(today.getDate() - 90);
          } else if (dateRange === 'custom') {
            if (customStartDate) {
              filtered = filtered.filter(cos => new Date(cos.fecha) >= new Date(customStartDate + 'T00:00:00'));
            }
            if (customEndDate) {
              filtered = filtered.filter(cos => new Date(cos.fecha) <= new Date(customEndDate + 'T23:59:59'));
            }
            return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
          }
          
          if (startDate) {
            startDate.setHours(0,0,0,0);
            filtered = filtered.filter(cos => new Date(cos.fecha) >= startDate);
          }
          
          return filtered.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        };

        const filteredActs = getFilteredLoteActividades(selectedLote.id);
        const filteredCosechas = getFilteredLoteCosechas(selectedLote.id);

        const totalHoras = filteredActs.reduce((sum, act) => sum + Number(act.horas || 0), 0);
        const totalLabores = filteredActs.length;
        const totalKilosPeriodo = filteredCosechas.reduce((sum, cos) => sum + Number(cos.kilos_total || 0), 0);
        
        // Calcular porcentaje por labor
        const breakdown = {};
        filteredActs.forEach(act => {
          breakdown[act.tipo] = (breakdown[act.tipo] || 0) + Number(act.horas || 0);
        });
        
        const breakdownArray = Object.entries(breakdown)
          .map(([tipo, horas]) => ({
            tipo,
            horas,
            percentage: totalHoras > 0 ? Math.round((horas / totalHoras) * 100) : 0
          }))
          .sort((a, b) => b.horas - a.horas);
          
        const laborDominante = breakdownArray[0]?.tipo || 'Ninguna';
        const horasDominante = breakdownArray[0]?.horas || 0;

        // Unificar cronología
        const unifiedTimeline = [
          ...filteredActs.map(act => ({ ...act, isCosechaRegistro: false })),
          ...filteredCosechas.map(cos => ({
            ...cos,
            isCosechaRegistro: true,
            tipo: 'Cosecha (Producción)',
            horas: '-',
            trabajador_nombre: 'Equipo Cosecha',
            observaciones: cos.observaciones || 'Cosecha semanal de limón'
          }))
        ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

        return (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-5xl p-8 shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-gray-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-black uppercase text-primary bg-primary-light px-3 py-1 rounded-full">
                    Detalle del Lote
                  </span>
                  <h3 className="text-3xl font-black text-gray-900 mt-2 leading-none">{selectedLote.nombre}</h3>
                  <p className="text-gray-400 text-xs mt-1 font-semibold">Resumen de productividad, labores y producción recolectada</p>
                </div>
                <button 
                  onClick={() => setSelectedLote(null)}
                  className="text-sm font-bold text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 px-4 py-2 rounded-xl transition-all"
                >
                  Cerrar
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 space-y-6 scrollbar-thin">
                {/* Filtro de Tiempo Parametrizable */}
                <div className="bg-gray-50 p-6 rounded-[1.5rem] border border-gray-100/60 flex flex-wrap gap-4 items-end justify-between">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-gray-400 block">Periodo de Tiempo</label>
                    <select 
                      className="input-field bg-white w-52 py-2 px-3 border border-gray-200/80 rounded-xl"
                      value={dateRange}
                      onChange={e => setDateRange(e.target.value)}
                    >
                      <option value="7">Últimos 7 días</option>
                      <option value="30">Últimos 30 días</option>
                      <option value="90">Últimos 90 días</option>
                      <option value="todos">Todos los registros</option>
                      <option value="custom">Rango Personalizado</option>
                    </select>
                  </div>

                  {dateRange === 'custom' && (
                    <div className="flex gap-3 items-end animate-in fade-in slide-in-from-left-2 duration-200">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 block">Desde</label>
                        <input 
                          type="date" 
                          className="input-field bg-white py-1.5 px-3 border border-gray-200/80 rounded-xl text-xs"
                          value={customStartDate} 
                          onChange={e => setCustomStartDate(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-gray-400 block">Hasta</label>
                        <input 
                          type="date" 
                          className="input-field bg-white py-1.5 px-3 border border-gray-200/80 rounded-xl text-xs"
                          value={customEndDate} 
                          onChange={e => setCustomEndDate(e.target.value)} 
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-right text-[11px] text-gray-400 font-bold">
                    {unifiedTimeline.length} registros operativos encontrados en este rango.
                  </div>
                </div>

                {/* Dashboard Analítico */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-primary tracking-wider">Total Horas</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-black text-primary">{totalHoras}</span>
                      <span className="text-sm font-extrabold text-primary/70">horas</span>
                    </div>
                    <span className="text-[10px] text-primary/60 font-semibold mt-1">Tiempo de labor acumulado</span>
                  </div>

                  <div className="bg-secondary/5 border border-secondary/10 p-5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-secondary tracking-wider">Acciones / Labores</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-black text-secondary">{totalLabores}</span>
                      <span className="text-sm font-extrabold text-secondary/70">registros</span>
                    </div>
                    <span className="text-[10px] text-secondary/60 font-semibold mt-1">Intervenciones en el lote</span>
                  </div>

                  <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-orange-500 tracking-wider">Total Cosechado</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className="text-4xl font-black text-orange-600">{formatKg(totalKilosPeriodo)}</span>
                    </div>
                    <span className="text-[10px] text-orange-400 font-semibold mt-1">Producción de Limón</span>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-black uppercase text-blue-500 tracking-wider">Labor Predominante</span>
                    <div className="mt-2 col-span-1">
                      <span className="text-xl font-black text-blue-900 block truncate">{laborDominante}</span>
                      <span className="text-xs font-semibold text-blue-500">{horasDominante} hrs registradas</span>
                    </div>
                    <span className="text-[10px] text-blue-400 font-semibold mt-1">Mayor esfuerzo operativo</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Distribución de Labores (Mini Bar Chart) */}
                  <div className="lg:col-span-4 bg-gray-50 border border-gray-100 p-6 rounded-2xl space-y-4">
                    <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Distribución del Tiempo</h4>
                    {breakdownArray.length === 0 ? (
                      <p className="text-xs text-gray-400 italic">No hay datos disponibles de labores.</p>
                    ) : (
                      <div className="space-y-4">
                        {breakdownArray.map(item => (
                          <div key={item.tipo} className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-bold text-gray-700">{item.tipo}</span>
                              <span className="font-black text-primary">{item.horas}h ({item.percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                              <div 
                                className="bg-primary h-full rounded-full transition-all duration-500" 
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tabla de Actividades y Cosechas Unificadas */}
                  <div className="lg:col-span-8 bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                      <h4 className="text-xs font-black uppercase text-gray-400 tracking-wider">Detalle Cronológico Unificado</h4>
                    </div>
                    <div className="flex-1 overflow-x-auto max-h-[300px] overflow-y-auto">
                      {unifiedTimeline.length === 0 ? (
                        <div className="p-8 text-center text-xs text-gray-400 italic">
                          No se registraron labores ni cosechas en el periodo seleccionado.
                        </div>
                      ) : (
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[9px] bg-gray-50/20">
                              <th className="p-3">Fecha</th>
                              <th className="p-3">Registro</th>
                              <th className="p-3">Responsable</th>
                              <th className="p-3 text-center">Cantidad / Horas</th>
                              <th className="p-3">Observaciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 text-gray-600">
                            {unifiedTimeline.map(item => (
                              <tr key={item.id} className="hover:bg-gray-50/50">
                                <td className="p-3 font-semibold text-gray-500 whitespace-nowrap">{item.fecha}</td>
                                <td className="p-3 font-bold text-gray-900">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${item.isCosechaRegistro ? 'bg-orange-100 text-orange-600' : 'bg-primary-light text-primary'}`}>
                                    {item.tipo}
                                  </span>
                                </td>
                                <td className="p-3 whitespace-nowrap">{item.trabajador_nombre}</td>
                                <td className="p-3 text-center font-black">
                                  {item.isCosechaRegistro ? (
                                    <span className="text-orange-600">{formatKg(item.kilos_total)}</span>
                                  ) : (
                                    <span className="text-primary">{item.horas}h</span>
                                  )}
                                </td>
                                <td className="p-3 max-w-[200px] truncate" title={item.observaciones || ''}>
                                  {item.observaciones || <span className="text-gray-300 italic">Sin observaciones</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 pt-4 mt-6 flex justify-between items-center text-xs text-gray-400">
                <span className="font-semibold">Optifrutas © 2026</span>
                <span className="font-bold bg-gray-50 px-3 py-1 rounded-full text-[10px] uppercase text-gray-500">
                  Finca La Dalia
                </span>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const ActividadesSection = ({ lotes, trabajadores, actividades, onRefresh }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingActividadId, setEditingActividadId] = useState(null);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    lote_id: '',
    trabajador_id: '',
    labores: [
      { tipo: 'Poda', horas: '', observaciones: '' }
    ]
  });

  const tipos = ['Poda', 'Fumigación', 'Fertilización', 'Guadaña', 'Plateo', 'Mantenimiento', 'Cosecha', 'Otro'];

  const handleAddLaborRow = () => {
    if (formData.labores.length < 3) {
      setFormData({
        ...formData,
        labores: [...formData.labores, { tipo: 'Poda', horas: '', observaciones: '' }]
      });
    }
  };

  const handleRemoveLaborRow = (index) => {
    setFormData({
      ...formData,
      labores: formData.labores.filter((_, i) => i !== index)
    });
  };

  const handleLaborFieldChange = (index, field, value) => {
    const updatedLabores = formData.labores.map((labor, i) => {
      if (i === index) {
        return { ...labor, [field]: value };
      }
      return labor;
    });
    setFormData({ ...formData, labores: updatedLabores });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const lote = lotes.find(l => l.id === formData.lote_id);
    const trabajador = trabajadores.find(t => t.id === formData.trabajador_id);

    try {
      if (editingActividadId) {
        // En modo edición solo hay 1 labor (la primera del array)
        const labor = formData.labores[0];
        const dataToSave = {
          fecha: formData.fecha,
          lote_id: formData.lote_id,
          trabajador_id: formData.trabajador_id,
          tipo: labor.tipo,
          horas: Number(labor.horas),
          observaciones: labor.observaciones,
          lote_nombre: lote?.nombre || 'Desconocido',
          trabajador_nombre: trabajador?.nombre || 'General',
          año: new Date(formData.fecha).getFullYear(),
          semana: getWeekNumber(formData.fecha)
        };
        await updateDoc(doc(db, 'actividades', editingActividadId), dataToSave);
        setEditingActividadId(null);
        alert("Labor actualizada con éxito");
      } else {
        // Registrar múltiples labores
        for (const labor of formData.labores) {
          if (!labor.horas) continue;
          const dataToSave = {
            fecha: formData.fecha,
            lote_id: formData.lote_id,
            trabajador_id: formData.trabajador_id,
            tipo: labor.tipo,
            horas: Number(labor.horas),
            observaciones: labor.observaciones,
            lote_nombre: lote?.nombre || 'Desconocido',
            trabajador_nombre: trabajador?.nombre || 'General',
            año: new Date(formData.fecha).getFullYear(),
            semana: getWeekNumber(formData.fecha),
            timestamp: new Date().toISOString()
          };
          await addDoc(collection(db, 'actividades'), dataToSave);
        }
        alert("Labores registradas con éxito");
      }

      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        lote_id: '',
        trabajador_id: '',
        labores: [
          { tipo: 'Poda', horas: '', observaciones: '' }
        ]
      });
      setShowForm(false);
      onRefresh();
    } catch (error) {
      console.error("Error saving actividad:", error);
      alert("Error al guardar la labor");
    }
  };

  const handleEdit = (act) => {
    setEditingActividadId(act.id);
    setFormData({
      fecha: act.fecha,
      lote_id: act.lote_id,
      trabajador_id: act.trabajador_id || '',
      labores: [
        { tipo: act.tipo, horas: act.horas || '', observaciones: act.observaciones || '' }
      ]
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro de labor?')) {
      try {
        await deleteDoc(doc(db, 'actividades', id));
        onRefresh();
      } catch (error) {
        console.error("Error deleting actividad:", error);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Registro de Labores</h3>
        <button onClick={() => {
            setShowForm(!showForm);
            if(showForm) {
                setEditingActividadId(null);
                setFormData({
                    fecha: new Date().toISOString().split('T')[0],
                    lote_id: '',
                    trabajador_id: '',
                    labores: [{ tipo: 'Poda', horas: '', observaciones: '' }]
                });
            }
        }} className="px-4 py-2 bg-primary/10 text-primary font-bold rounded-xl flex items-center gap-2 hover:bg-primary/20 transition-all">
          {showForm ? 'Cerrar' : <><Plus size={18}/> Registrar Labor</>}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card bg-gray-50 p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
          {/* Datos Comunes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Fecha</label>
              <input type="date" className="input-field bg-white" value={formData.fecha} onChange={e => setFormData({...formData, fecha: e.target.value})} required />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Lote</label>
              <select className="input-field bg-white" value={formData.lote_id} onChange={e => setFormData({...formData, lote_id: e.target.value})} required>
                <option value="">Lote...</option>
                {lotes.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Responsable</label>
              <select className="input-field bg-white" value={formData.trabajador_id} onChange={e => setFormData({...formData, trabajador_id: e.target.value})}>
                <option value="">General</option>
                {trabajadores.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
              </select>
            </div>
          </div>

          {/* Listado de Labores del Día */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2">
              <h4 className="text-sm font-bold text-gray-700">Labores del Día (Máximo 3)</h4>
              {formData.labores.length < 3 && !editingActividadId && (
                <button
                  type="button"
                  onClick={handleAddLaborRow}
                  className="px-3 py-1.5 bg-primary/10 text-primary text-xs font-bold rounded-lg hover:bg-primary/20 transition-all flex items-center gap-1"
                >
                  <Plus size={14} /> + Adicionar Labor
                </button>
              )}
            </div>

            <div className="space-y-4 divide-y divide-gray-100">
              {formData.labores.map((labor, idx) => (
                <div key={idx} className={`grid grid-cols-1 md:grid-cols-12 gap-4 ${idx > 0 ? 'pt-4 border-t border-gray-100/50' : ''}`}>
                  <div className="md:col-span-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Labor #{idx + 1}</label>
                    <select 
                      className="input-field bg-white" 
                      value={labor.tipo} 
                      onChange={e => handleLaborFieldChange(idx, 'tipo', e.target.value)}
                    >
                      {tipos.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Tiempo (Horas)</label>
                    <input 
                      type="number" 
                      step="0.5" 
                      min="0.5" 
                      placeholder="Ej: 4.5" 
                      className="input-field bg-white" 
                      value={labor.horas} 
                      onChange={e => handleLaborFieldChange(idx, 'horas', e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="md:col-span-6">
                    <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Observaciones</label>
                    <input 
                      className="input-field bg-white" 
                      placeholder="Observaciones de esta labor..." 
                      value={labor.observaciones} 
                      onChange={e => handleLaborFieldChange(idx, 'observaciones', e.target.value)} 
                    />
                  </div>
                  <div className="md:col-span-1 flex items-end justify-center">
                    {idx > 0 && (
                      <button 
                        type="button" 
                        onClick={() => handleRemoveLaborRow(idx)} 
                        className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all mb-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
            <button 
              type="submit" 
              className="btn-primary px-8 py-3 shadow-lg shadow-primary/20"
            >
              {editingActividadId ? 'Actualizar Registro' : 'Guardar Labores'}
            </button>
          </div>
        </form>
      )}

      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-[10px] font-black uppercase text-gray-400 border-b border-gray-50">
              <th className="p-4">Fecha</th>
              <th className="p-4">Lote</th>
              <th className="p-4">Labor</th>
              <th className="p-4 text-center">Horas</th>
              <th className="p-4">Responsable</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {actividades.map(act => (
              <tr key={act.id} className="hover:bg-gray-50 group transition-colors">
                <td className="p-4 text-sm text-gray-500">{act.fecha}</td>
                <td className="p-4 font-bold">{act.lote_nombre}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-primary/5 text-primary rounded-lg text-[10px] font-black uppercase">
                    {act.tipo}
                  </span>
                </td>
                <td className="p-4 text-center font-black text-primary">{act.horas}h</td>
                <td className="p-4 text-sm text-gray-600">{act.trabajador_nombre}</td>
                <td className="p-4 text-right">
                  <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(act)} className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary-light rounded-lg transition-all"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(act.id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HistorialUnificado = ({ lotes }) => {
  const [items, setItems] = useState([]);
  const [filterLote, setFilterLote] = useState('');

  useEffect(() => {
    fetchUnified();
  }, [filterLote]);

  const fetchUnified = async () => {
    const qAct = query(collection(db, 'actividades'), orderBy('fecha', 'desc'));
    const snapAct = await getDocs(qAct);
    const dataAct = snapAct.docs.map(doc => ({ id: doc.id, type: 'activity', ...doc.data() }));

    const qCos = query(collection(db, 'cosechas'), orderBy('fecha', 'desc'));
    const snapCos = await getDocs(qCos);
    const dataCos = snapCos.docs.map(doc => ({ id: doc.id, type: 'harvest', ...doc.data() }));

    let unified = [...dataAct, ...dataCos].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    if (filterLote) unified = unified.filter(i => i.lote_id === filterLote);
    setItems(unified);
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 duration-300">
      <select className="input-field w-64 bg-white" value={filterLote} onChange={e => setFilterLote(e.target.value)}>
        <option value="">Filtrar por Lote...</option>
        {lotes.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
      </select>
      <div className="relative border-l-2 border-gray-100 ml-4 pl-8 space-y-6">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <div className={`absolute -left-[41px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${
              item.type === 'harvest' ? 'bg-secondary text-white' : 'bg-primary text-white'
            }`}>
              {item.type === 'harvest' ? <Leaf size={12}/> : <Activity size={12}/>}
            </div>
            <div className="card p-4 hover:shadow-md transition-all">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-black text-gray-300 uppercase">{item.fecha}</span>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                  item.type === 'harvest' ? 'bg-secondary-light text-secondary' : 'bg-primary-light text-primary'
                }`}>
                  {item.type === 'harvest' ? 'Cosecha' : item.tipo}
                </span>
              </div>
              <h4 className="font-bold text-gray-900">{item.lote_nombre}</h4>
              <p className="text-xs text-gray-500 mt-1">
                {item.type === 'harvest' ? `Recolección de ${formatKg(item.kilos_total)}.` : item.observaciones}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LotesPage;
