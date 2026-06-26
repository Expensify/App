import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftFlagForReviewRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';

type FlagForReviewRuleExpenseLimitTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_FLAG_FOR_REVIEW_RULE_EXPENSE_LIMIT_TYPE>;

function FlagForReviewRuleExpenseLimitTypePage({route}: FlagForReviewRuleExpenseLimitTypePageProps) {
    const {policyID, ruleKey} = route.params;
    const isEditing = ruleKey !== ROUTES.NEW;
    const policy = usePolicy(policyID);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {canWrite: canWriteRules} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.RULES);
    const {isBetaEnabled} = usePermissions();
    const isRulesRevampEnabled = isBetaEnabled(CONST.BETAS.RULES_REVAMP);

    const [form] = useOnyx(ONYXKEYS.FORMS.FLAG_FOR_REVIEW_RULE_FORM);
    const currentExpenseLimitType = form?.expenseLimitType ?? CONST.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;

    const backToRoute = isEditing ? ROUTES.RULES_FLAG_FOR_REVIEW_RULE_EDIT.getRoute(policyID, ruleKey) : ROUTES.RULES_FLAG_FOR_REVIEW_RULE_NEW.getRoute(policyID);

    const expenseLimitTypes = Object.values(CONST.POLICY.EXPENSE_LIMIT_TYPES).map((value) => ({
        value,
        text: translate(`workspace.rules.categoryRules.expenseLimitTypes.${value}`),
        alternateText: translate(`workspace.rules.categoryRules.expenseLimitTypes.${value}Subtitle`),
        keyForList: value,
        isSelected: currentExpenseLimitType === value,
    }));

    const onSelectRow = (item: {value: PolicyCategoryExpenseLimitType}) => {
        updateDraftFlagForReviewRule({expenseLimitType: item.value});
        Navigation.goBack(backToRoute);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
            policyFeature={CONST.POLICY.POLICY_FEATURE.RULES}
            shouldBeBlocked={!isRulesRevampEnabled || !canWriteRules}
        >
            <ScreenWrapper
                style={styles.pb0}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="FlagForReviewRuleExpenseLimitTypePage"
            >
                <HeaderWithBackButton
                    title={translate('common.type')}
                    onBackButtonPress={() => Navigation.goBack(backToRoute)}
                />
                <SelectionList
                    data={expenseLimitTypes}
                    ListItem={SingleSelectListItem}
                    onSelectRow={onSelectRow}
                    shouldSingleExecuteRowSelect
                    style={{containerStyle: [styles.pt3]}}
                    initiallyFocusedItemKey={currentExpenseLimitType}
                    alternateNumberOfSupportedLines={3}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

export default FlagForReviewRuleExpenseLimitTypePage;
