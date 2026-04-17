import {isUserValidatedSelector} from '@selectors/Account';
import React, {useState} from 'react';
import {View} from 'react-native';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardFeedsForFeedSelector from '@hooks/useExpensifyCardFeedsForFeedSelector';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearIssueNewCardFlow, clearIssueNewCardFormData, setIssueNewCardStepAndData, updateSelectedExpensifyCardFeed} from '@libs/actions/Card';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';
import {getExpensifyCardFeedDescription} from '@libs/ExpensifyCardFeedSelectorUtils';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
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

type ExpensifyFeedListItem = ListItem & {
    value: number;
};

type WorkspaceExpensifyCardFeedSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SELECT_FEED>;

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
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const primaryContactMethod = usePrimaryContactMethod();
    const defaultFundID = useDefaultFundID(policyID);
    const lastSelectedExpensifyCardFeedID = lastSelectedExpensifyCardFeed ?? defaultFundID;
    const [feedWithError, setFeedWithError] = useState<{fundID?: number; error?: Errors} | undefined>(undefined);

    const {primaryFeeds, otherFeeds} = useExpensifyCardFeedsForFeedSelector(policyID);
    const [policies] = useOnyx(ONYXKEYS.COLLECTION.POLICY);

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
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, Navigation.getActiveRoute()));
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

    const toListItem = (entry: ExpensifyCardFeedEntry, isOtherWorkspaceSection: boolean): ExpensifyFeedListItem => ({
        value: entry.fundID,
        text: getExpensifyCardFeedDescription(entry.settings, policies),
        keyForList: entry.fundID.toString(),
        isSelected: entry.fundID === lastSelectedExpensifyCardFeedID,
        isDisabled: isOtherWorkspaceSection && isOffline,
        errors: feedWithError?.fundID === entry.fundID ? feedWithError.error : undefined,
        leftElement: (
            <Icon
                src={illustrations.ExpensifyCardImage}
                height={variables.cardIconHeight}
                width={variables.cardIconWidth}
                additionalStyles={[styles.mr3, styles.cardIcon]}
            />
        ),
    });

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
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ADD_WORK_EMAIL.getRoute(policyID, feed.value));
            return;
        }

        const primaryLoginKey = primaryContactMethod ? Object.keys(loginList ?? {}).find((login) => login.toLowerCase() === primaryContactMethod.toLowerCase()) : undefined;
        const isPrimaryContactValidated = primaryLoginKey ? !!loginList?.[primaryLoginKey]?.validatedDate : !primaryContactMethod;
        if (!isPrimaryContactValidated) {
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_VERIFY_WORK_EMAIL.getRoute(policyID, feed.value));
            return;
        }

        linkCardFeedToPolicy(feed.value, policyID, CONST.COMPANY_CARD.LINK_FEED_TYPE.EXPENSIFY_CARD)
            .then(() => {
                updateSelectedExpensifyCardFeed(feed.value, policyID);
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
        updateSelectedExpensifyCardFeed(feed.value, policyID);
        goBack();
    };

    const primaryListData = primaryFeeds.map((entry) => toListItem(entry, false));

    const issueNewCardAndOtherFeedsFooter = (
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
                            <RadioListItem
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
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
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
                        ListItem={RadioListItem}
                        onSelectRow={selectFeed}
                        data={primaryListData}
                        alternateNumberOfSupportedLines={2}
                        initiallyFocusedItemKey={lastSelectedExpensifyCardFeedID.toString()}
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
