import HeaderWithBackButtonAndTitle from '@components/Header/composed/HeaderWithBackButtonAndTitle';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';

import React from 'react';
import {View} from 'react-native';

import type {MatchTypeField, MatchTypeOperator} from './matchTypeOptions';

import {MATCH_TYPE_OPTIONS, getDefaultMatchType} from './matchTypeOptions';

type MatchTypeItem = ListItem & {
    value: MatchTypeOperator;
};

type MatchTypePageProps = {
    /** The form field the picked comparison is stored under, which also picks the comparisons on offer */
    field: MatchTypeField;

    /** Where saving or backing out returns to, which is the field's own page rather than the rule page */
    backToRoute: Route;

    testID: string;

    onSelect: (value: MatchTypeOperator) => void;
};

/** The comparison picker every match type row opens, which only differs by the field it is picking for. */
function MatchTypePage({field, backToRoute, testID, onSelect}: MatchTypePageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [form] = useOnyx(ONYXKEYS.FORMS.MERCHANT_RULE_FORM);

    const selectedValue = form?.[field] ?? getDefaultMatchType(field);

    const goBack = () => {
        Navigation.goBack(backToRoute);
    };

    const items: MatchTypeItem[] = MATCH_TYPE_OPTIONS[field].map(({value, translationKey}) => ({
        value,
        keyForList: value,
        text: translate(translationKey),
        isSelected: selectedValue === value,
    }));

    const onSelectItem = (item: MatchTypeItem) => {
        onSelect(item.value);
        goBack();
    };

    return (
        <ScreenWrapper
            testID={testID}
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

export default MatchTypePage;
