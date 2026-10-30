import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';

import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {ValueOf} from 'type-fest';

import React from 'react';

import PressableWithFeedback from './Pressable/PressableWithFeedback';

type MoneyReportHeaderHistoryButtonProps = ChildrenProps & {
    /** Plain text of the status shown inside the button, so screen readers still announce it */
    message: string;

    sentryLabel: ValueOf<typeof CONST.SENTRY_LABEL.REPORT>;
};

/**
 * Makes the next step or status bar open the report history.
 */
function MoneyReportHeaderHistoryButton({children, message, sentryLabel}: MoneyReportHeaderHistoryButtonProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <PressableWithFeedback
            onPress={() => Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.REPORT_HISTORY.path))}
            wrapperStyle={[styles.w100, styles.justifyContentCenter, styles.headerStatusBarContainer]}
            accessibilityLabel={`${message}, ${translate('reportHistoryPage.title')}`}
            role={CONST.ROLE.BUTTON}
            sentryLabel={sentryLabel}
        >
            {children}
        </PressableWithFeedback>
    );
}

export default MoneyReportHeaderHistoryButton;
