import datosFalsos from '../../datos/datosFalsos.json';
import { ESTILOS_ESTADO } from '../../logica/estados';
import type { EstadoTema } from '../../tipos';

export const ProfesorPage = () => {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <header className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Panel del Profesor — Vista 2D del Aula</h2>
        <p className="text-slate-600 text-sm">Monitoreo en tiempo real del dominio por pupitre y detección de huecos de aprendizaje.</p>
      </header>

      <div>
        <h3 className="text-sm font-mono text-slate-600 uppercase mb-3">Distribución del Aula (2 Filas × 3 Columnas)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-200 p-6 rounded-xl border border-slate-300">
          {datosFalsos.alumnosAula.map((alumno) => {
            const estilo = ESTILOS_ESTADO[alumno.estado as EstadoTema];
            return (
              <div
                key={alumno.id}
                className={`p-4 bg-white rounded-lg border-2 ${estilo.border} shadow-sm flex flex-col justify-between`}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <strong className="text-slate-900 font-semibold">{alumno.nombre}</strong>
                    <span className="text-xs font-mono text-slate-400">F{alumno.fila} C{alumno.columna}</span>
                  </div>
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mt-2 ${estilo.bg} ${estilo.text}`}>
                    {estilo.label} ({alumno.dominioGeneral}%)
                  </span>
                </div>
                {alumno.temaDetenido && (
                  <p className="text-xs text-rose-700 mt-3 font-medium">
                    Hueco detectado: {alumno.temaDetenido}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
