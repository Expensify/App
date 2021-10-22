/**
 * On native devices, always return false.
 * This is needed so we can always disable some feature on native devices that should be
 * conditionally enabled / disabled on web & desktop.
 * @returns {Boolean} false always
 */
export default () => false;
