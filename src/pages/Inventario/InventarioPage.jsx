import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Package, Plus, AlertCircle, Calendar, ArrowUpRight, ArrowDownLeft, Tag, Search } from 'lucide-react';
import { formatCOP } from '../../utils/formatters';
import { getWeekNumber } from '../../utils/weekUtils';

const InventarioPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const q = query(collection(db, 'inventario'), orderBy('nombre'));
      const snapshot = await getDocs(q);
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
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
            <Package className="text-primary" size={32} />
            Inventario y Bodega
          </h2>
          <p className="text-gray-500 font-medium">Control de insumos, herramientas y agroquímicos</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex items-center gap-2 shadow-lg shadow-secondary/20">
            <ArrowDownLeft size={20} />
            Entrada
          </button>
          <button className="btn-primary bg-red-500 hover:bg-red-600 flex items-center gap-2 shadow-lg shadow-red-500/20">
            <ArrowUpRight size={20} />
            Salida
          </button>
          <button className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20">
            <Plus size={20} />
            Nuevo Producto
          </button>
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.length === 0 ? (
          <div className="col-span-full py-20 text-center card">
            <p className="text-gray-400 font-medium italic">No hay productos registrados en bodega.</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.id} className="card p-6 flex flex-col gap-4 group transition-all hover:shadow-md">
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                  item.stock_actual <= item.stock_minimo ? 'bg-red-100 text-red-600' : 'bg-primary-light text-primary'
                }`}>
                  {item.categoria}
                </span>
                {item.stock_actual <= item.stock_minimo && <AlertCircle size={18} className="text-red-500 animate-pulse" />}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">{item.nombre}</h3>
                <p className="text-xs text-gray-400 mt-1 font-medium">{item.proveedor}</p>
              </div>
              <div className="flex items-end justify-between pt-2">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</p>
                  <p className={`text-2xl font-black ${item.stock_actual <= item.stock_minimo ? 'text-red-600' : 'text-gray-900'}`}>
                    {item.stock_actual} <span className="text-xs font-bold text-gray-400 uppercase">{item.unidad}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Costo Unit.</p>
                  <p className="text-sm font-bold text-gray-700">{formatCOP(item.costo_unitario)}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-bold text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  Vence: {getWeekNumber(item.fecha_vencimiento)}
                </div>
                <div className="flex items-center gap-1">
                  <Tag size={12} />
                  Min: {item.stock_minimo}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Tabla de Movimientos Recientes */}
      <div className="card overflow-hidden">
        <h3 className="font-bold text-gray-800 text-lg mb-6">Últimos Movimientos</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4">Fecha / Semana</th>
                <th className="pb-4">Producto</th>
                <th className="pb-4">Tipo</th>
                <th className="pb-4">Cantidad</th>
                <th className="pb-4">Motivo / Lote</th>
                <th className="pb-4">Responsable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="text-sm">
                <td className="py-4">
                  <p className="font-bold text-gray-800">21/04/2026</p>
                  <p className="text-[10px] font-black text-primary">S17</p>
                </td>
                <td className="py-4 font-bold text-gray-900">Urea 46%</td>
                <td className="py-4">
                  <span className="flex items-center gap-1 text-red-600 font-bold">
                    <ArrowUpRight size={14} /> Salida
                  </span>
                </td>
                <td className="py-4 font-black">2 bultos</td>
                <td className="py-4">
                  <p className="font-medium text-gray-600">Fertilización</p>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lote El Oasis</p>
                </td>
                <td className="py-4 font-medium text-gray-500">Juan Pérez (Mayordomo)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventarioPage;
