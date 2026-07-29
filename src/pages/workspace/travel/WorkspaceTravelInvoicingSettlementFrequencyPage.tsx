import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';

import {updateTravelInvoiceSettlementFrequency} from '@libs/actions/TravelInvoicing';
import {getCardSettings} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getTravelInvoicingCardSettingsKey, getTravelSettlementFrequency} from '@libs/TravelInvoicingUtils';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import {isEmptyValueObject} from '@src/types/utils/EmptyObject';

import type {ValueOf} from 'type-fest';

import React, {useState} from 'react';

type WorkspaceTravelInvoicingSettlementFrequencyPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_SETTINGS_FREQUENCY>;

type FrequencyItem = ListItem & {
    value: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>;
};

function WorkspaceTravelInvoicingSettlementFrequencyPage({route}: WorkspaceTravelInvoicingSettlementFrequencyPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardSettings] = useOnyx(getTravelInvoicingCardSettingsKey(workspaceAccountID));
    const travelSettings = getCardSettings(cardSettings, CONST.TRAVEL.PROGRAM_TRAVEL_US);

    const currentFrequency = getTravelSettlementFrequency(travelSettings);
    const frequencies = [CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY, CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY];

    const monthlySettlementDateError = getLatestErrorField(travelSettings, CONST.TRAVEL.MONTHLY_SETTLEMENT_DATE);
    const hasFrequencyError = !isEmptyValueObject(monthlySettlementDateError);

    const [draftFrequency, setDraftFrequency] = useState<ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>>();
    const selectedFrequency = draftFrequency ?? frequencies.find((frequency) => frequency === currentFrequency);

    function getSettlementFrequencyLabel(frequency: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>) {
        if (frequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY) {
            return translate('workspace.common.frequency.monthly');
        }
        if (frequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY) {
            return translate('workspace.common.frequency.immediate');
        }
    }

    const data = frequencies?.map((frequency) => ({
        text: getSettlementFrequencyLabel(frequency),
        value: frequency,
        keyForList: frequency,
        isSelected: frequency === selectedFrequency,
    }));

    const monthlySettlementDate = travelSettings?.monthlySettlementDate;
    const saveAndGoBack = () => {
        if (selectedFrequency && (selectedFrequency !== currentFrequency || hasFrequencyError)) {
            updateTravelInvoiceSettlementFrequency(workspaceAccountID, selectedFrequency, monthlySettlementDate ? new Date(monthlySettlementDate) : undefined);
        }
        Navigation.goBack();
    };

    const confirmButtonOptions = {
        showButton: true,
        text: translate('common.save'),
        onConfirm: saveAndGoBack,
        isDisabled: selectedFrequency === currentFrequency && !hasFrequencyError,
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID="WorkspaceTravelInvoicingSettlementFrequencyPage"
        >
            <HeaderWithBackButton
                title={translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.settlementFrequencyLabel')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <SelectionList<FrequencyItem>
                data={data}
                onSelectRow={(item) => setDraftFrequency(item.value)}
                confirmButtonOptions={confirmButtonOptions}
                addBottomSafeAreaPadding
                ListItem={SingleSelectListItem}
                initiallyFocusedItemKey={currentFrequency}
                customListHeaderContent={
                    <Text style={[styles.mh5, styles.mv3]}>
                        {translate('workspace.moreFeatures.travel.travelInvoicing.travelInvoicingSection.subsections.settlementFrequencyDescription')}
                    </Text>
                }
            />
        </ScreenWrapper>
    );
}

export default WorkspaceTravelInvoicingSettlementFrequencyPage;
