import type {StackScreenProps} from '@react-navigation/stack';
import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Card from '@userActions/Card';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceSettlementFrequencyPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY>;

function WorkspaceSettlementFrequencyPage({route}: WorkspaceSettlementFrequencyPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID ?? '-1';

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.SHARED_NVP_PRIVATE_EXPENSIFY_CARD_SETTINGS}${policyID}`);

    // TODO: change true for false after API is ready - true is for testing purposes
    const shouldShowMonthlyOption = cardSettings?.isMonthlySettlementAllowed ?? true;
    const selectedFrequency = cardSettings?.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;

    const data = useMemo(() => {
        const options = [];

        options.push({
            value: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
            text: translate('workspace.expensifyCard.frequency.daily'),
            keyForList: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
            isSelected: selectedFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY,
        });

        if (shouldShowMonthlyOption) {
            options.push({
                value: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
                text: translate('workspace.expensifyCard.frequency.monthly'),
                keyForList: CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
                isSelected: selectedFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY,
            });
        }

        return options;
    }, [translate, shouldShowMonthlyOption, selectedFrequency]);

    const updateSettlementFrequency = (value: ValueOf<typeof CONST.EXPENSIFY_CARD.FREQUENCY_SETTING>) => {
        Card.updateSettlementFrequency(policyID, value);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
        >
            <ScreenWrapper
                testID={WorkspaceSettlementFrequencyPage.displayName}
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate('workspace.expensifyCard.settlementFrequency')}
                    onBackButtonPress={() => Navigation.goBack(ROUTES.WORKSPACE_EXPENSIFY_CARD_SETTINGS.getRoute(policyID))}
                />
                <Text style={[styles.mh5, styles.mv4]}>{translate('workspace.expensifyCard.settlementFrequencyDescription')}</Text>
                <SelectionList
                    sections={[{data}]}
                    ListItem={RadioListItem}
                    onSelectRow={({value}) => updateSettlementFrequency(value)}
                    shouldDebounceRowSelect
                    initiallyFocusedOptionKey={selectedFrequency}
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceSettlementFrequencyPage.displayName = 'WorkspaceSettlementFrequencyPage';

export default WorkspaceSettlementFrequencyPage;
