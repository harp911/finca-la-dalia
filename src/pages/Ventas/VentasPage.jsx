import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { DollarSign, Plus, Download, TrendingUp, User, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatCOP, formatKg } from '../../utils/formatters';

const VentasPage = () => {
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
        <button className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20">
          <Plus size={20} />
          Nueva Venta
        </button>
      </div>

      {/* Resumen de Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPIVenta 
          title="Facturación Mensual" 
          value={formatCOP(52400000)} 
          trend="+18%" 
          icon={<TrendingUp className="text-primary" />} 
        />
        <KPIVenta 
          title="Cartera Pendiente" 
          value={formatCOP(12800000)} 
          trend="3 Facturas" 
          icon={<AlertCircle className="text-secondary" />} 
          isWarning
        />
        <KPIVenta 
          title="Kilos Vendidos" 
          value={formatKg(18500)} 
          trend="Mes Actual" 
          icon={<TrendingUpIcon size={20} />} 
        />
        <KPIVenta 
          title="Precio Promedio/Kg" 
          value={formatCOP(2850)} 
          trend="Calidad 1ª" 
          icon={<CheckCircle2 className="text-blue-500" />} 
        />
      </div>

      {/* Historial de Ventas */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg">Historial de Despachos</h3>
          <button className="text-primary font-bold text-xs flex items-center gap-1 hover:underline">
            <Download size={16} /> Descargar Reporte
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-[10px] font-black uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4">Cliente / Destino</th>
                <th className="pb-4">Fecha / Sem</th>
                <th className="pb-4">Desglose (Kg)</th>
                <th className="pb-4">Total Venta</th>
                <th className="pb-4">Estado Pago</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              <tr className="hover:bg-gray-50 transition-colors">
                <td className="py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400 font-bold uppercase">EF</div>
                    <div>
                      <p className="font-bold text-gray-900">Exportadora Frutícola</p>
                      <p className="text-[10px] text-gray-400 font-medium">Envigado, Antioquia</p>
                    </div>
                  </div>
                </td>
                <td className="py-5">
                  <p className="font-bold text-sm text-gray-800">20/04/2026</p>
                  <p className="text-[10px] font-black text-primary uppercase">Semana S17</p>
                </td>
                <td className="py-5">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-gray-500 font-medium"><b className="text-primary">1ª:</b> 4.500 kg</span>
                    <span className="text-xs text-gray-500 font-medium"><b className="text-secondary">2ª:</b> 1.200 kg</span>
                  </div>
                </td>
                <td className="py-5 font-black text-gray-900">{formatCOP(15450000)}</td>
                <td className="py-5">
                  <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-[10px] font-black uppercase">Pagado</span>
                </td>
              </tr>
            </tbody>
          </table>
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
