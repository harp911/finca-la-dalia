import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Truck, Plus, DollarSign, Clock, User, ArrowUpRight, TrendingUp, Filter } from 'lucide-react';
import { formatCOP } from '../../utils/formatters';
import { getWeekNumber } from '../../utils/weekUtils';

const TransportePage = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Truck className="text-primary" size={32} />
            Transporte y Tractor
          </h2>
          <p className="text-gray-500 font-medium">Servicios externos de tractor y logística</p>
        </div>
        <div className="flex gap-3">
          <button className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20">
            <Plus size={20} />
            Nuevo Servicio
          </button>
        </div>
      </div>

      {/* KPIs de Transporte */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 border-l-4 border-l-primary">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Ingresos Totales (Mes)</p>
          <h3 className="text-3xl font-black text-gray-900">{formatCOP(4850000)}</h3>
          <div className="flex items-center gap-1 mt-2 text-green-600 font-bold text-xs">
            <TrendingUp size={14} /> +15% vs mes anterior
          </div>
        </div>
        <div className="card p-6 border-l-4 border-l-secondary">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Costo Operativo (Combustible)</p>
          <h3 className="text-3xl font-black text-gray-900">{formatCOP(1250000)}</h3>
          <p className="text-xs text-gray-400 mt-2 font-medium">Margen neto: {formatCOP(3600000)}</p>
        </div>
        <div className="card p-6 border-l-4 border-l-blue-500">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cuentas por Cobrar</p>
          <h3 className="text-3xl font-black text-red-600">{formatCOP(850000)}</h3>
          <p className="text-xs text-gray-400 mt-2 font-medium">2 clientes pendientes</p>
        </div>
      </div>

      {/* Lista de Servicios */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg">Historial de Servicios Externos</h3>
          <div className="flex gap-2">
            <button className="p-2 border rounded-lg text-gray-400 hover:bg-gray-50"><Filter size={18}/></button>
            <button className="p-2 border rounded-lg text-gray-400 hover:bg-gray-50"><Search size={18}/></button>
          </div>
        </div>
        <div className="space-y-4">
          <ServiceItem 
            cliente="Finca Las Palmas"
            fecha="20/04/2026"
            semana="S17"
            labor="Arada de terreno"
            monto={1250000}
            estado="pagado"
          />
          <ServiceItem 
            cliente="Don Antonio García"
            fecha="18/04/2026"
            semana="S16"
            labor="Transporte de insumos"
            monto={450000}
            estado="pendiente"
          />
        </div>
      </div>
    </div>
  );
};

const ServiceItem = ({ cliente, fecha, semana, labor, monto, estado }) => (
  <div className="p-4 rounded-2xl border border-gray-100 hover:border-primary/20 transition-all flex items-center justify-between group">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary-light group-hover:text-primary transition-colors">
        <Truck size={24} />
      </div>
      <div>
        <h4 className="font-bold text-gray-900">{cliente}</h4>
        <div className="flex items-center gap-3 text-xs font-medium text-gray-400">
          <span className="flex items-center gap-1"><Calendar size={12}/> {fecha}</span>
          <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-black text-[9px] uppercase">{semana}</span>
          <span className="flex items-center gap-1 uppercase tracking-tight">{labor}</span>
        </div>
      </div>
    </div>
    <div className="text-right">
      <p className="text-lg font-black text-gray-900">{formatCOP(monto)}</p>
      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
        estado === 'pagado' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
      }`}>
        {estado}
      </span>
    </div>
  </div>
);

export default TransportePage;
