import React, {useCallback, useEffect, useMemo, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {getCashExpenseReimbursableMode, setPolicyReimbursableMode} from '@libs/actions/Policy/Policy';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';

type RulesReimbursableDefaultPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_REIMBURSABLE_DEFAULT>;

function RulesReimbursableDefaultPage({
    route: {
        params: {policyID},
    },
}: RulesReimbursableDefaultPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    const reimbursableMode = getCashExpenseReimbursableMode(policy);
    const [selectedMode, setSelectedMode] = useState(reimbursableMode);

    // When the page renders before the policy is in Onyx, reimbursableMode is undefined. Sync the draft once it becomes
    // available, without overwriting a selection the user has already made.
    useEffect(() => {
        if (!reimbursableMode || selectedMode) {
            return;
        }
        setSelectedMode(reimbursableMode);
    }, [reimbursableMode, selectedMode]);

    const reimbursableModes = Object.values(CONST.POLICY.CASH_EXPENSE_REIMBURSEMENT_CHOICES).map((mode) => ({
        text: translate(`workspace.rules.individualExpenseRules.${mode}`),
        alternateText: translate(`workspace.rules.individualExpenseRules.${mode}Description`),
        value: mode,
        isSelected: selectedMode === mode,
        keyForList: mode,
    }));

    const saveAndGoBack = useCallback(() => {
        if (!selectedMode) {
            return;
        }
        setPolicyReimbursableMode(policyID, selectedMode, policy?.defaultReimbursable, policy?.disabledFields?.reimbursable);
        Navigation.goBack();
    }, [policyID, selectedMode, policy?.defaultReimbursable, policy?.disabledFields?.reimbursable]);

    const confirmButtonOptions = useMemo(
        () => ({
            showButton: true,
            text: translate('common.save'),
            onConfirm: saveAndGoBack,
        }),
        [saveAndGoBack, translate],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="RulesReimbursableDefaultPage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.individualExpenseRules.cashExpenseDefault')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, styles.mh5, styles.mb5]}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.cashExpenseDefaultDescription')}</Text>
                </Text>
                <SelectionList
                    data={reimbursableModes}
                    ListItem={SingleSelectListItem}
                    onSelectRow={(item) => {
                        setSelectedMode(item.value);
                    }}
                    confirmButtonOptions={confirmButtonOptions}
                    shouldSingleExecuteRowSelect
                    style={{containerStyle: styles.pt3}}
                    initiallyFocusedItemKey={reimbursableMode}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesReimbursableDefaultPage;
