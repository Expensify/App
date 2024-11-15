import React from 'react';
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
                const reportID = value.at(0)?.reportID;
                const accountID = value.at(0)?.accountID;
                // Navigation.navigate(ROUTES.SHARE_DETAILS.getRoute(`${!reportID ? accountID : reportID}`));
                Navigation.navigate(ROUTES.SHARE_SUBMIT_DETAILS.getRoute(`${!reportID ? accountID : reportID}`));
            }}
            iouRequestType="manual"
            action="create"
        />
    );
}

export default SubmitTab;
