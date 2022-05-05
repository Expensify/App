import CONST from '../../CONST';

/**
 * Should modal add top safe area padding by modal type for Android
 * @param {String} modalType
 * @returns {Boolean}
 */
export default (modalType = '') => {
    switch (modalType) {
        case CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED:
            return true;
        default:
            return false;
    }
};
