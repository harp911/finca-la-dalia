import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Leaf, 
  DollarSign, 
  Users, 
  Truck, 
  AlertTriangle, 
  Calendar,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { getCurrentWeek, getWeekRange, getCurrentYear } from '../../utils/weekUtils';
import { formatCOP, formatKg } from '../../utils/formatters';

// Datos de prueba (sustituir por datos de Firebase después)
const productionData = [
  { name: 'S12', kilos: 4500 },
  { name: 'S13', kilos: 5200 },
  { name: 'S14', kilos: 4800 },
  { name: 'S15', kilos: 6100 },
  { name: 'S16', kilos: 5500 },
  { name: 'S17', kilos: 6800 },
];

const qualityData = [
  { name: 'Primera', value: 4500, color: '#6DC010' },
  { name: 'Segunda', value: 1800, color: '#F47920' },
  { name: 'Rechazo', value: 500, color: '#DC2626' },
];

const DashboardPage = () => {
  const [currentWeek] = useState(getCurrentWeek());
  const [currentYear] = useState(getCurrentYear());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Banner Superior */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            Semana <span className="text-primary">{currentWeek}</span>
          </h2>
          <p className="text-gray-500 font-medium mt-1">
            <Calendar size={16} className="inline mr-1" />
            {getWeekRange(currentWeek, currentYear)}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-primary-light px-6 py-3 rounded-2xl border border-primary/10">
          <TrendingUp className="text-primary" />
          <span className="text-primary font-bold">Producción estable esta semana</span>
        </div>
      </div>

      {/* Tarjetas KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Cosecha Total" 
          value={formatKg(6800)} 
          subtitle="Semana Actual" 
          icon={<Leaf className="text-primary" />} 
          trend="+12%" 
          color="primary"
        />
        <KPICard 
          title="Ventas COP" 
          value={formatCOP(12500000)} 
          subtitle="Semana Actual" 
          icon={<DollarSign className="text-secondary" />} 
          trend="+5%" 
          color="secondary"
        />
        <KPICard 
          title="Mano de Obra" 
          value={formatCOP(2850000)} 
          subtitle="Jornales S17" 
          icon={<Users className="text-blue-500" />} 
          trend="-2%" 
          color="blue"
        />
        <KPICard 
          title="Ingresos Tractor" 
          value={formatCOP(1450000)} 
          subtitle="Servicios Externos" 
          icon={<Truck className="text-purple-500" />} 
          trend="+8%" 
          color="purple"
        />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Producción Semanal */}
        <div className="card h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">Producción Semanal (Kg)</h3>
            <span className="text-xs font-bold text-primary uppercase bg-primary-light px-2 py-1 rounded">Últimas 6 semanas</span>
          </div>
          <ResponsiveContainer width="100%" height="90%">
            <AreaChart data={productionData}>
              <defs>
                <linearGradient id="colorKilos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6DC010" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6DC010" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
              <Tooltip 
                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                itemStyle={{fontWeight: 'bold'}}
              />
              <Area type="monotone" dataKey="kilos" stroke="#6DC010" strokeWidth={3} fillOpacity={1} fill="url(#colorKilos)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribución de Calidad */}
        <div className="card h-[400px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-800">Distribución de Calidad</h3>
            <span className="text-xs font-bold text-secondary uppercase bg-secondary-light px-2 py-1 rounded">Semana S17</span>
          </div>
          <div className="flex h-full">
            <ResponsiveContainer width="60%" height="90%">
              <PieChart>
                <Pie
                  data={qualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {qualityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 flex flex-col justify-center gap-4">
              {qualityData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}}></div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold">{item.name}</span>
                    <span className="font-extrabold text-gray-800">{formatKg(item.value)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y Cartera */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card lg:col-span-2">
          <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
            <AlertTriangle className="text-secondary" size={20} />
            Alertas del Sistema
          </h3>
          <div className="space-y-4">
            <AlertItem 
              type="error" 
              title="Cartera de Ventas Vencida" 
              desc="Cliente: Exportadora Frutícola — Saldo: $4.500.000 — 15 días vencidos"
            />
            <AlertItem 
              type="warning" 
              title="Inventario Bajo Stock Mínimo" 
              desc="Fertilizante Urea (46%) — Stock actual: 2 bultos — Mínimo: 5"
            />
            <AlertItem 
              type="warning" 
              title="Cosecha Pendiente" 
              desc="Lote 'El Oasis' no tiene registro de cosecha para la semana S17"
            />
          </div>
        </div>

        <div className="card bg-primary text-white border-none">
          <h3 className="font-bold mb-4">Resumen Mensual</h3>
          <div className="space-y-6">
            <div>
              <p className="text-primary-light text-sm">Producción Total</p>
              <p className="text-3xl font-black">24.500 kg</p>
            </div>
            <div>
              <p className="text-primary-light text-sm">Ventas Netas</p>
              <p className="text-3xl font-black">{formatCOP(45200000)}</p>
            </div>
            <button className="w-full bg-white text-primary py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 hover:bg-gray-50 transition-colors">
              Ver Reporte Completo
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, subtitle, icon, trend, color }) => (
  <div className="card group hover:scale-[1.02] transition-all duration-300">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-2xl bg-${color}-light group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <span className={`text-xs font-bold px-2 py-1 rounded bg-green-50 text-green-600`}>{trend}</span>
    </div>
    <div className="mt-4">
      <h4 className="text-gray-500 text-sm font-bold">{title}</h4>
      <p className="text-2xl font-black text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-400 mt-1 font-medium">{subtitle}</p>
    </div>
  </div>
);

const AlertItem = ({ type, title, desc }) => (
  <div className={`p-4 rounded-xl border flex gap-4 ${
    type === 'error' ? 'bg-red-50 border-red-100 text-red-800' : 'bg-orange-50 border-orange-100 text-orange-800'
  }`}>
    <div className={`w-2 h-auto rounded-full ${type === 'error' ? 'bg-red-400' : 'bg-orange-400'}`}></div>
    <div>
      <p className="font-bold text-sm">{title}</p>
      <p className="text-xs opacity-80 mt-0.5">{desc}</p>
    </div>
  </div>
);

export default DashboardPage;
