export type UserRole = 'admin' | 'event' | 'hr' | 'media' | 'driver' | 'member' | 'trainee' | 'trial' | 'management' | 'manager' | 'founder';

export interface RolePermissions {
  view_dashboard: boolean;
  view_logs: boolean;
  delete_logs: boolean;
  manage_slots: boolean;
  manage_applications: boolean;
  manage_gallery: boolean;
  manage_users: boolean;
  manage_settings: boolean;
}

const NO_ACCESS: RolePermissions = {
  view_dashboard: false,
  view_logs: false,
  delete_logs: false,
  manage_slots: false,
  manage_applications: false,
  manage_gallery: false,
  manage_users: false,
  manage_settings: false,
};

export const PERMISSIONS: Record<string, RolePermissions> = {
  'admin': {
    view_dashboard: true,
    view_logs: true,
    delete_logs: true,
    manage_slots: true,
    manage_applications: true,
    manage_gallery: true,
    manage_users: true,
    manage_settings: true,
  },
  'manager': {
    view_dashboard: true,
    view_logs: true,
    delete_logs: true,
    manage_slots: true,
    manage_applications: true,
    manage_gallery: true,
    manage_users: true,
    manage_settings: true,
  },
  'management': {
    view_dashboard: true,
    view_logs: true,
    delete_logs: true,
    manage_slots: true,
    manage_applications: true,
    manage_gallery: true,
    manage_users: true,
    manage_settings: true,
  },
  'founder': {
    view_dashboard: true,
    view_logs: true,
    delete_logs: true,
    manage_slots: true,
    manage_applications: true,
    manage_gallery: true,
    manage_users: true,
    manage_settings: true,
  },
  'event': {
    ...NO_ACCESS,
    view_dashboard: true,
    view_logs: true,
    manage_slots: true,
  },
  'hr': {
    ...NO_ACCESS,
    view_dashboard: true,
    view_logs: true,
    manage_applications: true,
    manage_users: true,

  },
  'media': {
    ...NO_ACCESS,
    view_dashboard: true,
    view_logs: true,
    manage_gallery: true,
  },
  'driver': {
    ...NO_ACCESS,
    view_dashboard: true,
  },
  'default': NO_ACCESS
};

export const getPermissions = (role: string | null | undefined): RolePermissions => {
  if (!role) return NO_ACCESS;
  // Handle roles case-insensitively
  const normalizedRole = role.toLowerCase();
  
  // Map partial matches or exact matches
  if (normalizedRole.includes('admin')) return PERMISSIONS['admin'];
  if (normalizedRole.includes('manager')) return PERMISSIONS['manager'];
  if (normalizedRole.includes('management')) return PERMISSIONS['management'];
  if (normalizedRole.includes('founder')) return PERMISSIONS['founder'];
  
  return PERMISSIONS[normalizedRole] || PERMISSIONS['default'];
};
