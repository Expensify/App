import CONST from '../../CONST';
import getModalStyles from './getModalStyles';

export default getModalStyles({
    shouldModalAddTopSafeAreaPadding: {
        [CONST.MODAL.MODAL_TYPE.CENTERED]: true,
        [CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE]: true,
        [CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED]: true,
    },
});
