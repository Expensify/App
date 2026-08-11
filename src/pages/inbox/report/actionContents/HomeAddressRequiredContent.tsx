import type {ActionableItem} from '@components/ReportActionItem/ActionableItemButtons';
import ActionableItemButtons from '@components/ReportActionItem/ActionableItemButtons';

import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, getReportActionText} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import type CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';

type HomeAddressRequiredContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED>;
};

function HomeAddressRequiredContent({action}: HomeAddressRequiredContentProps) {
    // The prompt is resolved once the member saves a home address. The backend clears the actionable state
    // and stamps a resolution, so hide the CTA to avoid pointing at a task that is already done.
    const buttons: ActionableItem[] = getOriginalMessage(action)?.resolution
        ? []
        : [
              {
                  text: 'homePage.timeSensitiveSection.addHomeAddress.cta',
                  key: `${action.reportActionID}-homeAddressRequired-addHomeAddress`,
                  onPress: () => Navigation.navigate(ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1)),
                  isPrimary: true,
              },
          ];

    return (
        <ReportActionItemBasicMessage message={getReportActionText(action)}>
            {buttons.length > 0 && (
                <ActionableItemButtons
                    items={buttons}
                    shouldUseLocalization
                    layout="horizontal"
                />
            )}
        </ReportActionItemBasicMessage>
    );
}

export default HomeAddressRequiredContent;
