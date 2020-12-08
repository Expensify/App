import INTERFACE_TYPES from './INTERFACE_TYPES';

export default {
    /**
     * Determine the interface that the current device offers.
     * For now, we'll assume that native devices are solely touch-based.
     *
     * @returns {string}
     */
    getInterfaceType: () => INTERFACE_TYPES.TOUCH_ONLY,
    interfaceTypes: INTERFACE_TYPES,
};
