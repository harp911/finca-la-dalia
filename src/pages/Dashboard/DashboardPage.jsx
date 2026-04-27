import { useState, useEffect } from 'react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  Leaf, DollarSign, Users, Truck, AlertTriangle, Calendar, TrendingUp, 
  ArrowUpRight, Filter, Loader2, ShoppingCart, CheckCircle, Activity, History
} from 'lucide-react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { getCurrentWeek, getCurrentYear } from '../../utils/weekUtils';
import { formatCOP, formatKg } from '../../utils/formatters';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(getCurrentYear());
  const [stats, setStats] = useState({
    cosechaTotal: 0,
    ventasTotal: 0,
    collectedTotal: 0,
    pendingBalance: 0,
    pendientesCount: 0,
    laboresMes: 0,
    productionChart: [],
    qualityChart: [],
    cosechas: [],
    ventas: [],
    actividades: []
  });

  const years = [2026, 2025, 2024, 2023];

  useEffect(() => {
    setLoading(true);
    
    // 1. Real-time listener for Cosechas
    const qCosechas = query(
      collection(db, 'cosechas'), 
      where('año', '==', Number(selectedYear))
    );
    
    const unsubscribeCosechas = onSnapshot(qCosechas, (cosechasSnap) => {
      const cosechasData = cosechasSnap.docs.map(doc => doc.data());
      
      // 2. Real-time listener for Ventas
      const qVentas = query(collection(db, 'ventas'));
      
      const unsubscribeVentas = onSnapshot(qVentas, (ventasSnap) => {
        const ventasData = ventasSnap.docs
          .map(doc => doc.data())
          .filter(v => (v.año === Number(selectedYear)) || (new Date(v.fecha).getFullYear() === Number(selectedYear)));

        // 3. Real-time listener for Actividades
        const qAct = query(
          collection(db, 'actividades'), 
          where('año', '==', Number(selectedYear))
        );

        const unsubscribeAct = onSnapshot(qAct, (actSnap) => {
          const actData = actSnap.docs.map(doc => doc.data());

          // --- CALCULATIONS ---
          const harvestTotal = cosechasData.reduce((acc, c) => acc + (Number(c.kilos_total) || 0), 0);
          const salesKgTotal = ventasData.reduce((acc, v) => acc + 
            (Number(v.cat_exportacion?.kg || 0) + 
             Number(v.cat_primera?.kg || 0) + 
             Number(v.cat_segunda?.kg || 0) + 
             Number(v.cat_rechazo?.kg || 0)), 0);

          const displayProduction = Math.max(harvestTotal, salesKgTotal);
          const salesTotal = ventasData.reduce((acc, v) => acc + (Number(v.total_venta) || 0), 0);
          const collectedTotal = ventasData
            .filter(v => v.estado_pago === 'Pagado')
            .reduce((acc, v) => acc + (Number(v.total_venta) || 0), 0);
          const pendingBalance = salesTotal - collectedTotal;
          const pendingCount = ventasData.filter(v => v.estado_pago === 'Pendiente').length;
          const laboresMes = actData.length;

          // Production Chart (by week)
          const weeksMap = {};
          cosechasData.forEach(c => {
            const sem = c.semana || 'N/A';
            weeksMap[sem] = (weeksMap[sem] || 0) + (Number(c.kilos_total) || 0);
          });
          
          ventasData.forEach(v => {
            const sem = v.semana || 'N/A';
            const vKg = (Number(v.cat_exportacion?.kg || 0) + 
                        Number(v.cat_primera?.kg || 0) + 
                        Number(v.cat_segunda?.kg || 0) + 
                        Number(v.cat_rechazo?.kg || 0));
            if (!weeksMap[sem] || weeksMap[sem] < vKg) weeksMap[sem] = vKg;
          });

          const productionChart = Object.keys(weeksMap)
            .sort()
            .slice(-12)
            .map(sem => ({ name: sem, kilos: weeksMap[sem] }));

          // Quality Chart
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
            cosechaTotal: displayProduction,
            ventasTotal: salesTotal,
            collectedTotal,
            pendingBalance,
            pendientesCount: pendingCount,
            laboresMes,
            productionChart,
            qualityChart,
            cosechas: cosechasData,
            ventas: ventasData,
            actividades: actData
          });
          
          setLoading(false);
        });

        return () => unsubscribeAct();
      });

      return () => unsubscribeVentas();
    });

    return () => unsubscribeCosechas();
  }, [selectedYear]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-20">
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
            <p className="text-gray-500 text-sm font-medium">Información enlazada de producción, finanzas y labores</p>
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
          title="Cartera Pendiente" 
          value={formatCOP(stats.pendingBalance)} 
          subtitle="Saldo por Cobrar" 
          icon={<DollarSign className="text-orange-500" />} 
          trend={`${stats.pendientesCount} facturas`} 
          color="orange"
          isWarning={stats.pendingBalance > 0}
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
          title="Producción" 
          value={formatKg(stats.cosechaTotal)} 
          subtitle="Kilos Cosechados" 
          icon={<Leaf className="text-blue-500" />} 
          trend="Inventario" 
          color="blue"
        />
        <KPICard 
          title="Labores Realizadas" 
          value={stats.laboresMes} 
          subtitle="Mantenimiento Lotes" 
          icon={<Activity className="text-primary" />} 
          trend="Actividades" 
          color="primary"
        />
      </div>

      {/* Gráficas y Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card h-[350px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800">Calidad Anual</h3>
                <span className="text-xs font-bold text-secondary uppercase bg-secondary-light px-2 py-1 rounded">Distribución Kg</span>
              </div>
              {stats.qualityChart.length > 0 ? (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={stats.qualityChart} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                        {stats.qualityChart.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-2 mt-4 w-full">
                    {stats.qualityChart.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></div>
                        <span className="text-[10px] text-gray-500 font-bold uppercase truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-300 italic text-sm">Sin liquidaciones</div>
              )}
            </div>

            <div className="card h-[350px] overflow-hidden">
              <h3 className="font-bold text-gray-800 mb-6">Inversión en Labores</h3>
              <div className="flex flex-col items-center justify-center h-full text-gray-300 italic">
                <Activity size={48} className="opacity-10 mb-2" />
                <p className="text-sm">Gráfica de costos en desarrollo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Lateral */}
        <div className="card h-full max-h-[800px] overflow-hidden flex flex-col bg-gray-50/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-gray-900 flex items-center gap-2">
              <History size={20} className="text-primary" />
              Línea de Tiempo
            </h3>
            <span className="text-[10px] font-black bg-white px-2 py-1 rounded border border-gray-100 uppercase">Reciente</span>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {[...stats.cosechas.map(c => ({...c, type: 'harvest'})), ...stats.actividades.map(a => ({...a, type: 'labor'}))]
              .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
              .slice(0, 10)
              .map((item, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-gray-100">
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                    item.type === 'harvest' ? 'bg-secondary' : 'bg-primary'
                  }`}></div>
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 group hover:border-primary/20 transition-all cursor-default">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[9px] font-black text-gray-400 uppercase tracking-tight">{item.fecha}</span>
                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                        item.type === 'harvest' ? 'bg-secondary-light text-secondary' : 'bg-primary-light text-primary'
                      }`}>
                        {item.type === 'harvest' ? 'Cosecha' : item.tipo}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-gray-800">{item.lote_nombre}</p>
                    <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">
                      {item.type === 'harvest' ? `Recolección de ${formatKg(item.kilos_total)}` : item.observaciones}
                    </p>
                  </div>
                </div>
              ))}
            {stats.cosechas.length === 0 && stats.actividades.length === 0 && (
              <div className="h-full flex items-center justify-center text-gray-300 italic text-sm">No hay actividad registrada</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, subtitle, icon, trend, color, isWarning }) => (
  <div className="card group hover:scale-[1.02] transition-all duration-300 border-none shadow-sm">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl bg-${color}-light group-hover:scale-110 transition-transform`}>
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

export default DashboardPage;
