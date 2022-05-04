import CONST from '../../CONST';
import getModalStyles from './getModalStyles';

export default getModalStyles({
    shouldModalAddTopSafeAreaPadding: {
        [CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED]: true,
    },
});
