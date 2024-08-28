import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Policy from '@libs/actions/Policy/Policy';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceCompanyCardsSettingsTransactionLiabilityPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.COMPANY_CARDS_SETTINGS_TRANSACTION_LIABILITY>;

type ListItemType = ListItem & {
    value: ValueOf<typeof CONST.COMPANY_CARDS.DELETE_TRANSACTIONS>;
};

function WorkspaceCompanyCardsSettingsTransactionLiabilityPage({
    route: {
        params: {policyID},
    },
}: WorkspaceCompanyCardsSettingsTransactionLiabilityPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const workspaceAccountID = policy?.workspaceAccountID ?? -1;

    // const [lastSelectedFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_FEED}${policyID}`)
    const [cardFeeds] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${workspaceAccountID}`);
    const lastSelectedFeed = 'cdfbmo';
    const feed = cardFeeds?.companyCards[lastSelectedFeed] ?? '';

    const items: ListItemType[] = [
        {
            value: CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW,
            text: translate('workspace.moreFeatures.companyCards.personal'),
            // @ts-expect-error types will be defined in other pr
            isSelected: feed?.liabilityType === CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW,
            keyForList: CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.ALLOW,
        },
        {
            value: CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT,
            text: translate('workspace.moreFeatures.companyCards.corporate'),
            // @ts-expect-error types will be defined in other pr
            isSelected: feed?.liabilityType === CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT,
            keyForList: CONST.COMPANY_CARDS.DELETE_TRANSACTIONS.RESTRICT,
        },
    ];

    const goBack = useCallback(() => Navigation.goBack(ROUTES.WORKSPACE_COMPANY_CARDS_SETTINGS.getRoute(policyID)), [policyID]);

    const changeTransactionLiability = ({value}: ListItemType) => {
        Policy.setWorkspaceCompanyCardTransactionLiability(workspaceAccountID, lastSelectedFeed, value);
        goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper testID={WorkspaceCompanyCardsSettingsTransactionLiabilityPage.displayName}>
                <HeaderWithBackButton
                    title={translate('workspace.moreFeatures.companyCards.cardFeedTransaction')}
                    onBackButtonPress={goBack}
                />
                <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.moreFeatures.companyCards.setTransactionLiabilityDescription')}</Text>
                </Text>
                <View style={[styles.containerWithSpaceBetween, styles.pointerEventsBoxNone]}>
                    <SelectionList
                        sections={[{data: items}]}
                        ListItem={RadioListItem}
                        onSelectRow={changeTransactionLiability}
                        shouldSingleExecuteRowSelect
                        initiallyFocusedOptionKey={items.find((item) => item.isSelected)?.keyForList}
                    />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceCompanyCardsSettingsTransactionLiabilityPage.displayName = 'WorkspaceCompanyCardsSettingsTransactionLiabilityPage';

export default WorkspaceCompanyCardsSettingsTransactionLiabilityPage;
