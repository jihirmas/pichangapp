export function categoriaValidator(genero) {
  if (genero == 'Masculino' || genero == 'Femenino') return '';
  return "Debes seleccionar un genero"
}
