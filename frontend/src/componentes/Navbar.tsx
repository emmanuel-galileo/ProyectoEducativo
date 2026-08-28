import type { Rol } from '../tipos';

interface Props {
  rolActual: Rol;
  onCambiarRol: (nuevoRol: Rol) => void;
}

export const Navbar = ({ rolActual, onCambiarRol }: Props) => {
  return (
    <header className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center shadow-md gap-4">
      <div>
        <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono">Seminario de Proyecto 2</span>
        <h1 className="text-lg font-bold">Plataforma Adaptativa de Aprendizaje</h1>
      </div>

      <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
        <label className="text-xs font-mono text-slate-300 uppercase">Simular Rol:</label>
        <select
          value={rolActual}
          onChange={(e) => onCambiarRol(e.target.value as Rol)}
          className="bg-slate-900 text-white text-sm px-3 py-1 rounded border border-slate-600 focus:outline-none focus:border-emerald-500"
        >
          <option value="admin">Administrador</option>
          <option value="profesor">Profesor</option>
          <option value="alumno">Alumno</option>
          <option value="padre">Padre</option>
        </select>
      </div>
    </header>
  );
};
