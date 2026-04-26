import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, addDoc, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { DollarSign, Plus, Download, TrendingUp, User, Calendar, CheckCircle2, AlertCircle, ShoppingCart, ArrowRight, Edit3, Trash2, CheckCircle } from 'lucide-react';
import { formatCOP, formatKg } from '../../utils/formatters';

const VentasPage = () => {
  const [ventas, setVentas] = useState([]);
  const [cosechas, setCosechas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    cliente: '',
    cosecha_id: '',
    fecha: new Date().toISOString().split('T')[0],
    cat_exportacion: { kg: 0, precio: 0 },
    cat_primera: { kg: 0, precio: 0 },
    cat_segunda: { kg: 0, precio: 0 },
    cat_rechazo: { kg: 0, precio: 0 },
    estado_pago: 'Pendiente'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ventasSnapshot = await getDocs(query(collection(db, 'ventas'), orderBy('timestamp', 'desc')));
      setVentas(ventasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      const cosechasSnapshot = await getDocs(query(collection(db, 'cosechas'), orderBy('timestamp', 'desc')));
      setCosechas(cosechasSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error("Error fetching ventas:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return (formData.cat_exportacion.kg * formData.cat_exportacion.precio) +
           (formData.cat_primera.kg * formData.cat_primera.precio) +
           (formData.cat_segunda.kg * formData.cat_segunda.precio) +
           (formData.cat_rechazo.kg * formData.cat_rechazo.precio);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const cosecha = cosechas.find(c => c.id === formData.cosecha_id);
      const dataToSave = {
        ...formData,
        total_venta: calculateTotal(),
        lote_nombre: cosecha?.lote_nombre || 'Desconocido',
        semana: cosecha?.semana || 'N/A',
        timestamp: new Date().toISOString()
      };

      if (editingId) {
        await updateDoc(doc(db, 'ventas', editingId), dataToSave);
      } else {
        await addDoc(collection(db, 'ventas'), dataToSave);
      }

      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        cliente: '', cosecha_id: '', fecha: new Date().toISOString().split('T')[0],
        cat_exportacion: { kg: 0, precio: 0 }, cat_primera: { kg: 0, precio: 0 },
        cat_segunda: { kg: 0, precio: 0 }, cat_rechazo: { kg: 0, precio: 0 },
        estado_pago: 'Pendiente'
      });
      fetchData();
    } catch (error) {
      console.error("Error saving venta:", error);
    }
  };

  const handleEdit = (venta) => {
    setFormData({
      cliente: venta.cliente,
      cosecha_id: venta.cosecha_id,
      fecha: venta.fecha,
      cat_exportacion: venta.cat_exportacion,
      cat_primera: venta.cat_primera,
      cat_segunda: venta.cat_segunda,
      cat_rechazo: venta.cat_rechazo,
      estado_pago: venta.estado_pago
    });
    setEditingId(venta.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta liquidación?')) {
      try {
        await deleteDoc(doc(db, 'ventas', id));
        fetchData();
      } catch (error) {
        console.error("Error deleting venta:", error);
      }
    }
  };

  const handleMarkAsPaid = async (id) => {
    try {
      await updateDoc(doc(db, 'ventas', id), {
        estado_pago: 'Pagado'
      });
      fetchData();
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <DollarSign className="text-primary" size={32} />
            Ventas y Comercialización
          </h2>
          <p className="text-gray-500 font-medium">Seguimiento de facturación y despacho de limón Tahití</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Nueva Liquidación
        </button>
      </div>

      {/* Resumen de Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIVenta 
          title="Ventas Totales" 
          value={formatCOP(ventas.reduce((acc, curr) => acc + curr.total_venta, 0))} 
          trend="Total Histórico" 
          icon={<TrendingUp className="text-primary" />} 
        />
        <KPIVenta 
          title="Kilos Liquidados" 
          value={formatKg(ventas.reduce((acc, curr) => acc + 
            (Number(curr.cat_exportacion.kg) + Number(curr.cat_primera.kg) + Number(curr.cat_segunda.kg) + Number(curr.cat_rechazo.kg)), 0))} 
          trend="Exportación + Local" 
          icon={<ShoppingCart className="text-secondary" />} 
        />
        <KPIVenta 
          title="Pagos Pendientes" 
          value={ventas.filter(v => v.estado_pago === 'Pendiente').length} 
          trend="Facturas" 
          icon={<AlertCircle className="text-orange-500" />} 
          isWarning
        />
        <KPIVenta 
          title="Precio Promedio" 
          value={formatCOP(2850)} 
          trend="Referencia 1ª" 
          icon={<CheckCircle2 className="text-blue-500" />} 
        />
      </div>

      {/* Historial de Ventas */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg">Historial de Liquidaciones</h3>
          <button className="text-primary font-bold text-xs flex items-center gap-1 hover:underline">
            <Download size={16} /> Descargar Reporte
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4">Cliente / Lote</th>
                <th className="pb-4">Fecha / Sem</th>
                <th className="pb-4">Desglose Categorías</th>
                <th className="pb-4 text-right">Total Venta</th>
                <th className="pb-4 text-center">Estado</th>
                <th className="pb-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {ventas.map((venta) => (
                <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center text-primary font-bold uppercase">
                        {venta.cliente.substring(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{venta.cliente}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Lote: {venta.lote_nombre}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-5">
                    <p className="font-bold text-sm text-gray-800">{venta.fecha}</p>
                    <p className="text-[10px] font-black text-primary uppercase">{venta.semana}</p>
                  </td>
                  <td className="py-5">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                      <span className="text-gray-500"><b className="text-blue-600">EXP:</b> {formatKg(venta.cat_exportacion.kg)}</span>
                      <span className="text-gray-500"><b className="text-primary">1ª:</b> {formatKg(venta.cat_primera.kg)}</span>
                      <span className="text-gray-500"><b className="text-secondary">2ª:</b> {formatKg(venta.cat_segunda.kg)}</span>
                      <span className="text-gray-500"><b className="text-red-500">RECH:</b> {formatKg(venta.cat_rechazo.kg)}</span>
                    </div>
                  </td>
                  <td className="py-5 font-black text-gray-900 text-right">{formatCOP(venta.total_venta)}</td>
                  <td className="py-5 text-center">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                      venta.estado_pago === 'Pagado' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                    }`}>
                      {venta.estado_pago}
                    </span>
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex justify-end gap-2">
                      {venta.estado_pago === 'Pendiente' && (
                        <button 
                          onClick={() => handleMarkAsPaid(venta.id)}
                          className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                          title="Marcar como pagado"
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleEdit(venta)}
                        className="p-2 text-gray-400 hover:text-primary transition-colors"
                        title="Editar liquidación"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(venta.id)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        title="Eliminar liquidación"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {ventas.length === 0 && (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-gray-400 font-medium italic">
                    No hay liquidaciones registradas aún
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nueva Liquidación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] w-full max-w-4xl p-10 shadow-2xl animate-in zoom-in duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-3xl font-black text-gray-900">
                  {editingId ? 'Editar Liquidación' : 'Nueva Liquidación'}
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  {editingId ? 'Actualiza los datos de la liquidación' : 'Asigna categorías y precios a una cosecha'}
                </p>
              </div>
              <DollarSign size={48} className="text-primary/20" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Cliente / Comprador</label>
                  <input 
                    type="text" className="input-field" placeholder="Nombre del cliente" required
                    value={formData.cliente} onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                  />
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Seleccionar Cosecha</label>
                  <select 
                    className="input-field" required
                    value={formData.cosecha_id} onChange={(e) => setFormData({...formData, cosecha_id: e.target.value})}
                  >
                    <option value="">Selecciona una cosecha...</option>
                    {cosechas.map(c => (
                      <option key={c.id} value={c.id}>{c.fecha} - {c.lote_nombre} ({formatKg(c.kilos_total)})</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Fecha Venta</label>
                  <input 
                    type="date" className="input-field" required
                    value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <CategoriaInput 
                  label="Exportación" color="blue"
                  data={formData.cat_exportacion}
                  onChange={(newData) => setFormData({...formData, cat_exportacion: newData})}
                />
                <CategoriaInput 
                  label="Primera" color="green"
                  data={formData.cat_primera}
                  onChange={(newData) => setFormData({...formData, cat_primera: newData})}
                />
                <CategoriaInput 
                  label="Segunda" color="orange"
                  data={formData.cat_segunda}
                  onChange={(newData) => setFormData({...formData, cat_segunda: newData})}
                />
                <CategoriaInput 
                  label="Rechazo" color="red"
                  data={formData.cat_rechazo}
                  onChange={(newData) => setFormData({...formData, cat_rechazo: newData})}
                />
              </div>

              <div className="bg-gray-900 rounded-[2rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Total de Liquidación</p>
                  <h4 className="text-3xl font-black text-primary whitespace-nowrap">{formatCOP(calculateTotal())}</h4>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                  <button 
                    type="button" 
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingId(null);
                    }} 
                    className="flex-1 px-8 py-4 font-bold text-gray-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="flex-[2] btn-primary px-12 py-4 text-lg flex items-center justify-center gap-2">
                    {editingId ? 'Actualizar Liquidación' : 'Confirmar Venta'} <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const CategoriaInput = ({ label, color, data, onChange }) => {
  const colors = {
    blue: 'border-blue-100 bg-blue-50 text-blue-600',
    green: 'border-primary-light bg-primary-light/30 text-primary',
    orange: 'border-secondary-light bg-secondary-light/30 text-secondary',
    red: 'border-red-100 bg-red-50 text-red-600'
  };

  return (
    <div className={`p-4 rounded-2xl border ${colors[color]}`}>
      <p className="text-xs font-black uppercase tracking-widest mb-3">{label}</p>
      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold opacity-60">Kilos</label>
          <input 
            type="number" className="w-full bg-white/50 border-none rounded-lg p-2 text-sm font-bold text-gray-900 focus:ring-2 ring-current"
            value={data.kg} onChange={(e) => onChange({...data, kg: e.target.value})}
          />
        </div>
        <div>
          <label className="text-[10px] font-bold opacity-60">Precio/Kg</label>
          <input 
            type="number" className="w-full bg-white/50 border-none rounded-lg p-2 text-sm font-bold text-gray-900 focus:ring-2 ring-current"
            value={data.precio} onChange={(e) => onChange({...data, precio: e.target.value})}
          />
        </div>
        <div className="pt-2 border-t border-current/10">
          <p className="text-[10px] font-bold opacity-60">Subtotal</p>
          <p className="font-black">{formatCOP(data.kg * data.precio)}</p>
        </div>
      </div>
    </div>
  );
};

const KPIVenta = ({ title, value, trend, icon, isWarning }) => (
  <div className="card p-6 hover:shadow-lg transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-2xl ${isWarning ? 'bg-secondary-light' : 'bg-primary-light'}`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded ${isWarning ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
        {trend}
      </span>
    </div>
    <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</h4>
    <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
  </div>
);

const TrendingUpIcon = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

export default VentasPage;
