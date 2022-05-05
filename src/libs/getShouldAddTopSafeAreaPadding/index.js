import CONST from '../../CONST';

/**
 * Should modal add top safe area padding by modal type
 * @param {String} modalType
 * @returns {Boolean}
 */
export default (modalType = '') => {
    switch (modalType) {
        case CONST.MODAL.MODAL_TYPE.CENTERED:
        case CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE:
        case CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED:
            return true;
        default:
            return false;
    }
};
