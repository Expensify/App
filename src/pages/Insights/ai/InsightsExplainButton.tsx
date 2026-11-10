import Button from '@components/Button';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {InsightsScope} from '@src/types/onyx';

import React from 'react';

import useInsightsExplanation from './useInsightsExplanation';

type InsightsExplainButtonProps = {
    /** Message sent to Concierge on press */
    explainPrompt: string;

    /** Dashboard and filters sent with the prompt so Concierge explains the data the user sees */
    insightsScope: InsightsScope;
};

/** Button that asks Concierge to explain an AI insight or chart, sending along the dashboard filters so the answer covers the data on screen. */
function InsightsExplainButton({explainPrompt, insightsScope}: InsightsExplainButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);
    const {askConcierge, shouldShowAskConcierge, conciergeTargetReportID} = useAskConcierge({forceConcierge: true});
    const getPreloadedAnswer = useInsightsExplanation(explainPrompt, insightsScope, conciergeTargetReportID, shouldShowAskConcierge);

    if (!shouldShowAskConcierge) {
        return null;
    }

    return (
        <Button
            size={CONST.BUTTON_SIZE.SMALL}
            onPress={() => askConcierge(explainPrompt, {insightsScope}, getPreloadedAnswer())}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.AI_EXPLAIN}
            style={styles.alignSelfStart}
            innerStyles={styles.bgTransparent}
            hoverStyles={styles.hoveredComponentBG}
        >
            <Button.Icon
                src={icons.Sparkles}
                fill={theme.icon}
                hoverFill={theme.icon}
            />
            <Button.Text style={[styles.textMicroBold, styles.textSupporting]}>{translate('insightsPage.explain')}</Button.Text>
        </Button>
    );
}

export default InsightsExplainButton;
