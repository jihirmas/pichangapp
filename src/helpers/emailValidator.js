export function emailValidator(email) {
  const re = /\S+@\S+\.\S+/
  if (!email) return "El correo no puede ser vacío"
  if (!re.test(email)) return 'Ooops! Necesitamos un correo válido'
  return ''
}
