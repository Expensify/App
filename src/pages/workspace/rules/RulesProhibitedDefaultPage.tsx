import Button from '@components/ButtonComposed';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Switch from '@components/Switch';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';

import {setPolicyProhibitedExpense, setPolicyProhibitedExpenses} from '@userActions/Policy/Policy';

import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {ProhibitedExpenses} from '@src/types/onyx/Policy';

import type {ValueOf} from 'type-fest';

import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';

type ProhibitedExpensesProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_PROHIBITED_DEFAULT>;

type ProhibitedExpenseKey = ValueOf<typeof CONST.POLICY.PROHIBITED_EXPENSES>;

const PROHIBITED_EXPENSE_KEYS = Object.values(CONST.POLICY.PROHIBITED_EXPENSES);

function getProhibitedExpensesState(prohibitedExpenses?: ProhibitedExpenses): Record<ProhibitedExpenseKey, boolean> {
    const state: Record<ProhibitedExpenseKey, boolean> = {...CONST.POLICY.DEFAULT_PROHIBITED_EXPENSES};

    for (const key of PROHIBITED_EXPENSE_KEYS) {
        state[key] = prohibitedExpenses?.[key] ?? false;
    }

    return state;
}

function buildProhibitedExpensesToSave(draftProhibitedExpenses: Record<ProhibitedExpenseKey, boolean>): ProhibitedExpenses {
    const prohibitedExpensesToSave: ProhibitedExpenses = {...CONST.POLICY.DEFAULT_PROHIBITED_EXPENSES};

    for (const key of PROHIBITED_EXPENSE_KEYS) {
        prohibitedExpensesToSave[key] = draftProhibitedExpenses[key];
    }

    return prohibitedExpensesToSave;
}

function RulesProhibitedDefaultPage({
    route: {
        params: {policyID},
    },
}: ProhibitedExpensesProps) {
    const policy = usePolicy(policyID);

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {isBetaEnabled} = usePermissions();
    const isRevamp = isBetaEnabled(CONST.BETAS.RULES_REVAMP);

    const initialProhibitedExpenses = useMemo(() => getProhibitedExpensesState(policy?.prohibitedExpenses), [policy?.prohibitedExpenses]);
    const [draftProhibitedExpenses, setDraftProhibitedExpenses] = useState(initialProhibitedExpenses);
    const syncedPolicyIDRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        syncedPolicyIDRef.current = undefined;
    }, [policyID]);

    useEffect(() => {
        if (!policy?.id || policy.isLoading || syncedPolicyIDRef.current === policy.id) {
            return;
        }

        syncedPolicyIDRef.current = policy.id;
        setDraftProhibitedExpenses(getProhibitedExpensesState(policy.prohibitedExpenses));
    }, [policy?.id, policy?.isLoading, policy?.prohibitedExpenses]);

    const hasChanges = useMemo(
        () => PROHIBITED_EXPENSE_KEYS.some((key) => draftProhibitedExpenses[key] !== initialProhibitedExpenses[key]),
        [draftProhibitedExpenses, initialProhibitedExpenses],
    );

    const handleSave = useCallback(() => {
        if (!hasChanges) {
            Navigation.goBack();
            return;
        }

        const prohibitedExpensesToSave = buildProhibitedExpensesToSave(draftProhibitedExpenses);

        setPolicyProhibitedExpenses(policyID, prohibitedExpensesToSave, policy?.prohibitedExpenses);
        Navigation.setNavigationActionToMicrotaskQueue(Navigation.goBack);
    }, [draftProhibitedExpenses, hasChanges, policy?.prohibitedExpenses, policyID]);

    const handleToggle = useCallback((prohibitedExpense: ProhibitedExpenseKey) => {
        setDraftProhibitedExpenses((previousProhibitedExpenses) => ({
            ...previousProhibitedExpenses,
            [prohibitedExpense]: !previousProhibitedExpenses[prohibitedExpense],
        }));
    }, []);

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="RulesProhibitedDefaultPage"
            >
                <HeaderWithBackButton
                    title={translate(isRevamp ? 'workspace.rules.generalTab.flagReceiptLineItems' : 'workspace.rules.individualExpenseRules.prohibitedExpenses')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <ScrollView
                    style={isRevamp ? [styles.flexGrow1] : undefined}
                    contentContainerStyle={isRevamp ? [styles.ph5, styles.pb5] : undefined}
                    addBottomSafeAreaPadding
                >
                    <Text style={[styles.flexRow, styles.alignItemsCenter, styles.mt3, isRevamp ? undefined : styles.mh5, styles.mb5]}>
                        <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.individualExpenseRules.prohibitedDefaultDescription')}</Text>
                    </Text>

                    {PROHIBITED_EXPENSE_KEYS.map((prohibitedExpense) => {
                        const switchComponent = (
                            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.mt3, isRevamp ? undefined : styles.mh5, styles.mb5]}>
                                <Text
                                    style={[styles.flex1, styles.mr2]}
                                    accessible={false}
                                    aria-hidden
                                >
                                    {translate(`workspace.rules.individualExpenseRules.${prohibitedExpense}`)}
                                </Text>
                                <Switch
                                    isOn={isRevamp ? draftProhibitedExpenses[prohibitedExpense] : (policy?.prohibitedExpenses?.[prohibitedExpense] ?? false)}
                                    accessibilityLabel={translate(`workspace.rules.individualExpenseRules.${prohibitedExpense}`)}
                                    onToggle={() => {
                                        if (isRevamp) {
                                            handleToggle(prohibitedExpense);
                                            return;
                                        }
                                        setPolicyProhibitedExpense(policyID, prohibitedExpense, policy?.prohibitedExpenses);
                                    }}
                                />
                            </View>
                        );

                        return (
                            <OfflineWithFeedback
                                pendingAction={policy?.prohibitedExpenses?.pendingFields?.[prohibitedExpense]}
                                key={prohibitedExpense}
                            >
                                {switchComponent}
                            </OfflineWithFeedback>
                        );
                    })}
                </ScrollView>
                {isRevamp && (
                    <FixedFooter
                        addBottomSafeAreaPadding
                        addOfflineIndicatorBottomSafeAreaPadding
                    >
                        <Button
                            variant={CONST.BUTTON_VARIANT.SUCCESS}
                            size={CONST.BUTTON_SIZE.LARGE}
                            onPress={handleSave}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.RULES.FLAG_RECEIPT_LINE_ITEMS_SAVE}
                        >
                            <Button.Text>{translate('common.save')}</Button.Text>
                        </Button>
                    </FixedFooter>
                )}
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default RulesProhibitedDefaultPage;
