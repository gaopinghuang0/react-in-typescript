// The Symbol used to tag the ReactElement type. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
export const REACT_ELEMENT_TYPE =
    (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) ||
    0xeac7;
