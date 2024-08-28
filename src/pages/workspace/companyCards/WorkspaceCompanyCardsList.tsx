import React, {useCallback, useMemo} from 'react';
import type {ListRenderItemInfo} from 'react-native';
import {FlatList, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {PressableWithFeedback} from '@components/Pressable';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CardUtils from '@libs/CardUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, WorkspaceCardsList} from '@src/types/onyx';
import WorkspaceCompanyCardsListHeaderButtons from './WorkspaceCompanyCardsListHeaderButtons';
import WorkspaceCompanyCardsListRow from './WorkspaceCompanyCardsListRow';

type WorkspaceCompanyCardsListProps = {
    /** The current policyID */
    policyID: string;

    /** List of company cards */
    cardsList: OnyxEntry<WorkspaceCardsList>;

    /** Currently selected feed */
    selectedFeed: string;
};

function WorkspaceCompanyCardsList({policyID, cardsList, selectedFeed}: WorkspaceCompanyCardsListProps) {
    const styles = useThemeStyles();
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
            <View style={[styles.flexRow, styles.justifyContentBetween, styles.mh5, styles.gap5, styles.p4]}>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    Name
                </Text>
                <Text
                    numberOfLines={1}
                    style={[styles.textLabelSupporting, styles.lh16]}
                >
                    Card number
                </Text>
            </View>
        ),
        [styles],
    );

    return (
        <ScreenWrapper
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicatorInWideScreen
            shouldEnableMaxHeight
            testID={WorkspaceCompanyCardsList.displayName}
        >
            <WorkspaceCompanyCardsListHeaderButtons
                policyID={policyID}
                selectedFeed={selectedFeed}
            />
            <FlatList
                data={sortedCards}
                renderItem={renderItem}
                ListHeaderComponent={renderListHeader}
            />
        </ScreenWrapper>
    );
}

WorkspaceCompanyCardsList.displayName = 'WorkspaceCompanyCardsList';

export default WorkspaceCompanyCardsList;
