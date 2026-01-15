import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import FixedFooter from '@components/FixedFooter';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SearchFilterPageFooterButtons from '@components/Search/SearchFilterPageFooterButtons';
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

type BooleanFilterItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.BOOLEAN>;
};

type RuleBooleanBasePageProps = {
    /** The key from boolean-based InputID */
    fieldID: InputID;

    /** The translation key for the page title */
    titleKey: TranslationPaths;
};

const booleanValues = Object.values(CONST.SEARCH.BOOLEAN);

function RuleBooleanBasePage({fieldID, titleKey}: RuleBooleanBasePageProps) {
    const {translate} = useLocalize();
    const [form] = useOnyx(ONYXKEYS.FORMS.EXPENSE_RULE_FORM, {canBeMissing: true});
    const styles = useThemeStyles();

    const [selectedItem, setSelectedItem] = useState(() => {
        return (
            booleanValues.find((value) => {
                if (!form?.[fieldID]) {
                    return false;
                }
                const booleanValue = form[fieldID] === 'true' ? CONST.SEARCH.BOOLEAN.YES : CONST.SEARCH.BOOLEAN.NO;
                return booleanValue === value;
            }) ?? null
        );
    });

    const items = useMemo(() => {
        return booleanValues.map((value) => ({
            value,
            keyForList: value,
            text: translate(`common.${value}`),
            isSelected: selectedItem === value,
        }));
    }, [selectedItem, translate]);

    const onSelectItem = useCallback((selectedValue: BooleanFilterItem) => {
        const newValue = selectedValue.isSelected ? null : selectedValue.value;
        setSelectedItem(newValue);
    }, []);

    const applyChanges = () => {
        updateDraftRule({[fieldID]: selectedItem === CONST.SEARCH.BOOLEAN.YES ? 'true' : 'false'});
        Navigation.goBack(ROUTES.SETTINGS_RULES_ADD.getRoute());
    };

    return (
        <ScreenWrapper
            testID="RuleBooleanBasePage"
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={translate(titleKey)}
                onBackButtonPress={() => {
                    Navigation.goBack(ROUTES.SETTINGS_RULES_ADD.getRoute());
                }}
            />
            <View style={[styles.flex1]}>
                <SelectionList
                    shouldSingleExecuteRowSelect
                    data={items}
                    ListItem={SingleSelectListItem}
                    onSelectRow={onSelectItem}
                />
            </View>
            <FixedFooter style={styles.mtAuto}>
                <SearchFilterPageFooterButtons applyChanges={applyChanges} />
            </FixedFooter>
        </ScreenWrapper>
    );
}

export default RuleBooleanBasePage;
