import React, {useCallback, useMemo} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, WorkspaceCardsList} from '@src/types/onyx';
import WorkspaceCompanyCardsFeedAddedEmptyPage from './WorkspaceCompanyCardsFeedAddedEmptyPage';
import WorkspaceCompanyCardsListRow from './WorkspaceCompanyCardsListRow';

type WorkspaceCompanyCardsListProps = {
    /** List of company cards */
    cardsList: OnyxEntry<WorkspaceCardsList>;
};

function WorkspaceCompanyCardsList({cardsList}: WorkspaceCompanyCardsListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);

    const sortedCards = useMemo(() => CardUtils.sortCardsByCardholderName(cardsList, personalDetails), [cardsList, personalDetails]);

    const renderItem = useCallback(
        ({item, index}: ListRenderItemInfo<Card>) => (
            <OfflineWithFeedback
                key={`${item.nameValuePairs?.cardTitle}_${index}`}
                errorRowStyles={styles.ph5}
                errors={item.errors}
            >
                <PressableWithFeedback
                    role={CONST.ROLE.BUTTON}
                    style={[styles.mh5, styles.br3, styles.mb3, styles.highlightBG]}
                    accessibilityLabel="row"
                    hoverStyle={styles.hoveredComponentBG}
                    // TODO: navigate to Card Details screen when implemented
                    onPress={() => {}}
                >
                    <WorkspaceCompanyCardsListRow
                        cardholder={personalDetails?.[item.accountID ?? '-1']}
                        cardNumber={item?.cardNumber ?? ''}
                        name={item.nameValuePairs?.cardTitle ?? ''}
                    />
                </PressableWithFeedback>
            </OfflineWithFeedback>
        ),
        [personalDetails, styles],
    );

    const renderListHeader = useCallback(
        () => (
            <View style={[styles.flexRow, styles.appBG, styles.justifyContentBetween, styles.mh5, styles.gap5, styles.p4]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    {translate('common.name')}
                </Text>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    {translate('workspace.companyCards.cardNumber')}
                </Text>
            </View>
        ),
        [styles, translate],
    );

    if (sortedCards.length === 0) {
        return <WorkspaceCompanyCardsFeedAddedEmptyPage />;
    }

    return (
        <FlatList
            contentContainerStyle={styles.flexGrow1}
            data={sortedCards}
            renderItem={renderItem}
            ListHeaderComponent={renderListHeader}
            stickyHeaderIndices={[0]}
        />
    );
}

export default WorkspaceCompanyCardsList;
