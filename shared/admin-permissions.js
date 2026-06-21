export function isAdminRole(role) {
  return role === 'ADMIN';
}

export function isModeratorRole(role) {
  return role === 'MODERATOR';
}

export function isStaffRole(role) {
  return isAdminRole(role) || isModeratorRole(role);
}

export function canManageStaffUsers(role) {
  return isAdminRole(role);
}

export function canAccessAdminSection(role, sectionId) {
  if (!isStaffRole(role)) return false;
  if (sectionId === 'users' || sectionId === 'backup') return canManageStaffUsers(role);
  return true;
}

export function getStaffRoleLabel(role) {
  if (isAdminRole(role)) return 'Admin';
  if (isModeratorRole(role)) return 'Moderatör';
  return 'Kullanıcı';
}
