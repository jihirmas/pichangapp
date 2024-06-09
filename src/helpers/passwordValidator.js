export function passwordValidator(password) {
  if (!password) return "La clave no puede ser vacía"
  if (password.length < 5) return 'La clave debe tener al menos 5 caracteres'
  return ''
}
