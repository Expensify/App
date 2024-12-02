import {useFocusEffect} from '@react-navigation/native';
import React, {useCallback, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import ConfirmModal from '@components/ConfirmModal';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import * as PolicyUtils from '@libs/PolicyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Card from '@userActions/Card';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceEditCardLimitTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE>;

function WorkspaceEditCardLimitTypePage({route}: WorkspaceEditCardLimitTypePageProps) {
    const {policyID, cardID} = route.params;
    const workspaceAccountID = PolicyUtils.getWorkspaceAccountID(policyID);

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const policy = usePolicy(policyID);
    const [cardsList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${workspaceAccountID}_${CONST.EXPENSIFY_CARD.BANK}`);

    const card = cardsList?.[cardID];
    const areApprovalsConfigured = PolicyUtils.getApprovalWorkflow(policy) !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const defaultLimitType = areApprovalsConfigured ? CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART : CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY;
    const initialLimitType = card?.nameValuePairs?.limitType ?? defaultLimitType;
    const promptTranslationKey =
        initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY || initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED
            ? 'workspace.expensifyCard.changeCardSmartLimitTypeWarning'
            : 'workspace.expensifyCard.changeCardMonthlyLimitTypeWarning';

    const [typeSelected, setTypeSelected] = useState(initialLimitType);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const goBack = useCallback(() => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID)), [policyID, cardID]);

    const fetchCardLimitTypeData = useCallback(() => {
        Policy.openPolicyEditCardLimitTypePage(policyID, Number(cardID));
    }, [policyID, cardID]);

    useFocusEffect(fetchCardLimitTypeData);

    const updateCardLimitType = () => {
        setIsConfirmModalVisible(false);

        Card.updateExpensifyCardLimitType(workspaceAccountID, Number(cardID), typeSelected, card?.nameValuePairs?.limitType);

        goBack();
    };

    const submit = () => {
        let shouldShowConfirmModal = false;
        if (!!card?.unapprovedSpend && card?.nameValuePairs?.unapprovedExpenseLimit) {
            // Spends are coming as negative numbers from the backend and we need to make it positive for the correct expression.
            const unapprovedSpend = Math.abs(card.unapprovedSpend);
            const isUnapprovedSpendOverLimit = unapprovedSpend >= card.nameValuePairs.unapprovedExpenseLimit;

            const validCombinations = [
                [CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY, CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART],
                [CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART, CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY],
                [CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED, CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART],
                [CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED, CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY],
            ];
            // Check if the combination exists in validCombinations
            const isValidCombination = validCombinations.some(([limitType, selectedType]) => initialLimitType === limitType && typeSelected === selectedType);

            if (isValidCombination && isUnapprovedSpendOverLimit) {
                shouldShowConfirmModal = true;
            }
        }

        if (shouldShowConfirmModal) {
            setIsConfirmModalVisible(true);
        } else {
            updateCardLimitType();
        }
    };

    const data = useMemo(() => {
        const options = [];
        let shouldShowFixedOption = true;

        if (card?.totalSpend && card?.nameValuePairs?.unapprovedExpenseLimit) {
            const totalSpend = Math.abs(card.totalSpend);
            if (
                (initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY || initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART) &&
                totalSpend >= card.nameValuePairs?.unapprovedExpenseLimit
            ) {
                shouldShowFixedOption = false;
            }
        }

        if (areApprovalsConfigured) {
            options.push({
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                text: translate('workspace.card.issueNewCard.smartLimit'),
                alternateText: translate('workspace.card.issueNewCard.smartLimitDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART,
            });
        }

        options.push({
            value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            text: translate('workspace.card.issueNewCard.monthly'),
            alternateText: translate('workspace.card.issueNewCard.monthlyDescription'),
            keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
            isMultilineSupported: true,
            isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY,
        });

        if (shouldShowFixedOption) {
            options.push({
                value: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                text: translate('workspace.card.issueNewCard.fixedAmount'),
                alternateText: translate('workspace.card.issueNewCard.fixedAmountDescription'),
                keyForList: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
                isMultilineSupported: true,
                isSelected: typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
            });
        }

        return options;
    }, [areApprovalsConfigured, card, initialLimitType, translate, typeSelected]);

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceEditCardLimitTypePage.displayName}
                shouldEnablePickerAvoiding={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.card.issueNewCard.limitType')}
                    onBackButtonPress={goBack}
                />
                <FullPageOfflineBlockingView>
                    <SelectionList
                        ListItem={RadioListItem}
                        onSelectRow={({value}) => setTypeSelected(value)}
                        sections={[{data}]}
                        shouldUpdateFocusedIndex
                        isAlternateTextMultilineSupported
                        initiallyFocusedOptionKey={typeSelected}
                    />
                    <ConfirmModal
                        title={translate('workspace.expensifyCard.changeCardLimitType')}
                        isVisible={isConfirmModalVisible}
                        onConfirm={updateCardLimitType}
                        onCancel={() => setIsConfirmModalVisible(false)}
                        prompt={translate(promptTranslationKey, {limit: CurrencyUtils.convertToDisplayString(card?.nameValuePairs?.unapprovedExpenseLimit, CONST.CURRENCY.USD)})}
                        confirmText={translate('workspace.expensifyCard.changeLimitType')}
                        cancelText={translate('common.cancel')}
                        danger
                        shouldEnableNewFocusManagement
                    />
                    <Button
                        success
                        large
                        pressOnEnter
                        text={translate('common.save')}
                        onPress={submit}
                        style={styles.m5}
                    />
                </FullPageOfflineBlockingView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceEditCardLimitTypePage.displayName = 'WorkspaceEditCardLimitTypePage';

export default WorkspaceEditCardLimitTypePage;
