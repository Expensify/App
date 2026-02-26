import {format, parseISO} from 'date-fns';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import ScrollView from '@components/ScrollView';
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
import {getRangeBoundariesFromFormValue} from '@libs/SearchQueryUtils';
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
    const scrollViewRef = useRef<React.ComponentRef<typeof ScrollView>>(null);
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);
    const [shouldShowRangeError, setShouldShowRangeError] = useState(false);
    const [trackedDateValues, setTrackedDateValues] = useState<SearchDateValues>(value);

    const updateTrackedDateValues = useCallback((dateValues: SearchDateValues) => {
        setTrackedDateValues(dateValues);
    }, []);

    // Sync trackedDateValues when actual date values change from parent
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTrackedDateValues(value);
    }, [value]);

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
            searchDatePresetFilterBaseRef.current.resetDateValuesToDefault();
            updateTrackedDateValues(value);
        }
        clearSelection();
    }, [clearSelection, selectedDateModifier, updateTrackedDateValues, value]);

    const applyChanges = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            if (!searchDatePresetFilterBaseRef.current.validate()) {
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({animated: true});
                }, 100);
                return;
            }

            const dateValues = searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            updateTrackedDateValues(dateValues);
            clearSelection();
            return;
        }

        onChange(trackedDateValues);
        closeOverlay();
    }, [clearSelection, closeOverlay, onChange, selectedDateModifier, trackedDateValues, updateTrackedDateValues]);

    const resetChanges = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            const clearedDateValues = searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            updateTrackedDateValues(clearedDateValues);
            clearSelection();
            return;
        }

        const emptyDateValues: SearchDateValues = {
            [CONST.SEARCH.DATE_MODIFIERS.ON]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.BEFORE]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.AFTER]: undefined,
            [CONST.SEARCH.DATE_MODIFIERS.RANGE]: undefined,
        };
        searchDatePresetFilterBaseRef.current.clearDateValues();
        updateTrackedDateValues(emptyDateValues);
        setShouldShowRangeError(false);
        onChange(emptyDateValues);
        closeOverlay();
    }, [clearSelection, closeOverlay, onChange, selectedDateModifier, updateTrackedDateValues]);

    const isInRangeMode = selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE;
    const hasRangeFlag = !!trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE];
    const rangeBoundaries = getRangeBoundariesFromFormValue(
        trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.RANGE],
        trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER],
        trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE],
    );
    const rangeFrom = hasRangeFlag ? rangeBoundaries.from : undefined;
    const rangeTo = hasRangeFlag ? rangeBoundaries.to : undefined;
    const isRangeMode = isInRangeMode || (!selectedDateModifier && hasRangeFlag);

    let rangeText: string | null = null;
    // Show range text from applied Range filter.
    const displayFrom = rangeFrom;
    const displayTo = rangeTo;
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

    const maxPopupHeight = Math.round(windowHeight * 0.875);

    // For non-Range modes, use original simple styles. For Range, use custom layout
    const useRangeLayout = isInRangeMode;
    const datePresetFilterBase = (
        <DatePresetFilterBase
            ref={searchDatePresetFilterBaseRef}
            defaultDateValues={trackedDateValues}
            selectedDateModifier={selectedDateModifier}
            onSelectDateModifier={setSelectedDateModifier}
            presets={presets}
            shouldShowRangeError={shouldShowRangeError}
            onDateValuesChange={updateTrackedDateValues}
            onRangeValidationErrorChange={setShouldShowRangeError}
        />
    );

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
                    {datePresetFilterBase}
                </View>
                <View style={[styles.flexRow, styles.gap2, useRangeLayout ? styles.mh5 : styles.ph5, useRangeLayout && styles.alignItemsCenter, useRangeLayout && styles.pt1]}>
                    {useRangeLayout && (
                        <View style={[styles.flex1, styles.mr2]}>
                            {!!rangeText && (
                                <Text style={[styles.textLabelSupporting]}>
                                    {`${translate('common.range')}: `}
                                    <Text style={[styles.textLabel]}>{rangeText}</Text>
                                </Text>
                            )}
                        </View>
                    )}
                    <View style={[styles.flex1, useRangeLayout && styles.ml2]}>
                        <View style={[styles.flexRow, styles.gap2]}>
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
            </View>
        );
    }

    const topPaddingStyle = selectedDateModifier ? styles.pt3 : undefined;
    const buttonRowSpacing = selectedDateModifier ? styles.mt4 : styles.mt2;

    return useRangeLayout ? (
        <View style={[topPaddingStyle, styles.flexGrow1, {maxHeight: maxPopupHeight}]}>
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
                {datePresetFilterBase}
            </ScrollView>
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
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_DATE}
                />
                <Button
                    success
                    medium
                    style={[styles.flex1]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                    sentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_DATE}
                />
            </View>
        </View>
    ) : (
        <View style={styles.gap2}>
            {!selectedDateModifier && <Text style={[styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1]}>{label}</Text>}
            <View>
                {!!selectedDateModifier && (
                    <HeaderWithBackButton
                        shouldDisplayHelpButton={false}
                        style={[styles.h10, styles.pb3]}
                        subtitle={translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`)}
                        onBackButtonPress={handleBackPress}
                    />
                )}
                {datePresetFilterBase}
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

export type {DateSelectPopupProps};
export default DateSelectPopup;
