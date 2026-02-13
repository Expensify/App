import {format, parseISO} from 'date-fns';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import Button from '@components/Button';
import FormHelpMessage from '@components/FormHelpMessage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import DatePresetFilterBase from '@components/Search/FilterComponents/DatePresetFilterBase';
import type {SearchDatePresetFilterBaseHandle, SearchDateValues} from '@components/Search/FilterComponents/DatePresetFilterBase';
import type {SearchDatePreset} from '@components/Search/types';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import DateUtils from '@libs/DateUtils';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

/** Width of the popover when Range is selected (enough for two side-by-side calendars) */
const RANGE_POPOVER_WIDTH = 672;

type DateSelectPopupProps = {
    /** The label to show when in an overlay on mobile */
    label: string;

    /** The current date values */
    value: SearchDateValues;

    /** The date presets */
    presets?: SearchDatePreset[];

    /** Function to call when changes are applied */
    onChange: (value: SearchDateValues) => void;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to set the popover width dynamically */
    setPopoverWidth?: (width: number | undefined) => void;
};

function DateSelectPopup({label, value, presets, closeOverlay, onChange, setPopoverWidth}: DateSelectPopupProps) {
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {windowHeight} = useWindowDimensions();
    const theme = useTheme();
    const backArrowIcon = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const searchDatePresetFilterBaseRef = useRef<SearchDatePresetFilterBaseHandle>(null);
    const scrollViewRef = useRef<ScrollView>(null);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);
    const [shouldShowRangeError, setShouldShowRangeError] = useState(false);
    const [trackedDateValues, setTrackedDateValues] = useState<SearchDateValues>(value);

    // Sync trackedDateValues when actual date values change from parent
    useEffect(() => {
        setTrackedDateValues(value);
    }, [value[CONST.SEARCH.DATE_MODIFIERS.ON], value[CONST.SEARCH.DATE_MODIFIERS.AFTER], value[CONST.SEARCH.DATE_MODIFIERS.BEFORE], value[CONST.SEARCH.DATE_MODIFIERS.RANGE]]);

    // Widen the popover when Range is selected, reset when not
    useEffect(() => {
        if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
            setPopoverWidth?.(RANGE_POPOVER_WIDTH);
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
            const hasExistingRange = !!value[CONST.SEARCH.DATE_MODIFIERS.AFTER] && !!value[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
            if (!hasExistingRange) {
                searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            }
            setTrackedDateValues(value);
        }
        clearSelection();
    }, [clearSelection, selectedDateModifier, value]);

    const applyChanges = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            // For Range, validate that both dates are selected
            if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
                const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
                const hasFrom = !!dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
                const hasTo = !!dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];

                if (!hasFrom || !hasTo) {
                    setShouldShowRangeError(true);
                    setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({animated: true});
                    }, 100);
                    return;
                }
            }

            // This now returns the updated values synchronously
            const dateValues = searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            setTrackedDateValues(dateValues);
            clearSelection();
            onChange(dateValues);
            closeOverlay();
            return;
        }

        const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
        onChange(dateValues);
        closeOverlay();
    }, [clearSelection, closeOverlay, onChange, selectedDateModifier]);

    const resetChanges = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            // Update tracked state to reflect cleared values
            const clearedDateValues = searchDatePresetFilterBaseRef.current.getDateValues();
            setTrackedDateValues(clearedDateValues);
            setShouldShowRangeError(false);
            return;
        }

        searchDatePresetFilterBaseRef.current.clearDateValues();
        setShouldShowRangeError(false);
        onChange({
            [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
        });
        closeOverlay();
    }, [closeOverlay, onChange, selectedDateModifier]);

    const isInRangeMode = selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE;
    const hasRangeFlag = !!trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];
    // MUTUAL EXCLUSIVITY: Only show range values when Range flag is explicitly set
    // When in fresh Range mode (no flag), only show text after BOTH dates selected
    const rangeFrom = hasRangeFlag ? trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER] : undefined;
    const rangeTo = hasRangeFlag ? trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE] : undefined;
    const isRangeMode = isInRangeMode || (!selectedDateModifier && hasRangeFlag);

    // For fresh Range selection (no flag), only show text when BOTH dates selected
    const freshSelectionFrom = trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
    const freshSelectionTo = trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
    const hasBothFreshDates = !!(freshSelectionFrom && freshSelectionTo);
    const activeSelectionFrom = isInRangeMode && !hasRangeFlag && hasBothFreshDates ? freshSelectionFrom : undefined;
    const activeSelectionTo = isInRangeMode && !hasRangeFlag && hasBothFreshDates ? freshSelectionTo : undefined;

    let rangeText: string | null = null;
    // Show range text from applied Range filter OR from active selection
    const displayFrom = rangeFrom || activeSelectionFrom;
    const displayTo = rangeTo || activeSelectionTo;
    if (isRangeMode && (displayFrom || displayTo)) {
        if (displayFrom && displayTo) {
            rangeText = DateUtils.getFormattedDateRangeForSearch(displayFrom, displayTo, true);
        } else {
            const singleRangeValue = displayFrom ?? displayTo;
            if (singleRangeValue) {
                rangeText = format(parseISO(singleRangeValue), 'MMM d, yyyy');
            }
        }
    }

    const shouldShowInlineRangeText = !isSmallScreenWidth && selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE;

    const maxPopupHeight = Math.round(windowHeight * 0.875);

    // For non-Range modes, use original simple styles. For Range, use custom layout
    const useRangeLayout = isRangeMode;

    // Original simple styles for non-Range modes
    if (!useRangeLayout) {
        return (
            <View style={[!isSmallScreenWidth && styles.pv4, styles.gap2]}>
                {isSmallScreenWidth && !selectedDateModifier && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}
                <View>
                    {!!selectedDateModifier && (
                        <HeaderWithBackButton
                            shouldDisplayHelpButton={false}
                            style={[styles.h10, styles.pb3]}
                            subtitle={translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`)}
                            onBackButtonPress={handleBackPress}
                        />
                    )}
                    <DatePresetFilterBase
                        ref={searchDatePresetFilterBaseRef}
                        defaultDateValues={value}
                        selectedDateModifier={selectedDateModifier}
                        onSelectDateModifier={setSelectedDateModifier}
                        presets={presets}
                        shouldShowRangeError={shouldShowRangeError}
                        onDateValuesChange={setTrackedDateValues}
                    />
                </View>
                <View style={[styles.flexRow, styles.gap2, styles.ph5]}>
                    <Button
                        medium
                        style={[styles.flex1]}
                        text={translate('common.reset')}
                        onPress={resetChanges}
                    />
                    <Button
                        success
                        medium
                        style={[styles.flex1]}
                        text={translate('common.apply')}
                        onPress={applyChanges}
                    />
                </View>
            </View>
        );
    }

    // Range mode - desktop uses simple layout, mobile uses ScrollView layout
    if (!isSmallScreenWidth) {
        return (
            <View style={[styles.pv4, styles.gap2]}>
                <View>
                    {!!selectedDateModifier && (
                        <HeaderWithBackButton
                            shouldDisplayHelpButton={false}
                            style={[styles.h10, styles.pb3]}
                            subtitle={translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`)}
                            onBackButtonPress={handleBackPress}
                        />
                    )}
                    <DatePresetFilterBase
                        ref={searchDatePresetFilterBaseRef}
                        defaultDateValues={value}
                        selectedDateModifier={selectedDateModifier}
                        onSelectDateModifier={setSelectedDateModifier}
                        presets={presets}
                        shouldShowRangeError={shouldShowRangeError}
                        onDateValuesChange={setTrackedDateValues}
                    />
                </View>
                <View style={[styles.flexRow, styles.ph5, styles.alignItemsCenter, styles.pt1]}>
                    {shouldShowInlineRangeText && (
                        <Text style={[styles.textLabelSupporting, styles.flex1]}>
                            {rangeText ? (
                                <>
                                    {`${translate('common.range')}: `}
                                    <Text style={[styles.textLabel]}>{rangeText}</Text>
                                </>
                            ) : null}
                        </Text>
                    )}
                    <View style={[styles.flexRow, styles.gap2, shouldShowInlineRangeText ? [styles.flex1, styles.justifyContentEnd] : styles.flex1]}>
                        <Button
                            medium
                            style={[styles.flex1]}
                            text={translate('common.reset')}
                            onPress={resetChanges}
                        />
                        <Button
                            success
                            medium
                            style={[styles.flex1]}
                            text={translate('common.apply')}
                            onPress={applyChanges}
                        />
                    </View>
                </View>
            </View>
        );
    }

    // Range mode - Mobile with ScrollView
    const topPaddingStyle = selectedDateModifier ? styles.pt3 : undefined;
    const buttonRowSpacing = selectedDateModifier ? styles.mt4 : styles.mt2;

    return (
        <View style={[topPaddingStyle, styles.pb4, styles.flexGrow1, {maxHeight: maxPopupHeight}]}>
            {!selectedDateModifier && <Text style={[styles.textLabel, styles.ph5, styles.pb3]}>{label}</Text>}
            <ScrollView
                ref={scrollViewRef}
                style={[styles.flexGrow1]}
                contentContainerStyle={[!selectedDateModifier && styles.pt4, selectedDateModifier && styles.pt0]}
            >
                {!!selectedDateModifier && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.ph5, styles.pb2, styles.gap2]}>
                        <PressableWithoutFeedback
                            onPress={handleBackPress}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.back')}
                            sentryLabel="DateSelectPopup-Back"
                        >
                            <Icon
                                src={backArrowIcon.BackArrow}
                                fill={theme.icon}
                            />
                        </PressableWithoutFeedback>
                        <Text style={[styles.textLabelSupporting]}>{translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`)}</Text>
                    </View>
                )}
                <DatePresetFilterBase
                    ref={searchDatePresetFilterBaseRef}
                    defaultDateValues={value}
                    selectedDateModifier={selectedDateModifier}
                    onSelectDateModifier={setSelectedDateModifier}
                    presets={presets}
                    shouldShowRangeError={shouldShowRangeError}
                    shouldShowRangeErrorInPicker={false}
                    onDateValuesChange={setTrackedDateValues}
                />
            </ScrollView>
            {shouldShowRangeError && selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE && (
                <FormHelpMessage
                    isError
                    message={translate('search.errors.pleaseSelectDatesForBothFromAndTo')}
                    style={[styles.mh3, styles.mt2]}
                />
            )}
            {!!rangeText && selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE && (
                <Text style={[styles.textLabelSupporting, styles.ph5, styles.mt2, styles.textAlignLeft]}>
                    {`${translate('common.range')}: `}
                    <Text style={[styles.textLabel]}>{rangeText}</Text>
                </Text>
            )}
            <View style={[styles.flexRow, styles.ph5, buttonRowSpacing, styles.alignItemsCenter, styles.gap2]}>
                <Button
                    medium
                    style={[styles.flex1]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                />
            </View>
        </View>
    );
}

export type {DateSelectPopupProps};
export default DateSelectPopup;
