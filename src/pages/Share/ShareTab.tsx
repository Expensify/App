import React from 'react';
import {saveUnknownUserDetails} from '@libs/actions/Share';
import Navigation from '@libs/Navigation/Navigation';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function ShareTab() {
    return (
        <MoneyRequestParticipantsSelector
            iouType={CONST.IOU.TYPE.SUBMIT}
            onParticipantsAdded={(value) => {
                const participant = value.at(0);
                const reportID = participant?.reportID;
                const accountID = participant?.accountID;
                if (accountID && !reportID && participant) {
                    saveUnknownUserDetails(participant);
                }
                Navigation.navigate(ROUTES.SHARE_DETAILS.getRoute(`${!reportID ? accountID : reportID}`));
            }}
            action="create"
        />
    );
}

export default ShareTab;
