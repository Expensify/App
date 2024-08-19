import type {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type RulesBillableDefaultPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_BILLABLE_DEFAULT>;

function RulesBillableDefaultPage({route}: RulesBillableDefaultPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(route.params.policyID);
    const [defaultBillable, setDefaultBillable] = useState(policy?.defaultBillable ?? false);

    const billableModes = [
        {
            value: true,
            text: translate(`workspace.rules.individualExpenseRules.billable`),
            alternateText: translate(`workspace.rules.individualExpenseRules.billableDescription`),
            keyForList: 'billable',
            isSelected: defaultBillable,
        },
        {
            value: false,
            text: translate(`workspace.rules.individualExpenseRules.nonBillable`),
            alternateText: translate(`workspace.rules.individualExpenseRules.nonBillableDescription`),
            keyForList: 'nonBillable',
            isSelected: !defaultBillable,
        },
    ];

    const handleOnSubmit = () => {
        Policy.setPolicyBillableMode(route.params.policyID, defaultBillable);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID ?? '-1'}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                shouldEnableMaxHeight
                testID={RulesBillableDefaultPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.individualExpenseRules.billableDefault')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <Text style={[styles.mh5, styles.mv3]}>{translate('workspace.rules.individualExpenseRules.billableDefaultDescription')}</Text>
                <SelectionList
                    sections={[{data: billableModes}]}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => setDefaultBillable(item.value)}
                    shouldSingleExecuteRowSelect
                />
                <FormAlertWithSubmitButton
                    buttonText={translate('common.save')}
                    containerStyles={[styles.m4, styles.mb5]}
                    onSubmit={handleOnSubmit}
                    enabledWhenOffline
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

RulesBillableDefaultPage.displayName = 'RulesBillableDefaultPage';

export default RulesBillableDefaultPage;
