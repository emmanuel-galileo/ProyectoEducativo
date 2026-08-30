export type UserRole = 'admin' | 'profesor' | 'alumno' | 'padre';

export interface UserProfile {
  id: string;
  colegio_id: string;
  rol: UserRole;
  nombre: string;
  apellido: string;
  correo: string | null;
  usuario: string | null;
  avatar: string;
  foto_url?: string | null;
  activo?: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserProfile;
}

export interface SiblingPortalConfig {
  portalUrl: string;
  portalName: string;
  mismatchMessage: string;
}

export interface RoleMismatchNotice {
  userName: string;
  userRole: UserRole;
  message: string;
  targetPortalUrl: string;
  targetPortalName: string;
}
