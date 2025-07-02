import React, {useCallback, useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItem from '@components/MenuItem';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SingleSelectListItem from '@components/SelectionList/SingleSelectListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateAdvancedFilters} from '@libs/actions/Search';
import Navigation from '@libs/Navigation/Navigation';
import {isSearchDatePreset} from '@libs/SearchQueryUtils';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {SearchDateFilterKeys, SearchDatePreset} from './types';

type SearchDatePresetFilterBaseProps = {
    /** Key used for the date filter */
    dateKey: SearchDateFilterKeys;

    /** The translation key for the page title */
    titleKey: TranslationPaths;

    /** The date presets */
    presets?: SearchDatePreset[];
};

function SearchDatePresetFilterBase({dateKey, titleKey, presets}: SearchDatePresetFilterBaseProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchAdvancedFiltersForm] = useOnyx(ONYXKEYS.FORMS.SEARCH_ADVANCED_FILTERS_FORM, {canBeMissing: true});
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);

    const [dateValues, setDateValues] = useState<Record<SearchDateModifier, string | undefined>>(() => ({
        [CONST.SEARCH.DATE_MODIFIERS.ON]: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`],
        [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`],
        [CONST.SEARCH.DATE_MODIFIERS.AFTER]: searchAdvancedFiltersForm?.[`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`],
    }));

    const setDateValue = useCallback((dateModifier: SearchDateModifier, value: string | undefined) => {
        setDateValues((prevDateValues) => {
            if (dateModifier === CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(value)) {
                return {
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: value,
                    [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
                    [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
                };
            }

            if (dateModifier !== CONST.SEARCH.DATE_MODIFIERS.ON && isSearchDatePreset(prevDateValues[CONST.SEARCH.DATE_MODIFIERS.ON])) {
                return {
                    ...prevDateValues,
                    [dateModifier]: value,
                    [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
                };
            }

            return {...prevDateValues, [dateModifier]: value};
        });
    }, []);

    const dateDisplayValues = useMemo<Record<SearchDateModifier, string | undefined>>(() => {
        const dateOn = dateValues[CONST.SEARCH.DATE_MODIFIERS.ON];
        const dateBefore = dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        const dateAfter = dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];

        return {
            // dateOn could be a preset e.g. Last month which should not be displayed as the On field
            [CONST.SEARCH.DATE_MODIFIERS.ON]: isSearchDatePreset(dateOn) ? undefined : dateOn,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: dateBefore,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: dateAfter,
        };
    }, [dateValues]);

    const getInitialEphemeralDateValue = useCallback((dateModifier: SearchDateModifier | null) => (dateModifier ? dateDisplayValues[dateModifier] : undefined), [dateDisplayValues]);
    const [ephemeralDateValue, setEphemeralDateValue] = useState<string | undefined>(() => getInitialEphemeralDateValue(selectedDateModifier));

    const chooseDateModifier = useCallback(
        (dateModifier: SearchDateModifier) => {
            setSelectedDateModifier(dateModifier);
            setEphemeralDateValue(getInitialEphemeralDateValue(dateModifier));
        },
        [getInitialEphemeralDateValue],
    );

    const goBack = useCallback(() => {
        if (!selectedDateModifier) {
            Navigation.goBack(ROUTES.SEARCH_ADVANCED_FILTERS);
            return;
        }

        setSelectedDateModifier(null);
        setEphemeralDateValue(getInitialEphemeralDateValue(null));
    }, [selectedDateModifier, getInitialEphemeralDateValue]);

    const reset = useCallback(() => {
        if (!selectedDateModifier) {
            setDateValues({[CONST.SEARCH.DATE_MODIFIERS.ON]: undefined, [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined, [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined});
            return;
        }

        setDateValue(selectedDateModifier, undefined);
        goBack();
    }, [selectedDateModifier, setDateValue, goBack]);

    const save = useCallback(() => {
        if (!selectedDateModifier) {
            updateAdvancedFilters({
                [`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.ON}`]: dateValues[CONST.SEARCH.DATE_MODIFIERS.ON] ?? null,
                [`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.BEFORE}`]: dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] ?? null,
                [`${dateKey}${CONST.SEARCH.DATE_MODIFIERS.AFTER}`]: dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] ?? null,
            });
            goBack();
            return;
        }

        setDateValue(selectedDateModifier, ephemeralDateValue);
        goBack();
    }, [selectedDateModifier, setDateValue, goBack, ephemeralDateValue, dateKey, dateValues]);

    const title = useMemo(() => {
        if (!selectedDateModifier) {
            return translate(titleKey);
        }

        return translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`);
    }, [selectedDateModifier, titleKey, translate]);

    return (
        <ScreenWrapper
            testID={SearchDatePresetFilterBase.displayName}
            shouldShowOfflineIndicatorInWideScreen
            offlineIndicatorStyle={styles.mtAuto}
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
        >
            <HeaderWithBackButton
                title={title}
                onBackButtonPress={goBack}
            />
            <ScrollView contentContainerStyle={[styles.flexGrow1]}>
                {!selectedDateModifier ? (
                    <>
                        {presets?.map((preset) => (
                            <SingleSelectListItem
                                key={preset}
                                showTooltip
                                item={{
                                    text: translate(`search.filters.date.presets.${preset}`),
                                    isSelected: dateValues[CONST.SEARCH.DATE_MODIFIERS.ON] === preset,
                                }}
                                onSelectRow={() => setDateValue(CONST.SEARCH.DATE_MODIFIERS.ON, preset)}
                            />
                        ))}
                        <MenuItem
                            shouldShowRightIcon
                            viewMode={CONST.OPTION_MODE.COMPACT}
                            title={translate('common.on')}
                            description={dateDisplayValues[CONST.SEARCH.DATE_MODIFIERS.ON]}
                            onPress={() => chooseDateModifier(CONST.SEARCH.DATE_MODIFIERS.ON)}
                        />
                        <MenuItem
                            shouldShowRightIcon
                            viewMode={CONST.OPTION_MODE.COMPACT}
                            title={translate('common.before')}
                            description={dateDisplayValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE]}
                            onPress={() => chooseDateModifier(CONST.SEARCH.DATE_MODIFIERS.BEFORE)}
                        />
                        <MenuItem
                            shouldShowRightIcon
                            viewMode={CONST.OPTION_MODE.COMPACT}
                            title={translate('common.after')}
                            description={dateDisplayValues[CONST.SEARCH.DATE_MODIFIERS.AFTER]}
                            onPress={() => chooseDateModifier(CONST.SEARCH.DATE_MODIFIERS.AFTER)}
                        />
                    </>
                ) : (
                    <CalendarPicker
                        value={ephemeralDateValue}
                        onSelected={setEphemeralDateValue}
                        minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                    />
                )}
            </ScrollView>
            <Button
                text={translate('common.reset')}
                onPress={reset}
                style={[styles.mh4, styles.mt4]}
                large
            />
            <FormAlertWithSubmitButton
                buttonText={translate('common.save')}
                containerStyles={[styles.m4, styles.mt3, styles.mb5]}
                onSubmit={save}
                enabledWhenOffline
            />
        </ScreenWrapper>
    );
}

SearchDatePresetFilterBase.displayName = 'SearchDatePresetFilterBase';

export default SearchDatePresetFilterBase;
