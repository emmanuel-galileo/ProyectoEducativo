import datosFalsos from '../../datos/datosFalsos.json';

export const PadrePage = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <header className="border-b border-slate-200 pb-4">
        <span className="text-xs font-mono uppercase text-slate-500 font-semibold">Seguimiento Familiar</span>
        <h2 className="text-2xl font-bold text-slate-800">Progreso de tu hijo — Matemáticas 3°</h2>
        <p className="text-slate-600 text-sm">Resumen formativo por bandas de dominio sin clasificaciones numéricas competitivas.</p>
      </header>

      <div className="space-y-4">
        {datosFalsos.recomendacionesPadre.map((rec, i) => (
          <div key={i} className="p-5 bg-white rounded-lg border border-slate-200 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">{rec.tema}</h3>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                rec.banda === 'Domina' ? 'bg-emerald-100 text-emerald-800' :
                rec.banda === 'En desarrollo' ? 'bg-amber-100 text-amber-800' :
                'bg-rose-100 text-rose-800'
              }`}>
                {rec.banda}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              <strong className="text-slate-700">Qué practicar en casa:</strong> {rec.accionSugerida}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
