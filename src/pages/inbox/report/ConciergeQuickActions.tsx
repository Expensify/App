import Button from '@components/ButtonComposed';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';

import {saveReportDraftComment} from '@userActions/Report';

import CONST from '@src/CONST';

import React from 'react';
import {View} from 'react-native';

const QUICK_ACTIONS = [
    {iconName: 'Plus', labelKey: 'common.concierge.quickActions.createExpense', promptKey: 'common.concierge.quickActions.createExpensePrompt'},
    {iconName: 'ChartPie', labelKey: 'common.concierge.quickActions.analyzeSpend', promptKey: 'common.concierge.quickActions.analyzeSpendPrompt'},
    {iconName: 'Wrench', labelKey: 'common.concierge.quickActions.configureWorkspace', promptKey: 'common.concierge.quickActions.configureWorkspacePrompt'},
    {iconName: 'QuestionMark', labelKey: 'common.concierge.quickActions.getSupport', promptKey: 'common.concierge.quickActions.getSupportPrompt'},
] as const;

const QUICK_ACTION_ICON_NAMES = QUICK_ACTIONS.map((action) => action.iconName);

type ConciergeQuickActionsProps = {
    /** The ID of the Concierge report the prompt is written into */
    reportID: string;
};

/**
 * Conversation starters shown under the composer while the Concierge chat is still empty. Pressing one
 * writes its prompt into the composer so the user can edit it before sending.
 */
function ConciergeQuickActions({reportID}: ConciergeQuickActionsProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(QUICK_ACTION_ICON_NAMES);

    return (
        <View style={[styles.flexRow, styles.flexWrap, styles.justifyContentCenter, styles.alignItemsCenter, styles.gap1, styles.pt2]}>
            {QUICK_ACTIONS.map(({iconName, labelKey, promptKey}) => (
                <Button
                    key={labelKey}
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    innerStyles={[styles.bgTransparent]}
                    accessibilityLabel={translate(labelKey)}
                    onPress={() => {
                        saveReportDraftComment(reportID, translate(promptKey));
                        ReportActionComposeFocusManager.focus();
                    }}
                >
                    <Button.Icon
                        src={expensifyIcons[iconName]}
                        fill={theme.icon}
                    />
                    <Button.Text style={styles.textSupporting}>{translate(labelKey)}</Button.Text>
                </Button>
            ))}
        </View>
    );
}

export default ConciergeQuickActions;
