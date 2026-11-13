import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {updateDraftMerchantRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import type {ValueOf} from 'type-fest';

import React from 'react';
import {View} from 'react-native';

import useMerchantRuleRoute from './useMerchantRuleRoute';

type AddDateMatchTypePageProps = PlatformStackScreenProps<
    SettingsNavigatorParamList,
    typeof SCREENS.WORKSPACE.RULES_DATE_MATCH_TYPE | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_DATE_MATCH_TYPE
>;

type DateMatchTypeItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
};

function AddDateMatchTypePage({route}: AddDateMatchTypePageProps) {
    const {policyID, ruleID} = route.params;
    // Sits above date-to-match, not the rule page, so each flow names it: the callout by dropping this suffix,
    // settings by the route passed here.
    const {backToRoute} = useMerchantRuleRoute(
        DYNAMIC_ROUTES.RULES_DATE_MATCH_TYPE_FROM_EXPENSE.path,
        policyID,
        ruleID,
        ROUTES.RULES_DATE_TO_MATCH.getRoute(policyID, ruleID !== ROUTES.NEW ? ruleID : undefined),
    );
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const selectedValue = form?.dateMatchType ?? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO;

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const items: DateMatchTypeItem[] = [
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            text: translate('workspace.rules.merchantRules.dateMatchTypeOn'),
            isSelected: selectedValue === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        },
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN,
            text: translate('workspace.rules.merchantRules.dateMatchTypeAfter'),
            isSelected: selectedValue === CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN,
        },
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN,
            text: translate('workspace.rules.merchantRules.dateMatchTypeBefore'),
            isSelected: selectedValue === CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN,
        },
    ];

    const onSelectItem = (item: DateMatchTypeItem) => {
        updateDraftMerchantRule({dateMatchType: item.value});
        goBack();
    };

    return (
        <ScreenWrapper
            testID="AddDateMatchTypePage"
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={translate('workspace.rules.merchantRules.matchType')}
                onBackButtonPress={goBack}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    data={items}
                    ListItem={SingleSelectListItem}
                    onSelectRow={onSelectItem}
                />
            </View>
        </ScreenWrapper>
    );
}

export default AddDateMatchTypePage;
