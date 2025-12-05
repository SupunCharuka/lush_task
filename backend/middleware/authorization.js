// For setups where you want to remove permission checks, provide no-op
// middleware functions. These simply call `next()` and allow all requests.
export function requireRole(/* roleName */) {
  return (req, res, next) => next()
}

export function requirePermission(/* permissionName */) {
  return (req, res, next) => next()
}
