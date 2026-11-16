import Button from '@components/Button';
import useAskConcierge from '@components/Search/SearchRouter/useAskConcierge';
import Tooltip from '@components/Tooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {InsightsScope} from '@src/types/onyx';

import React from 'react';
import {View} from 'react-native';

type InsightsExplainButtonProps = {
    /** Message sent to Concierge on press */
    explainPrompt: string;

    /** Dashboard and filters sent with the prompt so Concierge explains the data the user sees */
    insightsScope: InsightsScope;

    /** Label shown next to the icon. Without one, the button shows a tooltip instead. */
    children?: React.ReactNode;
};

/** Button that asks Concierge to explain an AI insight or chart, sending along the dashboard filters so the answer covers the data on screen. */
function InsightsExplainButton({explainPrompt, insightsScope, children}: InsightsExplainButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Sparkles']);
    const {askConcierge, shouldShowAskConcierge} = useAskConcierge({forceConcierge: true});

    if (!shouldShowAskConcierge) {
        return null;
    }

    return (
        <Tooltip
            shouldRender={!children}
            text={translate('insightsPage.explain')}
        >
            <View style={styles.alignSelfStart}>
                <Button
                    size={CONST.BUTTON_SIZE.SMALL}
                    onPress={() => askConcierge(explainPrompt, {insightsScope})}
                    sentryLabel={CONST.SENTRY_LABEL.INSIGHTS.AI_EXPLAIN}
                    accessibilityLabel={translate('insightsPage.explain')}
                    innerStyles={styles.bgTransparent}
                    hoverStyles={styles.hoveredComponentBG}
                >
                    <Button.Icon
                        src={icons.Sparkles}
                        fill={theme.icon}
                        hoverFill={theme.icon}
                    />
                    {children}
                </Button>
            </View>
        </Tooltip>
    );
}

export default InsightsExplainButton;
