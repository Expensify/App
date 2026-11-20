import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrencyForExpensifyCard from '@hooks/useCurrencyForExpensifyCard';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateSettlementFrequency as updateSettlementFrequencyUtil} from '@libs/actions/Card';
import {getCardProgramKey, getCardSettings, getQueuedExpensifyCardSettlement} from '@libs/CardUtils';
import Log from '@libs/Log';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';

type WorkspaceSettlementFrequencyPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY>;

function WorkspaceSettlementFrequencyPage({route}: WorkspaceSettlementFrequencyPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const defaultFundID = useDefaultFundID(policyID);

    const {showConfirmModal} = useConfirmModal();
    const {convertToDisplayString} = useCurrencyListActions();
    const currency = useCurrencyForExpensifyCard({policyID, fundID: defaultFundID});

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`);
    const [cardManualBilling] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_MANUAL_BILLING}${defaultFundID}`);
    const queuedSettlement = getQueuedExpensifyCardSettlement(cardManualBilling);
    const programKey = getCardProgramKey(cardSettings);
    const settings = getCardSettings(cardSettings, programKey);

    const shouldShowMonthlyOption = settings?.isMonthlySettlementAllowed ?? false;
    const selectedFrequency = settings?.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    const isSettlementFrequencyBlocked = !shouldShowMonthlyOption && selectedFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;

    const [selectedFrequencyDraft, setSelectedFrequencyDraft] = useState<ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>>();
    const currentFrequency = selectedFrequencyDraft ?? selectedFrequency;

    const options = [];
    options.push({
        value: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
        text: translate('workspace.expensifyCard.frequency.daily'),
        keyForList: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
        isSelected: currentFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
    });
    if (shouldShowMonthlyOption) {
        options.push({
            value: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
            text: translate('workspace.expensifyCard.frequency.monthly'),
            keyForList: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
            isSelected: currentFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
        });
    }
    const data = options;

    const updateSettlementFrequency = (value: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>) => {
        setSelectedFrequencyDraft(value);
    };

    const saveSettlementFrequency = () => {
        if (!programKey) {
            Log.alert('[WorkspaceSettlementFrequencyPage] saveSettlementFrequency called without a detected card program key');
            return;
        }
        updateSettlementFrequencyUtil(defaultFundID, programKey, currentFrequency, settings?.monthlySettlementDate);
        Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID));
    };

    const confirmSettlementFrequency = () => {
        // Daily settlement has no notion of a partial amount, so a queued partial settlement turns into a full one on the next run
        const isSwitchingToDailyWithQueuedPartialSettlement =
            currentFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY && selectedFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY && queuedSettlement.isPartial;
        if (!isSwitchingToDailyWithQueuedPartialSettlement) {
            saveSettlementFrequency();
            return;
        }
        showConfirmModal({
            title: translate('workspace.expensifyCard.settlementFrequencyPartialWarningTitle'),
            prompt: translate('workspace.expensifyCard.settlementFrequencyPartialWarningPrompt', convertToDisplayString(queuedSettlement.amount, currency)),
            confirmText: translate('common.save'),
            cancelText: translate('common.cancel'),
            buttonVariant: CONST.BUTTON_VARIANT.DANGER,
            shouldEnableNewFocusManagement: true,
        }).then(({action}) => {
            if (action !== ModalActions.CONFIRM) {
                return;
            }
            saveSettlementFrequency();
        });
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: confirmSettlementFrequency,
        isDisabled: currentFrequency === selectedFrequency,
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={isSettlementFrequencyBlocked && !selectedFrequencyDraft}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.EXPENSIFY_CARD}
            policyFeatureAccess={CONST.POLICY.POLICY_FEATURE_ACCESS.WRITE}
        >
            <ScreenWrapper
                testID="WorkspaceSettlementFrequencyPage"
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.expensifyCard.settlementFrequency')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID))}
                />
                <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementFrequencyDescription')}</Text>
                <SelectionList
                    data={data}
                    ListItem={SingleSelectListItem}
                    onSelectRow={({value}) => updateSettlementFrequency(value)}
                    initiallyFocusedItemKey={selectedFrequency}
                    confirmButtonOptions={confirmButtonOptions}
                    shouldUpdateFocusedIndex
                    shouldSingleExecuteRowSelect
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceSettlementFrequencyPage;
