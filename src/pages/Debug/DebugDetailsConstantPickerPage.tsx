import type {StackScreenProps} from '@react-navigation/stack';
import isObject from 'lodash/isObject';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import type {DebugParamList} from '@libs/Navigation/types';
import {appendParam} from '@libs/Url';
import type SCREENS from '@src/SCREENS';
import {DETAILS_CONSTANT_OPTIONS} from './const';

type DebugDetailsConstantPickerPageProps = StackScreenProps<DebugParamList, typeof SCREENS.DEBUG.DETAILS_CONSTANT_PICKER_PAGE>;

function DebugDetailsConstantPickerPage({
    route: {
        params: {fieldName, fieldValue, backTo = ''},
    },
    navigation,
}: DebugDetailsConstantPickerPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [searchValue, setSearchValue] = useState('');
    const sections: ListItem[] = useMemo(
        () =>
            Object.entries(DETAILS_CONSTANT_OPTIONS[fieldName as keyof typeof DETAILS_CONSTANT_OPTIONS])
                .reduce((acc: Array<[string, string]>, [key, value]) => {
                    // Option has multiple constants, so we need to flatten these into separate options
                    if (isObject(value)) {
                        acc.push(...Object.entries(value));
                        return acc;
                    }
                    acc.push([key, value as string]);
                    return acc;
                }, [])
                .map(
                    ([key, value]) =>
                        ({
                            text: value,
                            keyForList: key,
                            isSelected: value === fieldValue,
                            searchText: value,
                        } satisfies ListItem),
                )
                .filter(({searchText}) => searchText.toLowerCase().includes(searchValue.toLowerCase())),
        [fieldName, fieldValue, searchValue],
    );
    const onSubmit = (item: ListItem) => {
        const value = item.text === fieldValue ? '' : item.text ?? '';
        // Check the navigation state and "backTo" parameter to decide navigation behavior
        if (navigation.getState().routes.length === 1 && !backTo) {
            // If there is only one route and "backTo" is empty, go back in navigation
            Navigation.goBack();
        } else if (!!backTo && navigation.getState().routes.length === 1) {
            // If "backTo" is not empty and there is only one route, go back to the specific route defined in "backTo" with a country parameter
            Navigation.goBack(appendParam(backTo, fieldName, value));
        } else {
            // Otherwise, navigate to the specific route defined in "backTo" with a country parameter
            Navigation.navigate(appendParam(backTo, fieldName, value));
        }
    };
    const selectedOptionKey = useMemo(() => sections.filter((option) => option.searchText === fieldValue).at(0)?.keyForList, [sections, fieldValue]);

    return (
        <ScreenWrapper testID={DebugDetailsConstantPickerPage.displayName}>
            <HeaderWithBackButton title={fieldName} />
            <View style={styles.containerWithSpaceBetween}>
                <SelectionList
                    sections={[{data: sections}]}
                    textInputValue={searchValue}
                    textInputLabel={translate('common.search')}
                    onChangeText={setSearchValue}
                    onSelectRow={onSubmit}
                    ListItem={RadioListItem}
                    initiallyFocusedOptionKey={selectedOptionKey ?? undefined}
                    isRowMultilineSupported
                />
            </View>
        </ScreenWrapper>
    );
}

DebugDetailsConstantPickerPage.displayName = 'DebugDetailsConstantPickerPage';

export default DebugDetailsConstantPickerPage;
