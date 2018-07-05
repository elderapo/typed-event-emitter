export const getOrCreateFromMap = <K, V>(map: Map<K, V>, key: K, defaultValue: V): V => {
  if (!map.has(key)) {
    map.set(key, defaultValue);
  }

  return map.get(key) as V; // cast out undefined
};
