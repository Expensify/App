import Button from '@components/ButtonComposed';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import {getOriginalMessage, getReportActionText} from '@libs/ReportActionsUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {ReportAction} from '@src/types/onyx';

import React from 'react';

type HomeAddressRequiredContentProps = {
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED>;
};

function HomeAddressRequiredContent({action}: HomeAddressRequiredContentProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    // The prompt is resolved once the member saves a home address. The backend clears the actionable state
    // and stamps a resolution, so hide the CTA to avoid pointing at a task that is already done.
    const isResolved = !!getOriginalMessage(action)?.resolution;

    return (
        <ReportActionItemBasicMessage message={getReportActionText(action)}>
            {!isResolved && (
                <Button
                    onPress={() => Navigation.navigate(ROUTES.SETTINGS_PRIVATE_PERSONAL_DETAILS.getRoute(INPUT_IDS.ADDRESS_LINE_1))}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    style={[styles.alignSelfStart, styles.mt3]}
                >
                    <Button.Text>{translate('homePage.timeSensitiveSection.addHomeAddress.cta')}</Button.Text>
                </Button>
            )}
        </ReportActionItemBasicMessage>
    );
}

export default HomeAddressRequiredContent;
