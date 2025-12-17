import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import Text from '@components/Text';
import useDefaultFundID from '@hooks/useDefaultFundID';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateSettlementFrequency as updateSettlementFrequencyUtil} from '@libs/actions/Card';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type WorkspaceSettlementFrequencyPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.EXPENSIFY_CARD_SETTINGS_FREQUENCY>;

function WorkspaceSettlementFrequencyPage({route}: WorkspaceSettlementFrequencyPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policyID = route.params?.policyID;
    const defaultFundID = useDefaultFundID(policyID);

    const [cardSettings] = useOnyx(`${ONYXKEYS.COLLECTION.PRIVATE_EXPENSIFY_CARD_SETTINGS}${defaultFundID}`, {canBeMissing: true});

    const shouldShowMonthlyOption = cardSettings?.isMonthlySettlementAllowed ?? false;
    const selectedFrequency = cardSettings?.monthlySettlementDate ? CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.MONTHLY : CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;
    const isSettlementFrequencyBlocked = !shouldShowMonthlyOption && selectedFrequency === CONST.EXPENSIFY_CARD.FREQUENCY_SETTING.DAILY;

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
        updateSettlementFrequencyUtil(defaultFundID, value, cardSettings?.monthlySettlementDate);
    };

    return (
        <AccessOrNotFoundWrapper
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyID={policyID}
            shouldBeBlocked={isSettlementFrequencyBlocked}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_EXPENSIFY_CARDS_ENABLED}
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
                    ListItem={RadioListItem}
                    onSelectRow={({value}) => updateSettlementFrequency(value)}
                    initiallyFocusedItemKey={selectedFrequency}
                    shouldUpdateFocusedIndex
                    shouldSingleExecuteRowSelect
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default WorkspaceSettlementFrequencyPage;
