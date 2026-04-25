import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import LotesPage from './pages/Lotes/LotesPage';
import CosechaPage from './pages/Cosecha/CosechaPage';
import PersonalPage from './pages/Personal/PersonalPage';
import InventarioPage from './pages/Inventario/InventarioPage';
import TransportePage from './pages/Transporte/TransportePage';
import VentasPage from './pages/Ventas/VentasPage';
import ConfiguracionPage from './pages/Configuracion/ConfiguracionPage';
import AppLayout from './components/Layout/AppLayout';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="lotes" element={<LotesPage />} />
            <Route path="cosecha" element={<CosechaPage />} />
            <Route path="personal" element={<PersonalPage />} />
            <Route path="inventario" element={<InventarioPage />} />
            <Route path="transporte" element={<TransportePage />} />
            <Route path="ventas" element={<VentasPage />} />
            <Route path="configuracion" element={<ConfiguracionPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
