import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import AdminPolicyAccessOrNotFoundWrapper from '@pages/workspace/AdminPolicyAccessOrNotFoundWrapper';
import FeatureEnabledAccessOrNotFoundWrapper from '@pages/workspace/FeatureEnabledAccessOrNotFoundWrapper';
import PaidPolicyAccessOrNotFoundWrapper from '@pages/workspace/PaidPolicyAccessOrNotFoundWrapper';
import withPolicy from '@pages/workspace/withPolicy';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import CONST from '@src/CONST';

type CustomSelectorTypes = ValueOf<typeof CONST.QBO_SELECTOR_OPTIONS>;

type SelectorType = ListItem & {
    value: CustomSelectorTypes;
};

function QuickbooksAccountSelectPage({policy}: WithPolicyProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [selectedAccount, setSelectedAccount] = useState<CustomSelectorTypes>(CONST.QBO_SELECTOR_OPTIONS.CROISSANT_CO_PAYROLL_ACCOUNT);

    const policyID = policy?.id ?? '';

    const qboOnlineSelectorOptions = useMemo<SelectorType[]>(
        () =>
            Object.entries(CONST.QBO_SELECTOR_OPTIONS).map(([key, value]) => ({
                value,
                text: translate(`workspace.qbo.advancedConfig.croissantCo.${value}`),
                keyForList: key,
                isSelected: selectedAccount === value,
            })),
        [selectedAccount, translate],
    );
    const listHeaderComponent = useMemo(
        () => (
            <View style={[styles.pb2, styles.ph5]}>
                <Text style={[styles.pb5, styles.textNormal]}>{translate('workspace.qbo.advancedConfig.invoiceAccountSelectDescription')}</Text>
            </View>
        ),
        [translate, styles.pb2, styles.ph5, styles.pb5, styles.textNormal],
    );

    const initiallyFocusedOptionKey = useMemo(() => qboOnlineSelectorOptions.find((mode) => mode.isSelected)?.keyForList, [qboOnlineSelectorOptions]);

    const updateMode = useCallback((mode: SelectorType) => {
        // TODO add API call for change
        setSelectedAccount(mode.value);
    }, []);

    return (
        <AdminPolicyAccessOrNotFoundWrapper policyID={policyID}>
            <PaidPolicyAccessOrNotFoundWrapper policyID={policyID}>
                <FeatureEnabledAccessOrNotFoundWrapper
                    policyID={policyID}
                    featureName={CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED}
                >
                    <ScreenWrapper
                        includeSafeAreaPaddingBottom={false}
                        testID={QuickbooksAccountSelectPage.displayName}
                    >
                        <HeaderWithBackButton title={translate('workspace.qbo.advancedConfig.qboAccount')} />

                        <SelectionList
                            sections={[{data: qboOnlineSelectorOptions}]}
                            ListItem={RadioListItem}
                            headerContent={listHeaderComponent}
                            onSelectRow={updateMode}
                            initiallyFocusedOptionKey={initiallyFocusedOptionKey}
                        />
                    </ScreenWrapper>
                </FeatureEnabledAccessOrNotFoundWrapper>
            </PaidPolicyAccessOrNotFoundWrapper>
        </AdminPolicyAccessOrNotFoundWrapper>
    );
}

QuickbooksAccountSelectPage.displayName = 'QuickbooksAccountSelectPage';

export default withPolicy(QuickbooksAccountSelectPage);
