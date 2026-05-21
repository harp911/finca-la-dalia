import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Truck, Plus, DollarSign, Calendar, TrendingUp, TrendingDown, 
  Trash2, AlertCircle, CheckCircle2, FileText, Filter, Clock, ArrowUpRight, ArrowDownRight, Fuel
} from 'lucide-react';
import { formatCOP } from '../../utils/formatters';
import { getWeekNumber } from '../../utils/weekUtils';

const TransportePage = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('todos'); // 'todos', 'ingreso', 'gasto'

  const [formData, setFormData] = useState({
    tipo: 'ingreso', // 'ingreso' o 'gasto'
    fecha: new Date().toISOString().split('T')[0],
    concepto: '',
    cliente_o_categoria: '', // Cliente para ingresos, Categoría para gastos
    monto: '',
    estado: 'Pagado', // 'Pagado' o 'Pendiente' (solo ingresos)
    observaciones: ''
  });

  const categories = ['Combustible', 'Mantenimiento', 'Repuestos', 'Seguro/Impuestos', 'Otros'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const q = query(collection(db, 'transporte'), orderBy('fecha', 'desc'));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRegistros(data);
    } catch (error) {
      console.error("Error fetching transport records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.concepto || !formData.monto) return alert('Completa los campos obligatorios');

    const semana = getWeekNumber(formData.fecha);
    const año = new Date(formData.fecha).getFullYear();

    try {
      await addDoc(collection(db, 'transporte'), {
        tipo: formData.tipo,
        fecha: formData.fecha,
        concepto: formData.concepto,
        cliente_o_categoria: formData.tipo === 'gasto' && !formData.cliente_o_categoria 
          ? 'Otros' 
          : formData.cliente_o_categoria,
        monto: Number(formData.monto),
        estado: formData.tipo === 'ingreso' ? formData.estado : 'Pagado',
        observaciones: formData.observaciones,
        semana,
        año,
        timestamp: new Date().toISOString()
      });

      setIsModalOpen(false);
      setFormData({
        tipo: 'ingreso',
        fecha: new Date().toISOString().split('T')[0],
        concepto: '',
        cliente_o_categoria: '',
        monto: '',
        estado: 'Pagado',
        observaciones: ''
      });
      fetchData();
    } catch (error) {
      console.error("Error saving transport record:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este registro?')) {
      try {
        await deleteDoc(doc(db, 'transporte', id));
        fetchData();
      } catch (error) {
        console.error("Error deleting transport record:", error);
      }
    }
  };

  const handleToggleEstadoPago = async (record) => {
    if (record.tipo !== 'ingreso') return;
    const nuevoEstado = record.estado === 'Pagado' ? 'Pendiente' : 'Pagado';
    try {
      await updateDoc(doc(db, 'transporte', record.id), {
        estado: nuevoEstado
      });
      fetchData();
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  // KPIs calculations
  const totalIngresos = registros
    .filter(r => r.tipo === 'ingreso')
    .reduce((sum, r) => sum + Number(r.monto || 0), 0);

  const totalGastos = registros
    .filter(r => r.tipo === 'gasto')
    .reduce((sum, r) => sum + Number(r.monto || 0), 0);

  const balanceNeto = totalIngresos - totalGastos;

  const cuentasPorCobrar = registros
    .filter(r => r.tipo === 'ingreso' && r.estado === 'Pendiente')
    .reduce((sum, r) => sum + Number(r.monto || 0), 0);

  const filteredRegistros = registros.filter(r => {
    if (activeTab === 'todos') return true;
    return r.tipo === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Truck className="text-primary" size={32} />
            Transporte y Tractor
          </h2>
          <p className="text-gray-500 font-medium">Control de ingresos por fletes y gastos operativos del tractor</p>
        </div>
        <div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Plus size={20} />
            Nuevo Registro
          </button>
        </div>
      </div>

      {/* KPIs de Transporte */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 border-l-4 border-l-green-500 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ingresos por Servicios</p>
            <h3 className="text-3xl font-black text-gray-900">{formatCOP(totalIngresos)}</h3>
          </div>
          <div className="flex items-center gap-1 mt-3 text-green-600 font-bold text-xs">
            <TrendingUp size={14} /> Fletes y Labranzas
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-red-500 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Gastos del Tractor</p>
            <h3 className="text-3xl font-black text-gray-900">{formatCOP(totalGastos)}</h3>
          </div>
          <div className="flex items-center gap-1 mt-3 text-red-600 font-bold text-xs">
            <Fuel size={14} /> Combustible y Repuestos
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-primary flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Balance Neto</p>
            <h3 className={`text-3xl font-black ${balanceNeto >= 0 ? 'text-primary' : 'text-red-500'}`}>
              {formatCOP(balanceNeto)}
            </h3>
          </div>
          <div className="text-xs text-gray-400 mt-3 font-semibold">
            Margen de utilidad operativa
          </div>
        </div>

        <div className="card p-6 border-l-4 border-l-orange-500 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cuentas por Cobrar</p>
            <h3 className="text-3xl font-black text-orange-500">{formatCOP(cuentasPorCobrar)}</h3>
          </div>
          <div className="flex items-center gap-1 mt-3 text-orange-500 font-bold text-xs">
            <Clock size={14} /> Servicios pendientes de pago
          </div>
        </div>
      </div>

      {/* Tabs Filtros */}
      <div className="flex border-b border-gray-100">
        <button 
          onClick={() => setActiveTab('todos')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 ${activeTab === 'todos' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          Todos los Registros
        </button>
        <button 
          onClick={() => setActiveTab('ingreso')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'ingreso' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <ArrowUpRight size={16} className="text-green-500" />
          Ingresos por Servicios
        </button>
        <button 
          onClick={() => setActiveTab('gasto')}
          className={`px-8 py-4 font-bold text-sm transition-all border-b-2 flex items-center gap-2 ${activeTab === 'gasto' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
        >
          <ArrowDownRight size={16} className="text-red-500" />
          Gastos del Tractor
        </button>
      </div>

      {/* Tabla de Registros */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-100 bg-gray-50/20">
                <th className="p-4 font-extrabold">Fecha</th>
                <th className="p-4 font-extrabold">Tipo</th>
                <th className="p-4 font-extrabold">Concepto / Servicio</th>
                <th className="p-4 font-extrabold">Cliente / Categoría</th>
                <th className="p-4 font-extrabold text-right">Monto</th>
                <th className="p-4 font-extrabold text-center">Estado</th>
                <th className="p-4 font-extrabold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRegistros.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                  <td className="p-4 text-sm font-semibold text-gray-500 whitespace-nowrap">{item.fecha}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      item.tipo === 'ingreso' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'
                    }`}>
                      {item.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}
                    </span>
                  </td>
                  <td className="p-4 font-bold text-gray-800">{item.concepto}</td>
                  <td className="p-4 font-semibold text-gray-600">{item.cliente_o_categoria}</td>
                  <td className={`p-4 font-black text-right ${item.tipo === 'ingreso' ? 'text-green-600' : 'text-red-500'}`}>
                    {item.tipo === 'ingreso' ? '+' : '-'}{formatCOP(item.monto)}
                  </td>
                  <td className="p-4 text-center">
                    {item.tipo === 'ingreso' ? (
                      <button 
                        onClick={() => handleToggleEstadoPago(item)}
                        className={`px-2 py-1 rounded text-[10px] font-black uppercase transition-all ${
                          item.estado === 'Pagado' 
                            ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                            : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                        }`}
                        title="Haga clic para cambiar el estado"
                      >
                        {item.estado}
                      </button>
                    ) : (
                      <span className="text-gray-300 font-semibold text-xs">-</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar registro"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredRegistros.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-20 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <Truck size={48} className="opacity-20 animate-bounce duration-1000" />
                      <p className="font-semibold italic">No hay registros en esta categoría</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Agregar Registro */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-xl p-10 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-3xl font-black text-gray-900 mb-6">Agregar Transacción</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Selector de Tipo */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Tipo de Registro</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'ingreso', estado: 'Pagado' })}
                    className={`py-3 rounded-xl font-bold transition-all border flex items-center justify-center gap-2 ${
                      formData.tipo === 'ingreso' 
                        ? 'bg-green-50 border-green-500 text-green-600 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowUpRight size={18} />
                    Servicio (Ingreso)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'gasto', cliente_o_categoria: 'Combustible' })}
                    className={`py-3 rounded-xl font-bold transition-all border flex items-center justify-center gap-2 ${
                      formData.tipo === 'gasto' 
                        ? 'bg-red-50 border-red-500 text-red-500 shadow-sm' 
                        : 'bg-white border-gray-200 text-gray-400 hover:bg-gray-50'
                    }`}
                  >
                    <ArrowDownRight size={18} />
                    Tractor (Gasto)
                  </button>
                </div>
              </div>

              {/* Fecha y Monto */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">Fecha</label>
                  <input 
                    type="date" 
                    className="input-field bg-white" 
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">Valor (COP)</label>
                  <input 
                    type="number" 
                    className="input-field bg-white font-bold" 
                    placeholder="Ej: 150000"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    required 
                  />
                </div>
              </div>

              {/* Concepto y Cliente/Categoría */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">Concepto / Descripción</label>
                  <input 
                    type="text" 
                    className="input-field bg-white" 
                    placeholder={formData.tipo === 'ingreso' ? 'Ej: Flete de insumos' : 'Ej: Compra de ACPM'}
                    value={formData.concepto}
                    onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                    required 
                  />
                </div>
                
                <div className="col-span-2">
                  {formData.tipo === 'ingreso' ? (
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 mb-2">Cliente</label>
                      <input 
                        type="text" 
                        className="input-field bg-white" 
                        placeholder="Nombre del cliente"
                        value={formData.cliente_o_categoria}
                        onChange={(e) => setFormData({ ...formData, cliente_o_categoria: e.target.value })}
                        required 
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-black uppercase text-gray-400 mb-2">Categoría del Gasto</label>
                      <select 
                        className="input-field bg-white"
                        value={formData.cliente_o_categoria}
                        onChange={(e) => setFormData({ ...formData, cliente_o_categoria: e.target.value })}
                        required
                      >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Estado de Pago (Solo ingresos) */}
              {formData.tipo === 'ingreso' && (
                <div>
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">Estado del Pago</label>
                  <select 
                    className="input-field bg-white"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente (Por Cobrar)</option>
                  </select>
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="block text-xs font-black uppercase text-gray-400 mb-2">Observaciones (Opcional)</label>
                <textarea 
                  className="input-field h-20 resize-none bg-white"
                  value={formData.observaciones}
                  onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                ></textarea>
              </div>

              {/* Botonera */}
              <div className="flex gap-4 pt-4 border-t border-gray-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] btn-primary py-4 text-lg"
                >
                  Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransportePage;
