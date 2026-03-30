import React, {useCallback, useEffect, useMemo, useState} from 'react';
import BlockingView from '@components/BlockingViews/BlockingView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import type {ListItem} from '@components/SelectionList/types';
import useDefaultFundID from '@hooks/useDefaultFundID';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useSearchResults from '@hooks/useSearchResults';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateSelectedExpensifyCardFeed} from '@libs/actions/Card';
import {filterCardsByPersonalDetails, filterInactiveCards, getCardsByCardholderName, sortCardsByCardholderName} from '@libs/CardUtils';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getHeaderMessage} from '@libs/OptionsListUtils';
import {getDisplayNameOrDefault} from '@libs/PersonalDetailsUtils';
import {getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import variables from '@styles/variables';
import {openPolicyExpensifyCardsPage} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Card} from '@src/types/onyx';
import type {ExpensifyCardRuleFilter} from '@src/types/onyx/ExpensifyCardSettings';

type ExpensifyCardListItem = ListItem & {
    card: Card;
};

type AddCardPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_SPEND_CARD>;

function AddCardPage({route}: AddCardPageProps) {
    const {policyID} = route.params;
    const styles = useThemeStyles();
    const {translate, localeCompare} = useLocalize();
    const policy = usePolicy(policyID);
    const defaultFundID = useDefaultFundID(policyID);
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${defaultFundID}_${CONST.EXPENSIFY_CARD.BANK}`, {selector: filterInactiveCards});
    const [expensifyCardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const illustrations = useMemoizedLazyIllustrations(['Telescope']);

    const [selectedCardIDs, setSelectedCardIDs] = useState<string[]>([]);

    const cardIDsWithSpendRules = useMemo(() => {
        const into = new Set<string>();
        const cardRules = expensifyCardSettings?.cardRules;
        if (!cardRules) {
            return into;
        }

        const addIdentifiersFromRight = (right: string | number | string[]) => {
            if (Array.isArray(right)) {
                for (const id of right) {
                    into.add(String(id));
                }
                return;
            }
            into.add(String(right));
        };

        const collectCardIDsFromFilter = (node: ExpensifyCardRuleFilter | undefined) => {
            if (!node) {
                return;
            }
            if (typeof node.left === 'string') {
                if (node.left === 'cardID' && node.operator === 'eq') {
                    addIdentifiersFromRight(node.right);
                }
                return;
            }
            collectCardIDsFromFilter(node.left);
            collectCardIDsFromFilter(node.right);
        };

        for (const rule of Object.values(cardRules)) {
            if (!rule) {
                continue;
            }
            for (const id of rule.cardID ?? []) {
                into.add(String(id));
            }
            collectCardIDsFromFilter(rule.filters);
        }

        return into;
    }, [expensifyCardSettings?.cardRules]);

    const eligibleCards = useMemo(() => {
        const policyMembersAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policy?.employeeList));
        const allCards = getCardsByCardholderName(cardsList, policyMembersAccountIDs);
        return allCards.filter((card) => !cardIDsWithSpendRules.has(String(card.cardID)));
    }, [cardsList, policy?.employeeList, cardIDsWithSpendRules]);

    const filterCard = useCallback((card: Card, searchInput: string) => filterCardsByPersonalDetails(card, searchInput, personalDetails), [personalDetails]);
    const sortCards = useCallback((cards: Card[]) => sortCardsByCardholderName(cards, personalDetails, localeCompare), [personalDetails, localeCompare]);

    const [inputValue, setInputValue, filteredCards] = useSearchResults(eligibleCards, filterCard, sortCards);

    const listData: ExpensifyCardListItem[] = useMemo(
        () =>
            filteredCards.map((card) => {
                const accountID = card.accountID ?? CONST.DEFAULT_NUMBER_ID;
                const displayName = getDisplayNameOrDefault(personalDetails?.[accountID], '', false);
                const lastFour = card.lastFourPAN ?? '';
                return {
                    keyForList: String(card.cardID),
                    text: displayName,
                    alternateText: lastFour,
                    accountID,
                    card,
                };
            }),
        [filteredCards, personalDetails],
    );

    const fetchCards = useCallback(() => {
        updateSelectedExpensifyCardFeed(defaultFundID, policyID);
        openPolicyExpensifyCardsPage(policyID, defaultFundID);
    }, [defaultFundID, policyID]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    useNetwork({onReconnect: fetchCards});

    const backToSpendRule = ROUTES.RULES_SPEND_NEW.getRoute(policyID);

    const toggleCard = useCallback((item: ExpensifyCardListItem) => {
        setSelectedCardIDs((prev) => {
            if (prev.includes(item.keyForList)) {
                return prev.filter((id) => id !== item.keyForList);
            }
            return [...prev, item.keyForList];
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        const visibleKeys = listData.map((item) => item.keyForList);
        const allVisibleSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selectedCardIDs.includes(key));
        if (allVisibleSelected) {
            const visibleSet = new Set(visibleKeys);
            setSelectedCardIDs((prev) => prev.filter((id) => !visibleSet.has(id)));
            return;
        }
        setSelectedCardIDs((prev) => {
            const next = new Set(prev);
            for (const key of visibleKeys) {
                next.add(key);
            }
            return Array.from(next);
        });
    }, [listData, selectedCardIDs]);

    const handleSave = useCallback(() => {
        Navigation.goBack(backToSpendRule);
    }, [backToSpendRule]);

    const headerMessage = getHeaderMessage(listData.length > 0, false, inputValue, countryCode, false);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                testID="AddCardPage"
                shouldEnableMaxHeight
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.spendRules.cardPageTitle')}
                    onBackButtonPress={() => Navigation.goBack(backToSpendRule)}
                />
                <SelectionList
                    canSelectMultiple
                    textInputOptions={{
                        headerMessage,
                        value: inputValue,
                        label: translate('common.search'),
                        onChangeText: setInputValue,
                    }}
                    data={listData}
                    onSelectAll={listData.length > 0 ? toggleSelectAll : undefined}
                    onCheckboxPress={toggleCard}
                    onSelectRow={toggleCard}
                    selectedItems={selectedCardIDs}
                    ListItem={UserListItem}
                    shouldUseDefaultRightHandSideCheckmark={false}
                    shouldUpdateFocusedIndex
                    shouldPreventDefaultFocusOnSelectRow={!canUseTouchScreen()}
                    listEmptyContent={
                        <BlockingView
                            icon={illustrations.Telescope}
                            iconWidth={variables.emptyListIconWidth}
                            iconHeight={variables.emptyListIconHeight}
                            title={inputValue.trim() ? translate('common.noResultsFound') : translate('workspace.companyCards.noActiveCards')}
                        />
                    }
                    footerContent={
                        <FormAlertWithSubmitButton
                            buttonText={translate('common.save')}
                            isAlertVisible={false}
                            onSubmit={handleSave}
                            isDisabled={selectedCardIDs.length === 0}
                            enabledWhenOffline
                            containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                        />
                    }
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

AddCardPage.displayName = 'AddCardPage';

export default AddCardPage;
