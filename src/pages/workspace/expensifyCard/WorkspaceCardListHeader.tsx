import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormHelpMessage from '@components/FormHelpMessage';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import WorkspaceCardsListLabel from './WorkspaceCardsListLabel';

type WorkspaceCardListHeaderProps = {
    /** ID of the current policy */
    policyID: string;
};

function WorkspaceCardListHeader({policyID}: WorkspaceCardListHeaderProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isMediumScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);
    const [cardManualBilling] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING}${workspaceAccountID}`);

    const errorMessage = getLatestErrorMessage(cardSettings) ?? '';

    const shouldShowSettlementButtonOrDate = !!cardSettings?.isMonthlySettlementAllowed || cardManualBilling;

    const getLabelsLayout = () => {
        if (!isLessThanMediumScreen) {
            return (
                <>
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE] ?? 0}
                    />
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT] ?? 0}
                    />
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK] ?? 0}
                    />
                </>
            );
        }
        return shouldShowSettlementButtonOrDate ? (
            <>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE] ?? 0}
                />
                <View style={[styles.flexRow, !isLessThanMediumScreen && styles.flex2, isLessThanMediumScreen && styles.mt5]}>
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT] ?? 0}
                    />
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK] ?? 0}
                    />
                </View>
            </>
        ) : (
            <>
                <View style={[styles.flexRow, isLessThanMediumScreen && styles.mb5]}>
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE] ?? 0}
                    />
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT] ?? 0}
                    />
                </View>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK] ?? 0}
                />
            </>
        );
    };

    return (
        <View style={styles.appBG}>
            <View style={[isLessThanMediumScreen ? styles.flexColumn : styles.flexRow, styles.mt5, styles.mh5, styles.ph4]}>{getLabelsLayout()}</View>
            {!!errorMessage && (
                <View style={[styles.mh5, styles.ph4, styles.mt2]}>
                    <FormHelpMessage
                        isError
                        message={errorMessage}
                    />
                </View>
            )}
            <View style={[styles.flexRow, styles.mh5, styles.gap2, styles.p4, isLessThanMediumScreen ? styles.mt3 : styles.mt5]}>
                <View style={[styles.flexRow, styles.flex4, styles.gap2, styles.alignItemsCenter]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.textLabelSupporting, styles.lh16]}
                    >
                        {translate('workspace.expensifyCard.name')}
                    </Text>
                </View>
                {!shouldUseNarrowLayout && (
                    <View style={[styles.flexRow, styles.gap2, styles.flex1, styles.alignItemsCenter, styles.justifyContentStart]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.textLabelSupporting, styles.lh16]}
                        >
                            {translate('common.type')}
                        </Text>
                    </View>
                )}
                <View
                    style={[
                        styles.flexRow,
                        styles.gap2,
                        shouldUseNarrowLayout ? styles.flex2 : styles.flex1,
                        styles.alignItemsCenter,
                        shouldUseNarrowLayout ? styles.justifyContentCenter : styles.justifyContentStart,
                    ]}
                >
                    <Text
                        numberOfLines={1}
                        style={[styles.textLabelSupporting, styles.lh16]}
                    >
                        {translate('workspace.expensifyCard.lastFour')}
                    </Text>
                </View>
                <View style={[styles.flexRow, shouldUseNarrowLayout ? styles.flex3 : styles.flex1, styles.gap2, styles.alignItemsCenter, styles.justifyContentEnd]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.textLabelSupporting, styles.lh16]}
                    >
                        {translate('workspace.expensifyCard.limit')}
                    </Text>
                </View>
            </View>
        </View>
    );
}

WorkspaceCardListHeader.displayName = 'WorkspaceCardListHeader';

export default WorkspaceCardListHeader;
