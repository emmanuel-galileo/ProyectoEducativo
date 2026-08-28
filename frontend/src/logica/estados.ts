import type { EstadoTema } from '../tipos';

export const ESTILOS_ESTADO: Record<EstadoTema, { bg: string; text: string; border: string; label: string }> = {
  dominado: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-500',
    label: 'Dominado'
  },
  en_progreso: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-500',
    label: 'En Progreso'
  },
  refuerzo: {
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-500',
    label: 'Necesita Refuerzo'
  },
  bloqueado: {
    bg: 'bg-slate-100',
    text: 'text-slate-500',
    border: 'border-slate-300',
    label: 'Bloqueado'
  }
};
