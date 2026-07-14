import type CONST from '@src/CONST';

import type {ValueOf} from 'type-fest';

type ModalType = ValueOf<typeof CONST.MODAL.MODAL_TYPE>;

export default ModalType;
