import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/ListItem/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type AddMatchTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_MERCHANT_MATCH_TYPE>;

function AddMatchTypePage({route}: AddMatchTypePageProps) {
    const {policyID, ruleID} = route.params;
    const {translate} = useLocalize();
    const isEditing = ruleID !== ROUTES.NEW;

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM, {canBeMissing: true});

    const currentMatchType = form?.matchType ?? CONST.MERCHANT_RULES.MATCH_TYPE.CONTAINS;

    const matchTypeOptions = [
        {
            value: CONST.MERCHANT_RULES.MATCH_TYPE.CONTAINS,
            text: translate('workspace.rules.merchantRules.matchTypeContains'),
            alternateText: translate('workspace.rules.merchantRules.matchTypeContainsDescription'),
            keyForList: CONST.MERCHANT_RULES.MATCH_TYPE.CONTAINS,
            isSelected: currentMatchType === CONST.MERCHANT_RULES.MATCH_TYPE.CONTAINS,
        },
        {
            value: CONST.MERCHANT_RULES.MATCH_TYPE.EXACT,
            text: translate('workspace.rules.merchantRules.matchTypeExact'),
            alternateText: translate('workspace.rules.merchantRules.matchTypeExactDescription'),
            keyForList: CONST.MERCHANT_RULES.MATCH_TYPE.EXACT,
            isSelected: currentMatchType === CONST.MERCHANT_RULES.MATCH_TYPE.EXACT,
        },
    ];

    const goBack = () => {
        const backRoute = isEditing
            ? ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID, ruleID)
            : ROUTES.RULES_MERCHANT_MERCHANT_TO_MATCH.getRoute(policyID);
        Navigation.goBack(backRoute);
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}
            accessVariants={[CONST.POLICY.ACCESS_VARIANTS.ADMIN, CONST.POLICY.ACCESS_VARIANTS.PAID]}
        >
            <ScreenWrapper
                enableEdgeToEdgeBottomSafeAreaPadding
                shouldEnableMaxHeight
                testID="AddMatchTypePage"
            >
                <HeaderWithBackButton
                    title={translate('workspace.rules.merchantRules.matchType')}
                    onBackButtonPress={goBack}
                />
                <SelectionList
                    data={matchTypeOptions}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => {
                        updateDraftMerchantRule({matchType: item.value});
                        Navigation.setNavigationActionToMicrotaskQueue(goBack);
                    }}
                    shouldSingleExecuteRowSelect
                    initiallyFocusedItemKey={currentMatchType}
                    addBottomSafeAreaPadding
                />
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

AddMatchTypePage.displayName = 'AddMatchTypePage';

export default AddMatchTypePage;
