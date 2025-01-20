import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as PolicyUtils from '@libs/PolicyUtils';
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

    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);
    const isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);

    return (
        <View style={styles.appBG}>
            <View style={[isLessThanMediumScreen ? styles.flexColumn : styles.flexRow, isLessThanMediumScreen ? [styles.mt5, styles.mb3] : styles.mv5, styles.mh5, styles.ph4]}>
                <View style={[styles.flexRow, styles.flex1, isLessThanMediumScreen && styles.mb5]}>
                    <View style={styles.flex1}>
                        <View style={[styles.flex1, styles.flexRow]}>
                            <WorkspaceCardsListLabel
                                type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                                value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE] ?? 0}
                            />
                            <View style={[]}>
                                <Button
                                    onPress={() => {}}
                                    text={translate('workspace.expensifyCard.settleBalance')}
                                    style={[styles.mtAuto]}
                                />
                            </View>
                        </View>
                        <Text style={[styles.mutedNormalTextLabel, styles.mt1]}>{translate('workspace.expensifyCard.balanceWillBeSettledOn', {settlementDate: 'date'})}</Text>
                    </View>
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT] ?? 0}
                    />
                </View>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK] ?? 0}
                />
            </View>

            <View style={[styles.flexRow, styles.mh5, styles.gap2, styles.p4]}>
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
