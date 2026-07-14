import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardFeedsForFeedSelector from '@hooks/useExpensifyCardFeedsForFeedSelector';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useSelectedExpensifyCardProgram from '@hooks/useSelectedExpensifyCardProgram';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearIssueNewCardFlow, clearIssueNewCardFormData, setIssueNewCardStepAndData, updateSelectedExpensifyCardFeed} from '@libs/actions/Card';
import type {CardProgramKey} from '@libs/CardUtils';
import {getConfiguredExpensifyCardProgramKeys, getExpensifyCardProgramLabelSuffix} from '@libs/CardUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';
import {getExpensifyCardFeedDescription} from '@libs/ExpensifyCardFeedSelectorUtils';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canMemberWrite} from '@libs/PolicyUtils';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import {linkCardFeedToPolicy} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import {isUserValidatedSelector} from '@selectors/Account';
import React, {useState} from 'react';
import {View} from 'react-native';

type ExpensifyFeedListItem = ListItem & {
    value: number;
    programKey: CardProgramKey;
};

type WorkspaceExpensifyCardFeedSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.DYNAMIC_WORKSPACE_EXPENSIFY_CARD_SELECT_FEED>;

function WorkspaceExpensifyCardFeedSelectorPage({route}: WorkspaceExpensifyCardFeedSelectorPageProps) {
    const {policyID} = route.params;
    const {translate} = useLocalize();
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['ExpensifyCardImage']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Plus']);
    const {isDelegateAccessRestricted} = useDelegateNoAccessState();
    const {showDelegateNoAccessModal} = useDelegateNoAccessActions();
    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();
    const [lastSelectedExpensifyCardFeed] = useOnyx(`${ONYXKEYS.COLLECTION.LAST_SELECTED_EXPENSIFY_CARD_FEED}${policyID}`);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const primaryContactMethod = usePrimaryContactMethod();
    const defaultFundID = useDefaultFundID(policyID);
    const lastSelectedExpensifyCardFeedID = lastSelectedExpensifyCardFeed ?? defaultFundID;
    const selectedProgramKey = useSelectedExpensifyCardProgram(policyID, lastSelectedExpensifyCardFeedID);
    const [feedWithError, setFeedWithError] = useState<{fundID?: number; error?: Errors} | undefined>(undefined);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const {primaryFeeds, otherFeeds} = useExpensifyCardFeedsForFeedSelector(policyID);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const policy = usePolicy(policyID);
    const canWriteExpensifyCard = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD);

    const getIssueCardFundID = () => {
        if (primaryFeeds.length === 0) {
            return undefined;
        }
        const matchingPrimary = primaryFeeds.find((entry) => entry.fundID === lastSelectedExpensifyCardFeedID);
        if (matchingPrimary) {
            return matchingPrimary.fundID;
        }
        if (primaryFeeds.length === 1) {
            return primaryFeeds.at(0)?.fundID;
        }
        return undefined;
    };

    const issueCardFundID = getIssueCardFundID();

    const handleAddCardPress = () => {
        if (issueCardFundID === undefined) {
            return;
        }
        clearIssueNewCardFormData();
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        updateSelectedExpensifyCardFeed(issueCardFundID, policyID);
        setIssueNewCardStepAndData({policyID, isChangeAssigneeDisabled: false});
        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.path, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
    };

    /** When there is no primary feed for this workspace, mirror empty-state flow: bank account / new program setup (same as WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT). */
    const handleSetUpNewProgramPress = () => {
        clearIssueNewCardFormData();
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT.getRoute(policyID));
    };

    // A feed provisioned with more than one program renders one row per program (see getAdminExpensifyCardFeedEntries),
    // so the currently-selected row is identified by both the feed (fundID) and the program.
    const getFeedRowKey = (fundID: number, programKey: CardProgramKey) => `${fundID}_${programKey}`;

    const toListItem = (entry: ExpensifyCardFeedEntry, isOtherWorkspaceSection: boolean): ExpensifyFeedListItem => {
        const isFeedPendingDelete = entry.settings.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        const description = getExpensifyCardFeedDescription(entry.settings, policies, domains, entry.fundID, cardList);
        const hasMultiplePrograms = getConfiguredExpensifyCardProgramKeys(entry.settings).length > 1;
        const labelSuffix = hasMultiplePrograms ? getExpensifyCardProgramLabelSuffix(entry.settings, entry.programKey) : '';
        const rowKey = getFeedRowKey(entry.fundID, entry.programKey);
        return {
            value: entry.fundID,
            programKey: entry.programKey,
            text: labelSuffix ? `${description} ${labelSuffix}` : description,
            keyForList: rowKey,
            isSelected: entry.fundID === lastSelectedExpensifyCardFeedID && entry.programKey === selectedProgramKey,
            isDisabled: isFeedPendingDelete || (isOtherWorkspaceSection && isOffline),
            pendingAction: entry.settings.pendingAction,
            errors: feedWithError?.fundID === entry.fundID ? feedWithError.error : undefined,
            leftElement: (
                <Icon
                    src={illustrations.ExpensifyCardImage}
                    height={variables.cardIconHeight}
                    width={variables.cardIconWidth}
                    additionalStyles={[styles.mr3, styles.cardIcon]}
                />
            ),
        };
    };

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));

    const onDismissError = () => {
        setFeedWithError(undefined);
    };

    const resetCardFlowState = () => {
        clearIssueNewCardFlow(policyID);
        clearIssueNewCardFormData();
    };

    const selectOtherFeed = (feed: ExpensifyFeedListItem) => {
        resetCardFlowState();
        const isUserFromPublicDomain = isEmailPublicDomain(primaryContactMethod);
        if (!isUserValidated || isUserFromPublicDomain) {
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ADD_WORK_EMAIL.getRoute(policyID, feed.value, feed.programKey));
            return;
        }

        const primaryLoginKey = primaryContactMethod ? Object.keys(loginList ?? {}).find((login) => login.toLowerCase() === primaryContactMethod.toLowerCase()) : undefined;
        const isPrimaryContactValidated = primaryLoginKey ? !!loginList?.[primaryLoginKey]?.validatedDate : !primaryContactMethod;
        if (!isPrimaryContactValidated) {
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_VERIFY_WORK_EMAIL.getRoute(policyID, feed.value, feed.programKey));
            return;
        }

        linkCardFeedToPolicy(feed.value, policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.EXPENSIFY_CARD, feed.programKey)
            .then(() => {
                updateSelectedExpensifyCardFeed(feed.value, policyID, feed.programKey);
                goBack();
            })
            .catch((error: TranslationPaths) => {
                setFeedWithError({
                    fundID: feed.value,
                    error: getMicroSecondOnyxErrorWithTranslationKey(error),
                });
            });
    };

    const selectFeed = (feed: ExpensifyFeedListItem) => {
        resetCardFlowState();
        updateSelectedExpensifyCardFeed(feed.value, policyID, feed.programKey);
        goBack();
    };

    const primaryListData = primaryFeeds.map((entry) => toListItem(entry, false));

    const issueNewCardAndOtherFeedsFooter = canWriteExpensifyCard ? (
        <View style={[styles.w100, styles.flexColumn]}>
            <MenuItem
                title={translate(issueCardFundID !== undefined ? 'workspace.expensifyCard.issueCard' : 'workspace.expensifyCard.issueNewCard')}
                icon={expensifyIcons.Plus}
                onPress={issueCardFundID !== undefined ? handleAddCardPress : handleSetUpNewProgramPress}
                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.ISSUE_CARD_BUTTON}
            />
            {otherFeeds.length > 0 && (
                <>
                    <Text style={[styles.ph5, styles.mv2, styles.textLabelSupporting]}>{translate('workspace.companyCards.fromOtherWorkspaces')}</Text>
                    {otherFeeds.map((entry) => {
                        const item = toListItem(entry, true);
                        return (
                            <SingleSelectListItem
                                isDisabled={isOffline}
                                onDismissError={onDismissError}
                                key={item.keyForList}
                                keyForList={item.keyForList}
                                showTooltip={false}
                                item={item}
                                onSelectRow={selectOtherFeed}
                                isMultilineSupported
                                isAlternateTextMultilineSupported
                                alternateTextNumberOfLines={2}
                                titleNumberOfLines={2}
                                wrapperStyle={[styles.flexReset, styles.w100]}
                            />
                        );
                    })}
                </>
            )}
        </View>
    ) : undefined;

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
        >
            <ScreenWrapper
                testID="WorkspaceExpensifyCardFeedSelectorPage"
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
                enableEdgeToEdgeBottomSafeAreaPadding
            >
                <HeaderWithBackButton
                    title={translate('workspace.companyCards.selectCards')}
                    onBackButtonPress={goBack}
                />
                {primaryFeeds.length > 0 ? (
                    <SelectionList
                        ListItem={SingleSelectListItem}
                        onSelectRow={selectFeed}
                        data={primaryListData}
                        alternateNumberOfSupportedLines={2}
                        initiallyFocusedItemKey={getFeedRowKey(lastSelectedExpensifyCardFeedID, selectedProgramKey)}
                        addBottomSafeAreaPadding
                        listFooterContent={issueNewCardAndOtherFeedsFooter}
                        onDismissError={onDismissError}
                    />
                ) : (
                    <ScrollView
                        addBottomSafeAreaPadding
                        style={styles.flex1}
                        keyboardShouldPersistTaps="handled"
                    >
                        {issueNewCardAndOtherFeedsFooter}
                    </ScrollView>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardFeedSelectorPage;
