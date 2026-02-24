import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type ModalType = ValueOf<typeof CONST.MODAL.MODAL_TYPE>;

export default ModalType;
