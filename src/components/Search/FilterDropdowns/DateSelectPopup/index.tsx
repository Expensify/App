import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import ScrollView from '@components/ScrollView';
import DatePresetFilterBase from '@components/Search/FilterComponents/DatePresetFilterBase';
import type {SearchDatePresetFilterBaseHandle} from '@components/Search/FilterComponents/DatePresetFilterBase';
import ActionButtons from '@components/Search/FilterDropdowns/ActionButtons';
import type {SearchDatePreset} from '@components/Search/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {SearchDateValues} from '@libs/SearchQueryUtils';
import {getDateModifierTitle, getDateRangeDisplayValueFromFormValue} from '@libs/SearchQueryUtils';
import type {SearchDateModifier} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';
import SelectedDateModifierHeader from './SelectedDateModifierHeader';

type DateSelectPopupProps = {
    /** The label to show when in an overlay on mobile */
    label?: string;

    /** The current date values */
    value: SearchDateValues;

    /** The date presets */
    presets?: SearchDatePreset[];

    /** Additional style props */
    style?: StyleProp<ViewStyle>;

    /** Function to call when changes are applied */
    onChange: (value: SearchDateValues) => void;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to set the popover width dynamically */
    setPopoverWidth?: (width: number | undefined) => void;
};

function DateSelectPopup({label, value, presets, style, closeOverlay, onChange, setPopoverWidth}: DateSelectPopupProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isInLandscapeMode} = useResponsiveLayout();

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);
    const [shouldShowRangeError, setShouldShowRangeError] = useState(false);
    const [rangeText, setRangeText] = useState(() =>
        getDateRangeDisplayValueFromFormValue(value[CONST.SEARCH.DATE_MODIFIERS.RANGE], value[CONST.SEARCH.DATE_MODIFIERS.AFTER], value[CONST.SEARCH.DATE_MODIFIERS.BEFORE]),
    );
    const syncedRangeText = useMemo(
        () => getDateRangeDisplayValueFromFormValue(value[CONST.SEARCH.DATE_MODIFIERS.RANGE], value[CONST.SEARCH.DATE_MODIFIERS.AFTER], value[CONST.SEARCH.DATE_MODIFIERS.BEFORE]),
        [value],
    );
    const displayedRangeText = selectedDateModifier ? rangeText : syncedRangeText;
    const selectedDateModifierTitle = getDateModifierTitle(selectedDateModifier, '', translate);

    const updateRangeText = useCallback(() => {
        setRangeText(searchDatePresetFilterBaseRef.current?.getRangeDisplayText() ?? '');
    }, []);

    // Widen the popover when Range is selected, reset when not
    useEffect(() => {
        if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
            setPopoverWidth?.(CONST.POPOVER_DATE_RANGE_WIDTH);
        } else {
            setPopoverWidth?.(undefined);
        }
    }, [selectedDateModifier, setPopoverWidth]);

    const clearSelection = useCallback(() => {
        setSelectedDateModifier(null);
        setShouldShowRangeError(false);
    }, []);

    const handleBackPress = useCallback(() => {
        if (searchDatePresetFilterBaseRef.current && selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
            searchDatePresetFilterBaseRef.current.restoreRangeToEntrySnapshot();
            updateRangeText();
        }
        clearSelection();
    }, [clearSelection, selectedDateModifier, updateRangeText]);

    const applyChanges = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            if (!searchDatePresetFilterBaseRef.current.validate()) {
                return;
            }

            searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            onChange(searchDatePresetFilterBaseRef.current.getDateValues());
            closeOverlay();
            return;
        }

        const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
        onChange(dateValues);
        closeOverlay();
    }, [closeOverlay, onChange, selectedDateModifier]);

    const resetChanges = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
            clearSelection();
            onChange(dateValues);
            closeOverlay();
            return;
        }

        searchDatePresetFilterBaseRef.current.clearDateValues();
        setRangeText('');
        setShouldShowRangeError(false);
        onChange(searchDatePresetFilterBaseRef.current.getDateValues());
        closeOverlay();
    }, [clearSelection, closeOverlay, onChange, selectedDateModifier]);

    const maxPopupHeight = Math.round(windowHeight * 0.875);

    // For non-Range modes, use original simple styles. For Range, use custom layout
    const useRangeLayout = selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE;

    if (!isSmallScreenWidth) {
        return (
            <View style={[styles.pv4, styles.gap2, style]}>
                <View>
                    {!!selectedDateModifier && (
                        <SelectedDateModifierHeader
                            isCompact={false}
                            title={selectedDateModifierTitle}
                            onBackPress={handleBackPress}
                        />
                    )}
                    <DatePresetFilterBase
                        ref={searchDatePresetFilterBaseRef}
                        defaultDateValues={value}
                        selectedDateModifier={selectedDateModifier}
                        onSelectDateModifier={setSelectedDateModifier}
                        presets={presets}
                        onDateValuesChange={updateRangeText}
                        onRangeValidationErrorChange={setShouldShowRangeError}
                    />
                    {shouldShowRangeError && (
                        <FormHelpMessage
                            isError
                            message={translate('search.errors.pleaseSelectDatesForBothFromAndTo')}
                            style={[styles.mh5, styles.mt2]}
                        />
                    )}
                </View>
                <View style={[styles.flexRow, styles.gap2, useRangeLayout ? styles.mh5 : styles.ph5, useRangeLayout && styles.alignItemsCenter, useRangeLayout && styles.pt1]}>
                    {useRangeLayout && (
                        <View style={[styles.flex1, styles.mr2]}>
                            {!!displayedRangeText && (
                                <Text style={[styles.textLabelSupporting]}>
                                    {`${translate('common.range')}: `}
                                    <Text style={[styles.textLabel]}>{displayedRangeText}</Text>
                                </Text>
                            )}
                        </View>
                    )}
                    <View style={[styles.flex1, useRangeLayout && styles.ml2]}>
                        <ActionButtons
                            containerStyle={[styles.flexRow, styles.gap2]}
                            onReset={resetChanges}
                            onApply={applyChanges}
                        />
                    </View>
                </View>
            </View>
        );
    }

    const topPaddingStyle = selectedDateModifier ? styles.pt3 : undefined;
    const buttonRowSpacing = selectedDateModifier ? styles.mt4 : styles.mt2;
    const mobileContainerStyle = useRangeLayout ? [topPaddingStyle, styles.flexGrow1, {maxHeight: maxPopupHeight}] : styles.gap2;
    const mobileLabelStyle = useRangeLayout ? [styles.textLabel, styles.ph5, styles.pb3] : [styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1];
    const mobileButtonRowStyle = useRangeLayout ? [styles.flexRow, styles.ph5, buttonRowSpacing, styles.alignItemsCenter, styles.gap2] : [styles.flexRow, styles.gap2, styles.ph5];

    return (
        <View style={[mobileContainerStyle, style, isInLandscapeMode ? styles.h100 : undefined]}>
            {!selectedDateModifier && !!label && <Text style={mobileLabelStyle}>{label}</Text>}
            <ScrollView
                ref={scrollViewRef}
                keyboardShouldPersistTaps="handled"
                style={useRangeLayout ? [styles.flexGrow1] : undefined}
                contentContainerStyle={useRangeLayout ? [!selectedDateModifier && styles.pt4, selectedDateModifier && styles.pt0] : undefined}
            >
                {!!selectedDateModifier && (
                    <SelectedDateModifierHeader
                        isCompact={isSmallScreenWidth && useRangeLayout}
                        title={selectedDateModifierTitle}
                        onBackPress={handleBackPress}
                    />
                )}
                <DatePresetFilterBase
                    ref={searchDatePresetFilterBaseRef}
                    defaultDateValues={value}
                    selectedDateModifier={selectedDateModifier}
                    onSelectDateModifier={setSelectedDateModifier}
                    presets={presets}
                    onDateValuesChange={updateRangeText}
                    onRangeValidationErrorChange={setShouldShowRangeError}
                />
            </ScrollView>
            {shouldShowRangeError && (
                <FormHelpMessage
                    isError
                    message={translate('search.errors.pleaseSelectDatesForBothFromAndTo')}
                    style={[styles.mh5, styles.mt2]}
                />
            )}
            {!!displayedRangeText && selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE && (
                <Text style={[styles.textLabelSupporting, styles.ph5, styles.mt2, styles.textAlignLeft]}>
                    {`${translate('common.range')}: `}
                    <Text style={[styles.textLabel]}>{displayedRangeText}</Text>
                </Text>
            )}
            <ActionButtons
                containerStyle={mobileButtonRowStyle}
                resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_DATE}
                applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_DATE}
                onReset={resetChanges}
                onApply={applyChanges}
            />
        </View>
    );
}

export type {DateSelectPopupProps};
export default DateSelectPopup;
