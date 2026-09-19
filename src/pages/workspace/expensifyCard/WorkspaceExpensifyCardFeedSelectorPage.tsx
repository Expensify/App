import Button from '@components/Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItemAction from '@components/MenuItem/presets/MenuItemAction';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useCanEnrollNewExpensifyCardProgram from '@hooks/useCanEnrollNewExpensifyCardProgram';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardFeedsForFeedSelector from '@hooks/useExpensifyCardFeedsForFeedSelector';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearIssueNewCardFlow, clearIssueNewCardFormData, updateSelectedExpensifyCardFeed} from '@libs/actions/Card';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';
import {getExpensifyCardFeedDescription} from '@libs/ExpensifyCardFeedSelectorUtils';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {canEditWorkspaceSettings, canMemberWrite} from '@libs/PolicyUtils';
import {expensifyLoginsSelector} from '@libs/UserUtils';

import Navigation from '@navigation/Navigation';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import variables from '@styles/variables';

import {linkCardFeedToPolicy} from '@userActions/CompanyCards';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Errors} from '@src/types/onyx/OnyxCommon';

import {isUserValidatedSelector} from '@selectors/Account';
import React, {useState} from 'react';
import {View} from 'react-native';

type ExpensifyFeedListItem = ListItem & {
    value: number;
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
    const [draftFundID, setDraftFundID] = useState<number>();
    const currentSelectedFundID = draftFundID ?? lastSelectedExpensifyCardFeedID;
    const [feedWithError, setFeedWithError] = useState<{fundID?: number; error?: Errors} | undefined>(undefined);
    const {login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const {primaryFeeds, otherFeeds} = useExpensifyCardFeedsForFeedSelector(policyID);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);
    const [domains] = useOnyx(ONYXKEYS.COLLECTION.DOMAIN);
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST);
    const policy = usePolicy(policyID);
    const canWriteExpensifyCard = canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD);
    const {canEnrollNewCardProgram} = useCanEnrollNewExpensifyCardProgram(policyID);
    const canStartBankAccountSetup = canEditWorkspaceSettings(policy, currentUserLogin);

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

    const hasIssueCardFundID = getIssueCardFundID() !== undefined;

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

    const toListItem = (entry: ExpensifyCardFeedEntry, isOtherWorkspaceSection: boolean): ExpensifyFeedListItem => {
        const isFeedPendingDelete = entry.settings.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
        return {
            value: entry.fundID,
            text: getExpensifyCardFeedDescription(entry.settings, policies, domains, entry.fundID, cardList),
            keyForList: entry.fundID.toString(),
            isSelected: entry.fundID === currentSelectedFundID,
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

    /**
     * Links a feed owned by another workspace to this policy and then selects it. The user may first have to add or
     * validate a work email, in which case that flow carries the fundID and finishes the selection on its own.
     */
    const linkOtherWorkspaceFeed = (fundID: number) => {
        const isUserFromPublicDomain = isEmailPublicDomain(primaryContactMethod);
        if (!isUserValidated || isUserFromPublicDomain) {
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ADD_WORK_EMAIL.getRoute(policyID, fundID));
            return;
        }

        const primaryLoginKey = primaryContactMethod ? Object.keys(loginList ?? {}).find((login) => login.toLowerCase() === primaryContactMethod.toLowerCase()) : undefined;
        const isPrimaryContactValidated = primaryLoginKey ? !!loginList?.[primaryLoginKey]?.validatedDate : !primaryContactMethod;
        if (!isPrimaryContactValidated) {
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_VERIFY_WORK_EMAIL.getRoute(policyID, fundID));
            return;
        }

        linkCardFeedToPolicy(fundID, policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.EXPENSIFY_CARD)
            .then(() => {
                updateSelectedExpensifyCardFeed(fundID, policyID);
                goBack();
            })
            .catch((error: TranslationPaths) => {
                setFeedWithError({
                    fundID,
                    error: getMicroSecondOnyxErrorWithTranslationKey(error),
                });
            });
    };

    const selectFeed = (feed: ExpensifyFeedListItem) => {
        // Staging another row makes an error left over from a previous link attempt irrelevant.
        setFeedWithError(undefined);
        setDraftFundID(feed.value);
    };

    const isOtherWorkspaceFeedStaged = otherFeeds.some((entry) => entry.fundID === currentSelectedFundID);
    const isStagedFeedOnPage = isOtherWorkspaceFeedStaged || primaryFeeds.some((entry) => entry.fundID === currentSelectedFundID);

    const saveFeed = () => {
        if (!currentSelectedFundID) {
            return;
        }
        resetCardFlowState();
        // A feed from another workspace is not selectable until it has been linked to this policy.
        if (isOtherWorkspaceFeedStaged) {
            linkOtherWorkspaceFeed(currentSelectedFundID);
            return;
        }
        updateSelectedExpensifyCardFeed(currentSelectedFundID, policyID);
        goBack();
    };

    // Every row is submittable, matching the old behaviour where tapping any row committed it: re-saving the active
    // feed is a harmless no-op, and an offline link attempt reports its own error on the row. Save is only dead when
    // no row is checked, which happens with no primary feeds, where the default fund resolves to the workspace
    // account ID rather than to any listed feed. Checking membership rather than inequality also keeps Save usable
    // for a fallback feed that lands in otherFeeds while still resolving as the default fund.
    const isSaveDisabled = !isStagedFeedOnPage;

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveFeed,
        isDisabled: isSaveDisabled,
    };

    const primaryListData = primaryFeeds.map((entry) => toListItem(entry, false));

    // Issuing a card on an already selected feed is already offered on the card list page, so this page only offers
    // setting up a brand new program. Suppress that branch on workspaces with unsupported currencies, and for members
    // who cannot reach the bank account setup page.
    const shouldShowSetUpNewProgramButton = !hasIssueCardFundID && canEnrollNewCardProgram && canStartBankAccountSetup;

    // Without a primary feed the page renders a plain ScrollView instead of a SelectionList, so it has to supply its
    // own Save button for the "From other workspaces" rows — they are the only selectable rows in that state.
    const shouldShowOtherFeedsSaveButton = canWriteExpensifyCard && otherFeeds.length > 0;

    const issueNewCardAndOtherFeedsFooter = canWriteExpensifyCard ? (
        <View style={[styles.w100, styles.flexColumn]}>
            {shouldShowSetUpNewProgramButton && (
                <MenuItemAction
                    title={translate('workspace.expensifyCard.issueNewCard')}
                    icon={expensifyIcons.Plus}
                    onPress={handleSetUpNewProgramPress}
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.ISSUE_CARD_BUTTON}
                />
            )}
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
                                showTooltip={false}
                                item={item}
                                onSelectRow={selectFeed}
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
                        initiallyFocusedItemKey={lastSelectedExpensifyCardFeedID.toString()}
                        confirmButtonOptions={confirmButtonOptions}
                        addBottomSafeAreaPadding
                        listFooterContent={issueNewCardAndOtherFeedsFooter}
                        onDismissError={onDismissError}
                    />
                ) : (
                    <>
                        <ScrollView
                            // The Save button below carries the bottom safe area padding whenever it is rendered.
                            addBottomSafeAreaPadding={!shouldShowOtherFeedsSaveButton}
                            style={styles.flex1}
                            keyboardShouldPersistTaps="handled"
                        >
                            {issueNewCardAndOtherFeedsFooter}
                        </ScrollView>
                        {shouldShowOtherFeedsSaveButton && (
                            <FixedFooter
                                style={styles.mtAuto}
                                addBottomSafeAreaPadding
                            >
                                <Button
                                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                                    size="large"
                                    style={styles.w100}
                                    onPress={saveFeed}
                                    isDisabled={isSaveDisabled}
                                >
                                    <Button.Text>{translate('common.save')}</Button.Text>
                                </Button>
                            </FixedFooter>
                        )}
                    </>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardFeedSelectorPage;
