import React, {useMemo} from 'react';
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
    onSelect: (fieldID: string, value: string) => void;

    /** Callback to go back */
    onBack: () => void;

    /** Optional wrapper component for the content */
    ContentWrapper?: React.ComponentType<{children: React.ReactNode}>;
};

const booleanValues = Object.values(CONST.SEARCH.BOOLEAN);

function RuleBooleanBase({fieldID, titleKey, formID, onSelect, onBack, ContentWrapper}: RuleBooleanBaseProps) {
    const {translate} = useLocalize();
    const [form] = useOnyx(formID, {canBeMissing: true});
    const styles = useThemeStyles();

    const formValue = (form as Record<string, unknown>)?.[fieldID];

    const selectedItem = useMemo(() => {
        if (!formValue) {
            return null;
        }
        const yesValue = CONST.SEARCH.BOOLEAN.YES;
        const noValue = CONST.SEARCH.BOOLEAN.NO;
        const booleanValue = formValue === 'true' ? yesValue : noValue;

        return booleanValues.find((value) => booleanValue === value) ?? null;
    }, [formValue]);

    const items = booleanValues.map((value) => ({
        value,
        keyForList: value,
        text: translate(`common.${value}`),
        isSelected: selectedItem === value,
    }));

    const onSelectItem = (selectedValue: BooleanFilterItem) => {
        const newValue = selectedValue.isSelected ? null : selectedValue.value;
        let value = '';
        if (newValue === CONST.SEARCH.BOOLEAN.YES) {
            value = 'true';
        } else if (newValue === CONST.SEARCH.BOOLEAN.NO) {
            value = 'false';
        }
        onSelect(fieldID, value);
    };

    const content = (
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
    );

    if (ContentWrapper) {
        return <ContentWrapper>{content}</ContentWrapper>;
    }

    return content;
}

export default RuleBooleanBase;
