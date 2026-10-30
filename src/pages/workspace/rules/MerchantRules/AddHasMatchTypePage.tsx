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

type AddHasMatchTypePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.RULES_HAS_MATCH_TYPE | typeof SCREENS.WORKSPACE.DYNAMIC_RULES_HAS_MATCH_TYPE>;

type HasMatchTypeItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.SYNTAX_OPERATORS>;
};

function AddHasMatchTypePage({route}: AddHasMatchTypePageProps) {
    const {policyID, ruleID} = route.params;
    // Sits above has-to-match, not the rule page, so each flow names it: the callout by dropping this suffix,
    // settings by the route passed here.
    const {backToRoute} = useMerchantRuleRoute(
        DYNAMIC_ROUTES.RULES_HAS_MATCH_TYPE_FROM_EXPENSE.path,
        policyID,
        ruleID,
        ROUTES.RULES_HAS_TO_MATCH.getRoute(policyID, ruleID !== ROUTES.NEW ? ruleID : undefined),
    );
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const selectedValue = form?.hasMatchType ?? CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO;

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const items: HasMatchTypeItem[] = [
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
            text: translate('search.filters.filterType.has.positive'),
            isSelected: selectedValue === CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
        },
        {
            value: CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO,
            keyForList: CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO,
            text: translate('search.filters.filterType.has.negative'),
            isSelected: selectedValue === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO,
        },
    ];

    const onSelectItem = (item: HasMatchTypeItem) => {
        updateDraftMerchantRule({hasMatchType: item.value});
        goBack();
    };

    return (
        <ScreenWrapper
            testID="AddHasMatchTypePage"
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButtonAndTitle
                title={translate('search.filters.filterType.label')}
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

export default AddHasMatchTypePage;
