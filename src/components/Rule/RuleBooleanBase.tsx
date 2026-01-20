import React from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftRule} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {InputID} from '@src/types/form/ExpenseRuleForm';
import RuleNotFoundPageWrapper from './RuleNotFoundPageWrapper';

type BooleanFilterItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.BOOLEAN>;
};

type RuleBooleanBasePageProps = {
    /** The key from boolean-based InputID */
    fieldID: InputID;

    /** The translation key for the page title */
    titleKey: TranslationPaths;

    /** The rule identifier */
    hash?: string;
};

const booleanValues = Object.values(CONST.SEARCH.BOOLEAN);

function RuleBooleanBasePage({fieldID, titleKey, hash}: RuleBooleanBasePageProps) {
    const {translate} = useLocalize();
    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM, {canBeMissing: true});
    const styles = useThemeStyles();

    const selectedItem =
        booleanValues.find((value) => {
            if (!form?.[fieldID]) {
                return false;
            }
            const booleanValue = form[fieldID] === 'true' ? CONST.SEARCH.BOOLEAN.YES : CONST.SEARCH.BOOLEAN.NO;
            return booleanValue === value;
        }) ?? null;

    const items = booleanValues.map((value) => ({
        value,
        keyForList: value,
        text: translate(`common.${value}`),
        isSelected: selectedItem === value,
    }));

    const goBack = () => {
        Navigation.goBack(hash ? ROUTES.SETTINGS_RULES_EDIT.getRoute(hash) : ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

    const onSelectItem = (selectedValue: BooleanFilterItem) => {
        const newValue = selectedValue.isSelected ? null : selectedValue.value;
        let value = '';
        if (newValue === CONST.SEARCH.BOOLEAN.YES) {
            value = 'true';
        } else if (newValue === CONST.SEARCH.BOOLEAN.NO) {
            value = 'false';
        }
        updateDraftRule({[fieldID]: value});
        goBack();
    };

    return (
        <RuleNotFoundPageWrapper hash={hash}>
            <ScreenWrapper
                testID="RuleBooleanBasePage"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate(titleKey)}
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
        </RuleNotFoundPageWrapper>
    );
}

export default RuleBooleanBasePage;
