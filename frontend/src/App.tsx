import { useState } from 'react';
import type { Rol } from './tipos';
import { Navbar } from './componentes/Navbar';
import { EnrutadorPorRol } from './rutas/EnrutadorPorRol';
import datosFalsos from './datos/datosFalsos.json';

export function App() {
  const [rolActual, setRolActual] = useState<Rol>(datosFalsos.usuarioActual.rol as Rol);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Navbar rolActual={rolActual} onCambiarRol={setRolActual} />
      <main className="flex-1">
        <EnrutadorPorRol rol={rolActual} />
      </main>
      <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-500 font-mono">
        Seminario de Proyecto 2 · Universidad Galileo
      </footer>
    </div>
  );
}

export default App;
