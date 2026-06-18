import React, {useState} from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import useExpensifyCardUkEuSupported from '@hooks/useExpensifyCardUkEuSupported';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {ExpensifyCardSettingsBase} from '@src/types/onyx';
import WorkspaceCardsListLabel from './WorkspaceCardsListLabel';

type WorkspaceCardListLabelsProps = {
    /** ID of the current policy */
    policyID: string;

    /** Card settings */
    cardSettings: ExpensifyCardSettingsBase | undefined;
};

function WorkspaceCardListLabels({policyID, cardSettings}: WorkspaceCardListLabelsProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isMediumScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow', 'UpArrow']);
    const isUkEuCurrencySupported = useExpensifyCardUkEuSupported(policyID);
    const [isCashBackExpanded, setIsCashBackExpanded] = useState(false);

    const isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;
    const shouldShowCashBack = !isUkEuCurrencySupported;

    if (!isLessThanMediumScreen) {
        return (
            <View style={[styles.flexRow, styles.mt5, styles.mh5, styles.pr4]}>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE] ?? 0}
                />
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT] ?? 0}
                />
                {shouldShowCashBack && (
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK] ?? 0}
                    />
                )}
            </View>
        );
    }

    return (
        <View style={[styles.flexColumn, styles.mt5, styles.mh5]}>
            <View style={[styles.flexRow, styles.alignItemsCenter]}>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE] ?? 0}
                />
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT] ?? 0}
                />
                {shouldShowCashBack && (
                    <PressableWithFeedback
                        onPress={() => setIsCashBackExpanded(!isCashBackExpanded)}
                        style={[styles.p3Half, styles.justifyContentCenter, styles.alignItemsCenter]}
                        accessibilityRole={CONST.ROLE.BUTTON}
                        accessibilityLabel={translate('workspace.expensifyCard.earnedCashback')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE_CARDS_LIST.INFO_BUTTON}
                    >
                        <Icon
                            src={isCashBackExpanded ? icons.UpArrow : icons.DownArrow}
                            fill={theme.icon}
                            width={variables.iconSizeNormal}
                            height={variables.iconSizeNormal}
                        />
                    </PressableWithFeedback>
                )}
            </View>
            {shouldShowCashBack && isCashBackExpanded && (
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK] ?? 0}
                    style={styles.mt3}
                />
            )}
        </View>
    );
}

export default WorkspaceCardListLabels;
