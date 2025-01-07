import React from 'react';
import {saveUnknownUserDetails} from '@libs/actions/Share';
import Navigation from '@libs/Navigation/Navigation';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';
import CONST from '@src/CONST';
import type ROUTES from '@src/ROUTES';

type ShareTabParticipantsSelectorProps = {
    detailsPageRouteObject: typeof ROUTES.SHARE_SUBMIT_DETAILS | typeof ROUTES.SHARE_DETAILS;
};

export default function ShareTabParticipantsSelector({detailsPageRouteObject}: ShareTabParticipantsSelectorProps) {
    return (
        <MoneyRequestParticipantsSelector
            iouType={CONST.IOU.TYPE.SUBMIT}
            onParticipantsAdded={(value) => {
                const participant = value.at(0);
                const reportID = participant?.reportID;
                const accountID = participant?.accountID;
                if (accountID && !reportID) {
                    saveUnknownUserDetails(participant);
                }
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                Navigation.navigate(detailsPageRouteObject.getRoute(`${reportID || accountID}`));
            }}
            action="create"
        />
    );
}
