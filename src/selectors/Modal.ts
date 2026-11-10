import CONST from '@src/CONST';
import type {Modal} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

const willAlertModalBecomeVisibleSelector = (modal: OnyxEntry<Modal>) => modal?.willAlertModalBecomeVisible;

const isRHPVisibleSelector = (modal: OnyxEntry<Modal>) => modal?.type === CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED;

const isModalCoveringSelector = (modal: OnyxEntry<Modal>) => !!modal?.willAlertModalBecomeVisible && !modal?.isPopover;

const isModalActiveSelector = (modal: OnyxEntry<Modal>) => !!modal?.isVisible || !!modal?.willAlertModalBecomeVisible;

const isPopoverModalSelector = (modal: OnyxEntry<Modal>) => !!modal?.isPopover;

export {willAlertModalBecomeVisibleSelector, isRHPVisibleSelector, isModalCoveringSelector, isModalActiveSelector, isPopoverModalSelector};
