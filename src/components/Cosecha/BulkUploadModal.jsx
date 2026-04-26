import { useState } from 'react';
import * as XLSX from 'xlsx';
import { collection, writeBatch, doc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getWeekNumber } from '../../utils/weekUtils';
import { formatKg } from '../../utils/formatters';

const BulkUploadModal = ({ isOpen, onClose, lotes, onUploadSuccess }) => {
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary', cellDates: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (data.length === 0) {
          throw new Error('El archivo está vacío');
        }

        // Normalizar y validar
        const processed = data.map((row, index) => {
          const normalizedRow = {};
          Object.keys(row).forEach(key => {
            const normalizedKey = key.toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            normalizedRow[normalizedKey] = row[key];
          });

          // Validar campos requeridos
          const fecha = normalizedRow.fecha instanceof Date ? normalizedRow.fecha : new Date(normalizedRow.fecha);
          const loteNombre = normalizedRow.lote || normalizedRow.nombre_lote;
          const kilos = Number(normalizedRow.kilos_total || normalizedRow.kilos || 0);

          if (!fecha || isNaN(fecha.getTime())) throw new Error(`Fecha inválida en fila ${index + 2}`);
          if (!loteNombre) throw new Error(`Lote faltante en fila ${index + 2}`);

          // Buscar ID del lote
          const loteMatch = lotes.find(l => l.nombre.toLowerCase().trim() === loteNombre.toLowerCase().trim());
          
          return {
            fecha: fecha.toISOString().split('T')[0],
            lote_id: loteMatch?.id || null,
            lote_nombre: loteMatch?.nombre || loteNombre,
            kilos_total: kilos,
            semana: getWeekNumber(fecha),
            año: fecha.getFullYear(),
            timestamp: new Date().toISOString(),
            status: loteMatch ? 'ok' : 'missing_lote'
          };
        });

        setFileData(processed);
        setError(null);
      } catch (err) {
        console.error(err);
        setError(err.message);
        setFileData([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirmUpload = async () => {
    if (fileData.some(r => r.status === 'missing_lote')) {
      if (!window.confirm('Hay registros con lotes no encontrados. Estos se guardarán con el nombre del texto pero sin ID vinculado. ¿Continuar?')) {
        return;
      }
    }

    setLoading(true);
    setProgress(0);
    const batchSize = 500;
    const total = fileData.length;
    
    try {
      for (let i = 0; i < total; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = fileData.slice(i, i + batchSize);
        
        chunk.forEach(record => {
          const docRef = doc(collection(db, 'cosechas'));
          const { status, ...dataToSave } = record;
          batch.set(docRef, dataToSave);
        });

        await batch.commit();
        setProgress(Math.round(((i + chunk.length) / total) * 100));
      }

      onUploadSuccess();
      onClose();
    } catch (err) {
      console.error("Bulk upload error:", err);
      setError("Error al subir los datos: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-[2rem] w-full max-w-4xl p-10 shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-3xl font-black text-gray-900">Carga Masiva</h3>
            <p className="text-gray-500 text-sm font-medium">Sube históricos de cosecha (Excel o CSV)</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {!fileData.length ? (
          <div className="flex-1 flex flex-col items-center justify-center border-4 border-dashed border-gray-100 rounded-[2.5rem] p-20 text-center">
            <div className="w-20 h-20 bg-primary-light rounded-3xl flex items-center justify-center text-primary mb-6">
              <Upload size={40} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Selecciona tu archivo</h4>
            <p className="text-gray-500 mb-8 max-w-xs">Asegúrate de que tenga las columnas: <b>fecha, lote, kilos_total</b></p>
            <label className="btn-primary px-8 py-4 cursor-pointer flex items-center gap-2">
              <FileText size={20} />
              Elegir Archivo
              <input type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
            </label>
            {error && (
              <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-2xl flex items-center gap-2 text-sm font-bold">
                <AlertCircle size={18} />
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-primary-light/30 rounded-2xl p-4 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary" size={24} />
                <div>
                  <p className="font-bold text-gray-900">{fileData.length} registros procesados</p>
                  <p className="text-xs text-gray-500">Listos para importar a la base de datos</p>
                </div>
              </div>
              <button 
                onClick={() => setFileData([])} 
                className="text-xs font-bold text-primary hover:underline"
              >
                Cambiar archivo
              </button>
            </div>

            <div className="flex-1 overflow-auto border border-gray-100 rounded-2xl">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
                  <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Lote</th>
                    <th className="p-4 text-right">Kilos</th>
                    <th className="p-4 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {fileData.slice(0, 50).map((row, i) => (
                    <tr key={i} className="text-sm">
                      <td className="p-4 font-medium text-gray-600">{row.fecha}</td>
                      <td className="p-4 font-bold text-gray-900">{row.lote_nombre}</td>
                      <td className="p-4 text-right font-black">{formatKg(row.kilos_total)}</td>
                      <td className="p-4 text-center">
                        {row.status === 'ok' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-600 rounded text-[10px] font-bold uppercase">Vinculado</span>
                        ) : (
                          <span className="px-2 py-1 bg-orange-100 text-orange-600 rounded text-[10px] font-bold uppercase" title="Lote no encontrado, se creará solo texto">No Vinculado</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {fileData.length > 50 && (
                <p className="p-4 text-center text-xs text-gray-400 italic">... y {fileData.length - 50} registros más</p>
              )}
            </div>

            <div className="pt-8 flex items-center justify-between gap-6">
              {loading ? (
                <div className="flex-1 flex items-center gap-4">
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300" 
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-primary">{progress}%</span>
                </div>
              ) : (
                <>
                  <button onClick={onClose} className="px-8 py-4 font-bold text-gray-400 hover:text-gray-600 transition-colors">
                    Cancelar
                  </button>
                  <button 
                    onClick={handleConfirmUpload}
                    className="flex-1 btn-primary py-4 text-lg flex items-center justify-center gap-2"
                  >
                    Confirmar Carga de {fileData.length} registros
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadModal;
