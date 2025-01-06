import React from 'react';
import {saveUnknownUserDetails} from '@libs/actions/Share';
import Navigation from '@libs/Navigation/Navigation';
import MoneyRequestParticipantsSelector from '@pages/iou/request/MoneyRequestParticipantsSelector';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

function SubmitTab() {
    return (
        <MoneyRequestParticipantsSelector
            iouType={CONST.IOU.TYPE.SUBMIT}
            onFinish={() => {}}
            onParticipantsAdded={(value) => {
                const participant = value.at(0);
                const reportID = participant?.reportID;
                const accountID = participant?.accountID;
                if (accountID && !reportID) {
                    saveUnknownUserDetails(participant);
                }
                Navigation.navigate(ROUTES.SHARE_SUBMIT_DETAILS.getRoute(`${!reportID ? accountID : reportID}`));
            }}
            action="create"
        />
    );
}

export default SubmitTab;
