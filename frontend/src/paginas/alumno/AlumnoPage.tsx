import datosFalsos from '../../datos/datosFalsos.json';
import { ESTILOS_ESTADO } from '../../logica/estados';
import type { EstadoTema } from '../../tipos';

export const AlumnoPage = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="border-b border-slate-200 pb-4">
        <span className="text-xs font-mono uppercase text-emerald-700 font-semibold">Mundo de Matemáticas</span>
        <h2 className="text-2xl font-bold text-slate-800">Tu Ruta de Aprendizaje</h2>
      </header>

      <div className="space-y-3">
        {datosFalsos.temas.map((tema) => {
          const estilo = ESTILOS_ESTADO[tema.estado as EstadoTema];
          return (
            <div
              key={tema.id}
              className={`p-4 rounded-lg border flex items-center justify-between bg-white ${estilo.border} shadow-sm`}
            >
              <div className="flex items-center gap-4">
                <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-mono text-xs flex items-center justify-center font-bold">
                  0{tema.orden}
                </span>
                <div>
                  <strong className="text-slate-900 block">{tema.nombre}</strong>
                  <span className="text-xs text-slate-500">
                    {tema.prerrequisitos.length > 0 ? `Requiere: ${tema.prerrequisitos.join(', ')}` : 'Tema inicial'}
                  </span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded text-xs font-medium ${estilo.bg} ${estilo.text}`}>
                {estilo.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
