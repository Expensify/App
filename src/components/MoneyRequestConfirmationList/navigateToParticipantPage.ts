/**
 * Opens the confirmation participant row destination: the in-page picker for manual
 * expenses, or the participants step for every other request type so reportID can update
 * when returning to confirmation (e.g. track-distance from FAB).
 */
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

type NavigateToParticipantPageParams = {
    canEditParticipant: boolean;
    isManualRequest: boolean;
    iouType: Exclude<IOUType, typeof CONST.IOU.TYPE.REQUEST | typeof CONST.IOU.TYPE.SEND>;
    action: IOUAction;
    transactionID: string | undefined;
    reportID: string | undefined;
    onOpenParticipantPicker: () => void;
};

function navigateToParticipantPage({canEditParticipant, isManualRequest, iouType, action, transactionID, reportID, onOpenParticipantPicker}: NavigateToParticipantPageParams) {
    if (!canEditParticipant) {
        return;
    }

    if (isManualRequest) {
        onOpenParticipantPicker();
        return;
    }

    const newIOUType = iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK ? CONST.IOU.TYPE.CREATE : iouType;
    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute({action, iouType: newIOUType, transactionID, reportID})));
}

export default navigateToParticipantPage;
