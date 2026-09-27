import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import RenderHTML from '@components/RenderHTML';
import ScreenWrapper from '@components/ScreenWrapper';
import type {WorkspaceListItemType} from '@components/SelectionList/ListItem/types';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/types';

import useCardPreferredWorkspace from '@hooks/useCardPreferredWorkspace';
import useCardsList from '@hooks/useCardsList';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceList from '@hooks/useWorkspaceList';

import {getCompanyCardCustomName, getDefaultCardName, isExpensifyCard, splitCardFeedWithDomainID} from '@libs/CardUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {isEligibleForCardPreferredWorkspace} from '@libs/PolicyUtils';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setCardPreferredPolicy} from '@userActions/Card';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import {companyCardCustomNamesSelector} from '@selectors/Card';
import React, {useState} from 'react';
import {View} from 'react-native';

type DynamicCardPreferredWorkspacePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_CARD_PREFERRED_WORKSPACE>;

function DynamicCardPreferredWorkspacePage({route}: DynamicCardPreferredWorkspacePageProps) {
    const {policyID, cardID, feed} = route.params;
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.CARD_PREFERRED_WORKSPACE.path);
    const goBack = () => Navigation.goBack(backPath, {compareParams: false});

    const [allBankCards] = useCardsList(feed);
    const card = allBankCards?.[cardID];
    const splitFeed = splitCardFeedWithDomainID(feed);
    const domainOrWorkspaceAccountID = splitFeed?.domainID ?? CONST.DEFAULT_NUMBER_ID;
    const bank = splitFeed?.feedName ?? CONST.EXPENSIFY_CARD.BANK;

    const personalDetails = usePersonalDetails();
    const cardholder = personalDetails?.[card?.accountID ?? CONST.DEFAULT_NUMBER_ID];
    const {accountID: currentUserAccountID, login: currentUserLogin} = useCurrentUserPersonalDetails();

    const [customCardNames] = useOnyx(ONYXKEYS.NVP_EXPENSIFY_COMPANY_CARDS_CUSTOM_NAMES);
    const [sharedCardCustomNames] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_DOMAIN_MEMBER}${domainOrWorkspaceAccountID}`, {selector: companyCardCustomNamesSelector});
    const cardName = isExpensifyCard(card)
        ? card?.nameValuePairs?.cardTitle
        : (getCompanyCardCustomName(cardID, sharedCardCustomNames, customCardNames) ?? getDefaultCardName(cardholder?.displayName));

    const featureName = isExpensifyCard(card) ? CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED : CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED;
    const policyFeature = isExpensifyCard(card) ? CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD : CONST.POLICY.POLICY_FEATURE.COMPANY_CARDS;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={featureName}
            policyFeature={policyFeature}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="DynamicCardPreferredWorkspacePage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.card.preferredWorkspace.title')}
                    subtitle={cardName}
                    onBackButtonPress={goBack}
                />
                <View style={[styles.mh5, styles.mb3, styles.renderHTML, styles.flexRow]}>
                    <RenderHTML html={translate('workspace.card.preferredWorkspace.selectDescription', CONST.WORKSPACE_SUBMISSION_FREQUENCY_HELP_URL)} />
                </View>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default DynamicCardPreferredWorkspacePage;
