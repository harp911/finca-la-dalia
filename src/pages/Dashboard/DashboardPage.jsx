import { useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Leaf, DollarSign, Users, Truck, AlertTriangle, Calendar, TrendingUp, ArrowUpRight, Filter, Loader2
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getCurrentWeek, getWeekRange, getCurrentYear } from '../../utils/weekUtils';
import { formatCOP, formatKg } from '../../utils/formatters';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [stats, setStats] = useState({
    cosechaTotal: 0,
    ventasTotal: 0,
    pendientesCount: 0,
    productionChart: [],
    qualityChart: [],
    cosechas: [],
    ventas: []
  });

  const years = [2026, 2025, 2024, 2023];

  useEffect(() => {
    setLoading(true);
    
    // Real-time listener for Cosechas
    const qCosechas = query(
      collection(db, 'cosechas'), 
      where('año', '==', Number(selectedYear))
    );
    
    const unsubscribeCosechas = onSnapshot(qCosechas, (cosechasSnap) => {
      const cosechasData = cosechasSnap.docs.map(doc => doc.data());
      
      // Real-time listener for Ventas
      const qVentas = query(collection(db, 'ventas'));
      
      const unsubscribeVentas = onSnapshot(qVentas, (ventasSnap) => {
        const ventasData = ventasSnap.docs
          .map(doc => doc.data())
          .filter(v => (v.año === Number(selectedYear)) || (new Date(v.fecha).getFullYear() === Number(selectedYear)));

        // 1. Cosecha Total
        const harvestTotal = cosechasData.reduce((acc, curr) => acc + (Number(curr.kilos_total) || 0), 0);

        // 2. Ventas Totales (Facturado)
        const salesTotal = ventasData.reduce((acc, curr) => acc + (Number(curr.total_venta) || 0), 0);

        // 3. Total Recaudado (Pagado)
        const collectedTotal = ventasData
          .filter(v => v.estado_pago === 'Pagado')
          .reduce((acc, curr) => acc + (Number(curr.total_venta) || 0), 0);

        // 4. Cartera Pendiente (En COP)
        const pendingBalance = salesTotal - collectedTotal;

        // 5. Pagos Pendientes (Conteo)
        const pendingCount = ventasData.filter(v => v.estado_pago === 'Pendiente').length;

        // 6. Production Chart (by week)
        const weeksMap = {};
        cosechasData.forEach(c => {
          const sem = c.semana || 'N/A';
          weeksMap[sem] = (weeksMap[sem] || 0) + (Number(c.kilos_total) || 0);
        });

        const productionChart = Object.keys(weeksMap)
          .sort()
          .slice(-12)
          .map(sem => ({ name: sem, kilos: weeksMap[sem] }));

        // 7. Quality Chart
        const quality = {
          exportacion: ventasData.reduce((acc, v) => acc + (Number(v.cat_exportacion?.kg) || 0), 0),
          primera: ventasData.reduce((acc, v) => acc + (Number(v.cat_primera?.kg) || 0), 0),
          segunda: ventasData.reduce((acc, v) => acc + (Number(v.cat_segunda?.kg) || 0), 0),
          rechazo: ventasData.reduce((acc, v) => acc + (Number(v.cat_rechazo?.kg) || 0), 0),
        };

        const qualityChart = [
          { name: 'Exportación', value: quality.exportacion, color: '#2563EB' },
          { name: 'Primera', value: quality.primera, color: '#6DC010' },
          { name: 'Segunda', value: quality.segunda, color: '#F47920' },
          { name: 'Rechazo', value: quality.rechazo, color: '#DC2626' },
        ].filter(q => q.value > 0);

        setStats({
          cosechaTotal: harvestTotal,
          ventasTotal: salesTotal,
          collectedTotal: collectedTotal,
          pendingBalance: pendingBalance,
          pendientesCount: pendingCount,
          productionChart,
          qualityChart,
          cosechas: cosechasData,
          ventas: ventasData
        });
        
        setLoading(false);
      });

      return () => unsubscribeVentas();
    });

    return () => unsubscribeCosechas();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Banner Superior con Filtro */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900">Análisis de Gestión {selectedYear}</h2>
            <p className="text-gray-500 text-sm font-medium">Información enlazada y fiable de producción y finanzas</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-100">
          <Filter size={18} className="text-gray-400 ml-2" />
          {years.map(year => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                selectedYear === year 
                  ? 'bg-primary text-white shadow-md shadow-primary/20' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Ventas Totales" 
          value={formatCOP(stats.ventasTotal)} 
          subtitle="Total Facturado" 
          icon={<ShoppingCart className="text-primary" />} 
          trend={`${stats.ventas.length} ventas`} 
          color="primary"
        />
        <KPICard 
          title="Total Recaudado" 
          value={formatCOP(stats.collectedTotal)} 
          subtitle="Dinero en Caja" 
          icon={<CheckCircle className="text-green-500" />} 
          trend="Pagado" 
          color="green"
        />
        <KPICard 
          title="Cartera Pendiente" 
          value={formatCOP(stats.pendingBalance)} 
          subtitle="Saldo por Cobrar" 
          icon={<DollarSign className="text-orange-500" />} 
          trend={`${stats.pendientesCount} facturas`} 
          color="orange"
          isWarning={stats.pendingBalance > 0}
        />
        <KPICard 
          title="Producción" 
          value={formatKg(stats.cosechaTotal)} 
          subtitle="Kilos Cosechados" 
          icon={<Leaf className="text-blue-500" />} 
          trend="Inventario" 
          color="blue"
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Producción Semanal */}
        <div className="card h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">Volumen de Cosecha por Semana</h3>
            <span className="text-xs font-bold text-primary uppercase bg-primary-light px-2 py-1 rounded">Kg Producidos</span>
          </div>
          {stats.productionChart.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <AreaChart data={stats.productionChart}>
                <defs>
                  <linearGradient id="colorKilos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6DC010" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#6DC010" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{fontWeight: 'bold'}}
                />
                <Area type="monotone" dataKey="kilos" stroke="#6DC010" strokeWidth={3} fillOpacity={1} fill="url(#colorKilos)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 italic">
              <Leaf size={48} className="opacity-10 mb-2" />
              <p>Sin datos de producción para {selectedYear}</p>
            </div>
          )}
        </div>

        {/* Distribución de Calidad */}
        <div className="card h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">Balance de Calidad Anual</h3>
            <span className="text-xs font-bold text-secondary uppercase bg-secondary-light px-2 py-1 rounded">Distribución Kg</span>
          </div>
          {stats.qualityChart.length > 0 ? (
            <div className="flex flex-col md:flex-row h-full items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.qualityChart}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.qualityChart.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full md:w-auto flex flex-col justify-center gap-3 mt-4 md:mt-0 md:pr-8">
                {stats.qualityChart.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider">{item.name}</span>
                      <span className="font-extrabold text-gray-900 text-sm">{formatKg(item.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 italic">
              <DollarSign size={48} className="opacity-10 mb-2" />
              <p>Sin liquidaciones en {selectedYear}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, subtitle, icon, trend, color, isWarning }) => (
  <div className="card group hover:scale-[1.02] transition-all duration-300 border-none shadow-sm">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl bg-${color}-light/50 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className={`text-[10px] font-black px-2 py-1 rounded ${isWarning ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
        {trend}
      </span>
    </div>
    <div className="mt-4">
      <h4 className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{title}</h4>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1 font-medium italic">{subtitle}</p>
    </div>
  </div>
);

const Loader2 = ({ className, size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

export default DashboardPage;
