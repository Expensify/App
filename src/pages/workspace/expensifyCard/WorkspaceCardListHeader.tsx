import React from 'react';
import {View} from 'react-native';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import WorkspaceCardsListLabel from './WorkspaceCardsListLabel';

// TODO: remove when Onyx data is available
const mockedSettings = {
    currentBalance: 5000,
    remainingLimit: 3000,
    cashBack: 2000,
};

function WorkspaceCardListHeader() {
    const {shouldUseNarrowLayout, isMediumScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;

    // TODO: uncomment the code line below to use cardSettings data from Onyx when it's supported
    // const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`);
    const cardSettings = mockedSettings;

    return (
        <View>
            <View style={[isLessThanMediumScreen ? styles.flexColumn : styles.flexRow, styles.mv5, styles.mh5]}>
                <View style={[styles.flexRow, styles.flex1]}>
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CURRENT_BALANCE]}
                    />
                    <WorkspaceCardsListLabel
                        type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT}
                        value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.REMAINING_LIMIT]}
                    />
                </View>
                <WorkspaceCardsListLabel
                    type={CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK}
                    value={cardSettings?.[CONST.WORKSPACE_CARDS_LIST_LABEL_TYPE.CASH_BACK]}
                    style={isLessThanMediumScreen ? styles.mt3 : undefined}
                />
            </View>

            <View style={[styles.flexRow, styles.appBG, styles.mh5, styles.gap5, styles.p4]}>
                <View style={[styles.flexRow, styles.flex5, styles.gap2, styles.alignItemsCenter]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.textLabelSupporting, styles.lh16]}
                    >
                        {translate('workspace.expensifyCard.name')}
                    </Text>
                </View>
                <View style={[styles.flexRow, styles.gap2, shouldUseNarrowLayout ? styles.flex2 : styles.flex1, styles.alignItemsCenter, styles.justifyContentEnd]}>
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
