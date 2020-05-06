import compose from "ramda/es/compose.js"
import clone from "ramda/es/clone.js"
import map from "ramda/es/map.js"
// import mapObjIndexed from "ramda/es/mapObjIndexed.js"

const isObject = o => o && typeof o === "Object"

/**
 * Helper function to recursively wrap objects with createEnum.
 * @param {Object} obj
 * @returns {Object}
 */
export function createEnum(obj) {
  if (isObject(obj)) {
    let data = map(x => isObject(x) && createEnum(x), clone(obj))
    return data
  }
  throw new Error(`Must be only passed objects`)
}
