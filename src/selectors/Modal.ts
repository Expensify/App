import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Modal} from '@src/types/onyx';

const willAlertModalBecomeVisibleSelector = (modal: OnyxEntry<Modal>) => modal?.willAlertModalBecomeVisible;

const isRHPVisibleSelector = (modal: OnyxEntry<Modal>) => modal?.type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED;

export {willAlertModalBecomeVisibleSelector, isRHPVisibleSelector};
