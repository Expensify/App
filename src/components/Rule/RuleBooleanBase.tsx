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

    /** Callback when a value is selected */
    onSelect: (fieldID: string, value: boolean | undefined) => void;

    /** Callback to go back */
    onBack: () => void;

    /** Optional hash for rule not found validation */
    hash?: string;
};

const booleanValues = Object.values(CONST.SEARCH.BOOLEAN);

function RuleBooleanBase({fieldID, titleKey, formID, onSelect, onBack, hash}: RuleBooleanBaseProps) {
    const {translate} = useLocalize();
    const [form] = useOnyx(formID, {canBeMissing: true});
    const styles = useThemeStyles();

    const formValue = (form as Record<string, boolean | undefined>)?.[fieldID];

    let selectedItem = null;
    if (formValue !== undefined) {
        const booleanValue = formValue ? CONST.SEARCH.BOOLEAN.YES : CONST.SEARCH.BOOLEAN.NO;
        selectedItem = booleanValues.find((value) => booleanValue === value) ?? null;
    }

    const items = booleanValues.map((value) => ({
        value,
        keyForList: value,
        text: translate(`common.${value}`),
        isSelected: selectedItem === value,
    }));

    const onSelectItem = (selectedValue: BooleanFilterItem) => {
        const newValue = selectedValue.isSelected ? undefined : selectedValue.value;
        let value: boolean | undefined;
        if (newValue === CONST.SEARCH.BOOLEAN.YES) {
            value = true;
        } else if (newValue === CONST.SEARCH.BOOLEAN.NO) {
            value = false;
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
