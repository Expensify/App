import {isUserValidatedSelector} from '@selectors/Account';
import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import {useDelegateNoAccessActions, useDelegateNoAccessState} from '@components/DelegateNoAccessModalProvider';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import SelectionListWithSections from '@components/SelectionList/SelectionListWithSections';
import type {Section} from '@components/SelectionList/SelectionListWithSections/types';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useExpensifyCardFeedsForFeedSelector from '@hooks/useExpensifyCardFeedsForFeedSelector';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearIssueNewCardFormData, setIssueNewCardStepAndData, updateSelectedExpensifyCardFeed} from '@libs/actions/Card';
import {getLinkedPolicyIdsFromExpensifyCardSettings, getPreferredPolicyFromExpensifyCardSettings} from '@libs/CardUtils';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import type {ExpensifyCardFeedEntry} from '@libs/ExpensifyCardFeedSelectorUtils';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDescriptionForPolicyDomainCard} from '@libs/PolicyUtils';
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
    const {policyID, exitToIssueNew: exitToIssueNewParam} = route.params;
    const exitToIssueNew = exitToIssueNewParam === 'true';
    const {translate} = useLocalize();
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

    const getFeedSelectorRowText = (entry: ExpensifyCardFeedEntry) => {
        const domainName = entry.settings?.domainName ?? '';
        if (domainName) {
            return getDescriptionForPolicyDomainCard(domainName, policies);
        }
        const linkedPolicyIds = getLinkedPolicyIdsFromExpensifyCardSettings(entry.settings);
        const preferredPolicyID = getPreferredPolicyFromExpensifyCardSettings(entry.settings);
        const policyIDForName = linkedPolicyIds?.length ? linkedPolicyIds.at(0) : preferredPolicyID;
        return (policyIDForName && policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyIDForName.toUpperCase()}`]?.name) ?? '';
    };

    const handleAddCardPress = useCallback(() => {
        clearIssueNewCardFormData();
        if (isAccountLocked) {
            showLockedAccountModal();
            return;
        }
        if (isDelegateAccessRestricted) {
            showDelegateNoAccessModal();
            return;
        }
        updateSelectedExpensifyCardFeed(lastSelectedExpensifyCardFeedID, policyID);
        setIssueNewCardStepAndData({policyID, isChangeAssigneeDisabled: false});
        Navigation.navigate(
            ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, exitToIssueNew ? ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID) : Navigation.getActiveRoute()),
        );
    }, [
        policyID,
        exitToIssueNew,
        lastSelectedExpensifyCardFeedID,
        isAccountLocked,
        isDelegateAccessRestricted,
        showLockedAccountModal,
        showDelegateNoAccessModal,
    ]);

    const otherWorkspacesSectionHeader = useMemo(
        () => (
            <View>
                <View style={[styles.ph5, styles.pb3]}>
                    <Button
                        success
                        onPress={handleAddCardPress}
                        icon={expensifyIcons.Plus}
                        text={translate('workspace.expensifyCard.issueCard')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.EXPENSIFY_CARD.ISSUE_CARD_BUTTON}
                    />
                </View>
                <View style={[styles.optionsListSectionHeader, styles.justifyContentCenter]}>
                    <Text style={[styles.ph5, styles.textLabelSupporting]}>{translate('workspace.expensifyCard.otherWorkspaces')}</Text>
                </View>
            </View>
        ),
        [expensifyIcons.Plus, handleAddCardPress, styles.justifyContentCenter, styles.optionsListSectionHeader, styles.pb3, styles.ph5, styles.textLabelSupporting, translate],
    );

    const toListItem = (entry: ExpensifyCardFeedEntry): ExpensifyFeedListItem => ({
        value: entry.fundID,
        text: getFeedSelectorRowText(entry),
        keyForList: entry.fundID.toString(),
        isSelected: entry.fundID === lastSelectedExpensifyCardFeedID,
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

    const sections: Array<Section<ExpensifyFeedListItem>> = [];
    if (primaryFeeds.length > 0) {
        sections.push({
            data: primaryFeeds.map(toListItem),
            sectionIndex: sections.length,
        });
    }
    if (otherFeeds.length > 0) {
        sections.push({
            ...(primaryFeeds.length > 0 ? {customHeader: otherWorkspacesSectionHeader} : {title: translate('workspace.expensifyCard.otherWorkspaces')}),
            data: otherFeeds.map(toListItem),
            sectionIndex: sections.length,
        });
    }

    const goBack = () => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));

    const onDismissError = () => {
        setFeedWithError(undefined);
    };

    const selectOtherFeed = (feed: ExpensifyFeedListItem) => {
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
                if (exitToIssueNew) {
                    setIssueNewCardStepAndData({policyID, isChangeAssigneeDisabled: false});
                    Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
                    return;
                }
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
        updateSelectedExpensifyCardFeed(feed.value, policyID);
        if (exitToIssueNew) {
            setIssueNewCardStepAndData({policyID, isChangeAssigneeDisabled: false});
            Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW.getRoute(policyID, ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID)));
            return;
        }
        goBack();
    };

    const otherFeedFundIDs = new Set(otherFeeds.map((entry) => entry.fundID));

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
                <SelectionListWithSections
                    ListItem={RadioListItem}
                    onSelectRow={(feed) => {
                        if (otherFeedFundIDs.has(feed.value)) {
                            selectOtherFeed(feed);
                            return;
                        }
                        selectFeed(feed);
                    }}
                    sections={sections}
                    initiallyFocusedItemKey={lastSelectedExpensifyCardFeedID.toString()}
                    addBottomSafeAreaPadding
                    onDismissError={onDismissError}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceExpensifyCardFeedSelectorPage;
