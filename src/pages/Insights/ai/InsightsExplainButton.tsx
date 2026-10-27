import Button from '@components/Button';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {InsightsScope} from '@src/types/onyx';

import React from 'react';

type InsightsExplainButtonProps = {
    /** Message sent to Concierge on press */
    explainPrompt: string;

    insightsScope: InsightsScope;

    /** Tints the glyph and label with the link color instead of the muted one */
    isAccented?: boolean;
};

/** Asks Concierge to explain an AI insight, sending along the dashboard filters it was written for. */
function InsightsExplainButton({explainPrompt, insightsScope, isAccented = false}: InsightsExplainButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);
    const {askConcierge, shouldShowAskConcierge} = useAskConcierge({forceConcierge: true});

    if (!shouldShowAskConcierge) {
        return null;
    }

    const glyphColor = isAccented ? theme.link : theme.icon;

    return (
        <Button
            size={CONST.BUTTON_SIZE.SMALL}
            onPress={() => askConcierge(explainPrompt, {insightsScope})}
            sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.AI_EXPLAIN}
            style={styles.alignSelfStart}
            innerStyles={styles.bgTransparent}
            hoverStyles={styles.hoveredComponentBG}
        >
            <Button.Icon
                src={icons.Sparkles}
                fill={glyphColor}
                hoverFill={glyphColor}
            />
            <Button.Text style={[styles.textMicroBold, isAccented ? styles.link : styles.textSupporting]}>{translate('reportActionContextMenu.explain')}</Button.Text>
        </Button>
    );
}

export default InsightsExplainButton;
