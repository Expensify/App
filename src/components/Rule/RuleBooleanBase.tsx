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
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type {OnyxFormKey} from '@src/ONYXKEYS';
import RuleNotFoundPageWrapper from './RuleNotFoundPageWrapper';

type BooleanFilterItem = ListItem & {
    value: ValueOf<typeof CONST.SEARCH.BOOLEAN>;
};

type RuleBooleanBaseProps = {
    /** The field ID from the form */
    fieldID: string;

    /** The translation key for the page title */
    titleKey: TranslationPaths;

    /** The form ID to read from Onyx */
    formID: OnyxFormKey;

    /** Callback when a value is selected - receives boolean for merchant rules, string for personal rules */
    onSelect: (fieldID: string, value: boolean | 'true' | 'false' | null) => void;

    /** Callback to go back */
    onBack: () => void;

    /** Optional hash for rule not found validation */
    hash?: string;

    /** Whether to use string values ('true'/'false') instead of boolean values (for ExpenseRuleForm compatibility) */
    useStringValues?: boolean;
};

const booleanValues = Object.values(CONST.SEARCH.BOOLEAN);

function RuleBooleanBase({fieldID, titleKey, formID, onSelect, onBack, hash, useStringValues = false}: RuleBooleanBaseProps) {
    const {translate} = useLocalize();
    const [form] = useOnyx(formID, {canBeMissing: true});
    const styles = useThemeStyles();

    const formValue = (form as Record<string, boolean | string | undefined>)?.[fieldID];

    let selectedItem = null;
    if (formValue !== undefined) {
        // Handle both string ('true'/'false') and boolean (true/false) values
        const isTruthy = useStringValues ? formValue === 'true' : formValue === true;
        const booleanValue = isTruthy ? CONST.SEARCH.BOOLEAN.YES : CONST.SEARCH.BOOLEAN.NO;
        selectedItem = booleanValues.find((value) => booleanValue === value) ?? null;
    }

    const items = booleanValues.map((value) => ({
        value,
        keyForList: value,
        text: translate(`common.${value}`),
        isSelected: selectedItem === value,
    }));

    const onSelectItem = (selectedValue: BooleanFilterItem) => {
        // If clicking on already-selected item, unselect it (set to undefined)
        if (selectedValue.isSelected) {
            onSelect(fieldID, null);
            return;
        }
        const isYes = selectedValue.value === CONST.SEARCH.BOOLEAN.YES;
        let value: boolean | 'true' | 'false';
        if (useStringValues) {
            value = isYes ? 'true' : 'false';
        } else {
            value = isYes;
        }
        onSelect(fieldID, value);
    };

    return (
        <RuleNotFoundPageWrapper hash={hash}>
            <ScreenWrapper
                testID="RuleBooleanBase"
                shouldShowOfflineIndicatorInWideScreen
                offlineIndicatorStyle={styles.mtAuto}
                includeSafeAreaPaddingBottom
                shouldEnableMaxHeight
            >
                <HeaderWithBackButton
                    title={translate(titleKey)}
                    onBackButtonPress={onBack}
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

export default RuleBooleanBase;
