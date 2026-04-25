import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Map, Plus, Edit2, Trash2, TreeDeciduous, Maximize, Calendar, Info } from 'lucide-react';

const LotesPage = () => {
  const [lotes, setLotes] = useState([]);
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

  useEffect(() => {
    fetchLotes();
  }, []);

  const fetchLotes = async () => {
    try {
      const q = query(collection(db, 'lotes'), orderBy('nombre'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLotes(docs);
    } catch (error) {
      console.error("Error fetching lotes:", error);
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
      fetchLotes();
    } catch (error) {
      console.error("Error saving lote:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este lote?')) {
      try {
        await deleteDoc(doc(db, 'lotes', id));
        fetchLotes();
      } catch (error) {
        console.error("Error deleting lote:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <Map className="text-primary" size={32} />
            Gestión de Lotes
          </h2>
          <p className="text-gray-500 font-medium">Administra las áreas de producción de la finca</p>
        </div>
        <button 
          onClick={() => { setEditingLote(null); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          Nuevo Lote
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotes.map((lote) => (
            <div key={lote.id} className="card group hover:border-primary/30 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${lote.estado === 'activo' ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'}`}>
                  {lote.estado}
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingLote(lote); setFormData(lote); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-primary"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(lote.id)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={18} /></button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4">{lote.nombre}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                  <Maximize size={16} className="text-gray-400" />
                  <span className="text-sm font-medium">{lote.area_ha} ha</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <TreeDeciduous size={16} className="text-gray-400" />
                  <span className="text-sm font-medium">{lote.numero_arboles} árboles</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm font-medium">{lote.edad_cultivo_años} años</span>
                </div>
              </div>

              {lote.observaciones && (
                <div className="mt-4 pt-4 border-t border-gray-50 flex items-start gap-2 text-gray-500 italic text-xs">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  <p>{lote.observaciones}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {editingLote ? 'Editar Lote' : 'Crear Nuevo Lote'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre del Lote</label>
                  <input 
                    className="input-field" 
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Ej: Lote El Oasis"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Área (ha)</label>
                  <input 
                    type="number" step="0.1" 
                    className="input-field" 
                    value={formData.area_ha}
                    onChange={(e) => setFormData({...formData, area_ha: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Núm. Árboles</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.numero_arboles}
                    onChange={(e) => setFormData({...formData, numero_arboles: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Edad Cultivo (años)</label>
                  <input 
                    type="number" 
                    className="input-field" 
                    value={formData.edad_cultivo_años}
                    onChange={(e) => setFormData({...formData, edad_cultivo_años: e.target.value})}
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Estado</label>
                  <select 
                    className="input-field"
                    value={formData.estado}
                    onChange={(e) => setFormData({...formData, estado: e.target.value})}
                  >
                    <option value="activo">Activo</option>
                    <option value="inactivo">Inactivo</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Observaciones</label>
                  <textarea 
                    className="input-field h-24 resize-none"
                    value={formData.observaciones}
                    onChange={(e) => setFormData({...formData, observaciones: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 rounded-xl border border-gray-200 font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancelar</button>
                <button type="submit" className="flex-1 btn-primary py-3 px-4">Guardar Lote</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotesPage;
