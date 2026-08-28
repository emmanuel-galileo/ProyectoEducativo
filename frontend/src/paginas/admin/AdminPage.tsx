export const AdminPage = () => {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <header className="border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-bold text-slate-800">Panel de Administración de Colegio</h2>
        <p className="text-slate-600 text-sm">Gestión de grados, secciones, asignación de profesores y vinculación de alumnos.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-mono text-slate-500 uppercase">Grados y Clases</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">3° Primaria — Sección A</p>
          <span className="text-xs text-emerald-600 font-medium">Ciclo Activo</span>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-mono text-slate-500 uppercase">Profesores</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">1 Asignado</p>
          <span className="text-xs text-slate-500">Matemáticas</span>
        </div>
        <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
          <span className="text-xs font-mono text-slate-500 uppercase">Alumnos Registrados</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">6 Alumnos</p>
          <span className="text-xs text-emerald-600 font-medium">100% con padre vinculado</span>
        </div>
      </div>
    </div>
  );
};
