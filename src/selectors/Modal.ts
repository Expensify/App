import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Modal} from '@src/types/onyx';

const willAlertModalBecomeVisibleSelector = (modal: OnyxEntry<Modal>) => modal?.willAlertModalBecomeVisible;

const isRHPVisibleSelector = (modal: OnyxEntry<Modal>) => modal?.type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED;

const isModalCenteredVisibleSelector = (modal: OnyxEntry<Modal>) =>
    modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_SWIPEABLE_TO_RIGHT ||
    modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_UNSWIPEABLE ||
    modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED_SMALL ||
    modal?.type === CONST.MODAL.MODAL_TYPE.CENTERED;

export {willAlertModalBecomeVisibleSelector, isRHPVisibleSelector, isModalCenteredVisibleSelector};
