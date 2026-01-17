import React from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceAccountID from '@hooks/useWorkspaceAccountID';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import Navigation from '@libs/Navigation/Navigation';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import {getTravelSettlementFrequency, PROGRAM_TRAVEL_US} from '@libs/TravelInvoicingUtils';
import {updateTravelInvoiceSettlementFrequency} from '@libs/actions/TravelInvoicing';
import {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

type WorkspaceTravelSettlementFrequencyPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.TRAVEL_SETTINGS_FREQUENCY>;

type FrequencyItem = ListItem & {
    value: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>;
};

function WorkspaceTravelSettlementFrequencyPage({route}: WorkspaceTravelSettlementFrequencyPageProps) {
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const workspaceAccountID = useWorkspaceAccountID(policyID);
    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${workspaceAccountID}_${PROGRAM_TRAVEL_US}` as const);

    const currentFrequency = getTravelSettlementFrequency(cardSettings);
    const frequencies = [CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY, CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY];

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
        isSelected: frequency === currentFrequency,
    }));

    const selectFrequency = (item: FrequencyItem) => {
        updateTravelInvoiceSettlementFrequency(
            policyID,
            workspaceAccountID,
            item.value,
            cardSettings?.monthlySettlementDate instanceof Date ? cardSettings.monthlySettlementDate : undefined,
        );
        Navigation.goBack();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={WorkspaceTravelSettlementFrequencyPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('workspace.moreFeatures.travel.travelInvoicing.centralInvoicingSection.subsections.settlementFrequencyLabel')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <SelectionList<FrequencyItem>
                data={data}
                onSelectRow={selectFrequency}
                ListItem={RadioListItem}
                initiallyFocusedItemKey={currentFrequency}
            />
        </ScreenWrapper>
    );
}

WorkspaceTravelSettlementFrequencyPage.displayName = 'WorkspaceTravelSettlementFrequencyPage';

export default WorkspaceTravelSettlementFrequencyPage;
