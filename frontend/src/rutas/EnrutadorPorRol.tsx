import type { Rol } from '../tipos';
import { AdminPage } from '../paginas/admin/AdminPage';
import { ProfesorPage } from '../paginas/profesor/ProfesorPage';
import { AlumnoPage } from '../paginas/alumno/AlumnoPage';
import { PadrePage } from '../paginas/padre/PadrePage';

interface Props {
  rol: Rol;
}

export const EnrutadorPorRol = ({ rol }: Props) => {
  switch (rol) {
    case 'admin':
      return <AdminPage />;
    case 'profesor':
      return <ProfesorPage />;
    case 'alumno':
      return <AlumnoPage />;
    case 'padre':
      return <PadrePage />;
    default:
      return <div className="p-6 text-center text-rose-600">Rol no reconocido</div>;
  }
};
