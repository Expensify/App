import {useFocusEffect} from '@react-navigation/native';
import type {StackScreenProps} from '@react-navigation/stack';
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
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

// TODO: remove when Onyx data is available
const mockedCard = {
    accountID: 885646,
    availableSpend: 1000,
    totalSpend: -1000,
    unapprovedSpend: -1900,
    nameValuePairs: {
        cardTitle: 'Test 1',
        isVirtual: true,
        limit: 2000,
        limitType: CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED,
    },
    lastFourPAN: '1234',
};

type WorkspaceEditCardLimitTypePageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_LIMIT_TYPE>;

function WorkspaceEditCardLimitTypePage({route}: WorkspaceEditCardLimitTypePageProps) {
    const {policyID, cardID} = route.params;

    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [cards] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}${policyID}_${CONST.EXPENSIFY_CARD.BANK}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`);
    const card = cards?.[cardID] ?? mockedCard;
    const areApprovalsConfigured = !isEmptyObject(policy?.approver) && policy?.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    const defaultLimitType = areApprovalsConfigured ? CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART : CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY;
    const initialLimitType = card.nameValuePairs?.limitType ?? defaultLimitType;
    const promptTranslationKey =
        initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY
            ? 'workspace.expensifyCard.changeCardSmartLimitTypeWarning'
            : 'workspace.expensifyCard.changeCardMonthlyLimitTypeWarning';

    const [typeSelected, setTypeSelected] = useState(initialLimitType);
    const [isConfirmModalVisible, setIsConfirmModalVisible] = useState(false);

    const fetchCardLimitTypeData = useCallback(() => {
        Policy.openPolicyEditCardLimitTypePage(policyID, Number(cardID));
    }, [policyID, cardID]);

    useFocusEffect(fetchCardLimitTypeData);

    const updateCardLimitType = () => {
        // TODO: add API call when it's supported https://github.com/Expensify/Expensify/issues/407833
    };

    const submit = () => {
        let shouldShowConfirmModal = false;
        if (card.unapprovedSpend !== undefined && card.nameValuePairs?.limit) {
            // Spends are coming as negative numbers from the backend and we need to make it positive for the correct expression.
            const unapprovedSpend = Math.abs(card.unapprovedSpend);
            const isUnapprovedSpendOverLimit = unapprovedSpend >= card.nameValuePairs.limit;
            if (
                (initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY && typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART) ||
                (initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART && typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY) ||
                (initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.FIXED && typeSelected === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART)
            ) {
                if (isUnapprovedSpendOverLimit) {
                    shouldShowConfirmModal = true;
                }
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

        if (card.totalSpend && card.nameValuePairs?.limit) {
            const totalSpend = Math.abs(card.totalSpend);
            if ((initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.MONTHLY || initialLimitType === CONST.EXPENSIFY_CARD.LIMIT_TYPES.SMART) && totalSpend >= card.nameValuePairs?.limit) {
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
    }, [card.totalSpend, card.nameValuePairs?.limit, areApprovalsConfigured, translate, typeSelected, initialLimitType]);

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
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_DETAILS.getRoute(policyID, cardID))}
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
                        prompt={translate(promptTranslationKey, CurrencyUtils.convertToDisplayString(card.nameValuePairs?.limit, CONST.CURRENCY.USD))}
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
