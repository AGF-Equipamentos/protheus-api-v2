export function unifyObjectProperties(values: any) {
  const result = {} as typeof values

  for (const key in values) {
    if (key.endsWith('[]')) {
      result[key] = values[key]
    } else if (!Object.prototype.hasOwnProperty.call(values, `${key}[]`)) {
      result[`${key}[]`] = values[key]
    }
  }

  return result
}
