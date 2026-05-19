import React, {useMemo, useState} from 'react';
import {Keyboard} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import SingleSelectListItem from '@components/SelectionList/ListItem/SingleSelectListItem';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {setCalendarPickerSelectedYear} from '@libs/actions/CalendarPicker';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@navigation/types';
import CONST from '@src/CONST';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type CalendarPickerListItem from './types';

type DynamicYearSelectorPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DYNAMIC_YEAR_SELECTOR>;

function DynamicYearSelectorPage({route}: DynamicYearSelectorPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.YEAR_SELECTOR.path);

    const {contextID} = route.params;
    const currentYear = Number(route.params.currentYear) || new Date().getFullYear();
    const minYear = Number(route.params.minYear) || CONST.CALENDAR_PICKER.MIN_YEAR;
    const maxYear = Number(route.params.maxYear) || CONST.CALENDAR_PICKER.MAX_YEAR;

    const [searchText, setSearchText] = useState('');

    const years: CalendarPickerListItem[] = useMemo(
        () =>
            Array.from({length: maxYear - minYear + 1}, (value, index) => index + minYear).map((year) => ({
                text: year.toString(),
                value: year,
                keyForList: year.toString(),
                isSelected: year === currentYear,
            })),
        [minYear, maxYear, currentYear],
    );

    const {data, headerMessage} = useMemo(() => {
        const yearsList = searchText === '' ? years : years.filter((year) => year.text?.includes(searchText));
        return {
            headerMessage: !yearsList.length ? translate('common.noResultsFound') : '',
            data: yearsList.sort((a, b) => b.value - a.value),
        };
    }, [years, searchText, translate]);

    const textInputOptions = useMemo(
        () => ({
            label: translate('yearPickerPage.selectYear'),
            value: searchText,
            onChangeText: (text: string) => setSearchText(text.replaceAll(CONST.REGEX.NON_NUMERIC, '').trim()),
            headerMessage,
            maxLength: 4,
            inputMode: CONST.INPUT_MODE.NUMERIC,
        }),
        [headerMessage, searchText, translate],
    );

    return (
        <ScreenWrapper
            style={[styles.pb0]}
            includePaddingTop={false}
            enableEdgeToEdgeBottomSafeAreaPadding
            testID="DynamicYearSelectorPage"
        >
            <HeaderWithBackButton
                title={translate('yearPickerPage.year')}
                onBackButtonPress={() => Navigation.goBack(backPath)}
            />
            <SelectionList
                data={data}
                ListItem={SingleSelectListItem}
                onSelectRow={(option) => {
                    Keyboard.dismiss();
                    setCalendarPickerSelectedYear(contextID, option.value);
                    Navigation.goBack(backPath);
                }}
                textInputOptions={textInputOptions}
                initiallyFocusedItemKey={currentYear.toString()}
                disableMaintainingScrollPosition
                addBottomSafeAreaPadding
                shouldStopPropagation
                showScrollIndicator
            />
        </ScreenWrapper>
    );
}

export default DynamicYearSelectorPage;
