import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {FullScreenNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import WorkspaceCardsListLabel from './WorkspaceCardsListLabel';

function WorkspaceCardListHeader() {
    const {shouldUseNarrowLayout, isMediumScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const route = useRoute<RouteProp<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD>>();

    const policyID = route.params.policyID;
    const isLessThanMediumScreen = isMediumScreenWidth || isSmallScreenWidth;

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}`);

    return (
        <View style={styles.appBG}>
            <View style={[isLessThanMediumScreen ? styles.flexColumn : styles.flexRow, isLessThanMediumScreen ? [styles.mt5, styles.mb3] : styles.mv5, styles.mh5, styles.ph4]}>
                <View style={[styles.flexRow, styles.flex1, isLessThanMediumScreen && styles.mb5]}>
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
            </View>

            <View style={[styles.flexRow, styles.mh5, styles.gap5, styles.p4]}>
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
