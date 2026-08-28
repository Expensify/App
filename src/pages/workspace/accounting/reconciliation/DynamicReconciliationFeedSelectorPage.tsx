import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReconciliationFundID from '@hooks/useReconciliationFundID';
import useThemeStyles from '@hooks/useThemeStyles';

import {getExpensifyCardFeedDescription} from '@libs/ExpensifyCardFeedSelectorUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {appendParam} from '@libs/Url';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React from 'react';

type ReconciliationFeedListItem = ListItem & {
    value: number;
};

type DynamicReconciliationFeedSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.ACCOUNTING.DYNAMIC_RECONCILIATION_SELECT_FEED>;

function DynamicReconciliationFeedSelectorPage({route}: DynamicReconciliationFeedSelectorPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardImage']);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WORKSPACE_ACCOUNTING_RECONCILIATION_SELECT_FEED.path);

    const {candidates, fundID: selectedFundID} = useReconciliationFundID(policyID);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);

    const goBack = () => Navigation.goBack(backPath);

    const data: ReconciliationFeedListItem[] = candidates.map((entry) => ({
        value: entry.fundID,
        text: getExpensifyCardFeedDescription(entry.settings, policies, domains, entry.fundID, cardList),
        keyForList: entry.fundID.toString(),
        isSelected: entry.fundID === selectedFundID,
        leftElement: (
            <Icon
                src={illustrations.ExpensifyCardImage}
                height={variables.cardIconHeight}
                width={variables.cardIconWidth}
                additionalStyles={[styles.mr3, styles.cardIcon]}
            />
        ),
    }));

    // The choice travels back in the route rather than through the last-selected-feed NVP the Expensify Card pages use:
    // that NVP also decides which feed a new card is issued on, so writing it here would let picking a feed to
    // reconcile retarget card issuance. compareParams: false makes this go up to the reconciliation page already on the
    // stack and update its fundID, instead of pushing a second entry for the same page.
    const selectFeed = (feed: ReconciliationFeedListItem) => {
        Navigation.goBack(appendParam(backPath, 'fundID', feed.value.toString()), {compareParams: false});
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
        >
            <ScreenWrapper
                testID="DynamicReconciliationFeedSelectorPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.selectCards')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    ListItem={SingleSelectListItem}
                    onSelectRow={selectFeed}
                    data={data}
                    alternateNumberOfSupportedLines={2}
                    initiallyFocusedItemKey={selectedFundID.toString()}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicReconciliationFeedSelectorPage;
