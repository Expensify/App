import {format, parseISO} from 'date-fns';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';
import Button from '@components/Button';
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
const RANGE_POPOVER_WIDTH = 660;

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
    const [selectedDateModifier, setSelectedDateModifier] = useState<SearchDateModifier | null>(null);
    const [shouldShowRangeError, setShouldShowRangeError] = useState(false);
    const [trackedDateValues, setTrackedDateValues] = useState<SearchDateValues>(value);

    // Widen the popover when Range is selected, reset when not
    useEffect(() => {
        if (selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE) {
            setPopoverWidth?.(RANGE_POPOVER_WIDTH);
        } else {
            setPopoverWidth?.(undefined);
        }
    }, [selectedDateModifier, setPopoverWidth]);

    // Auto-detect Range mode when both after and before values exist on initial open only
    useEffect(() => {
        const hasAfter = !!value[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        const hasBefore = !!value[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
        const hasOn = !!value[CONST.SEARCH.DATE_MODIFIERS.ON];
        
        if (hasAfter && hasBefore && !hasOn) {
            setSelectedDateModifier(CONST.SEARCH.DATE_MODIFIERS.RANGE);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedDateModifier(null);
        setShouldShowRangeError(false);
    }, []);

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
                    return;
                }
            }

            searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            clearSelection();
            return;
        }

        const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
        const hasFrom = !!dateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
        const hasTo = !!dateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];

        if (hasFrom !== hasTo) {
            // Partial range: force user to complete both dates and show inline error
            setSelectedDateModifier(CONST.SEARCH.DATE_MODIFIERS.RANGE);
            setShouldShowRangeError(true);
            return;
        }

        onChange(dateValues);
        closeOverlay();
    }, [closeOverlay, onChange, selectedDateModifier]);

    const resetChanges = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            clearSelection();
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
    const rangeFrom = trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.AFTER];
    const rangeTo = trackedDateValues[CONST.SEARCH.DATE_MODIFIERS.BEFORE];
    let rangeText: string | null = null;
    if (isInRangeMode) {
        if (rangeFrom && rangeTo) {
            rangeText = DateUtils.getFormattedDateRangeForSearch(rangeFrom, rangeTo, true);
        } else if (rangeFrom || rangeTo) {
            rangeText = format(parseISO((rangeFrom ?? rangeTo) as string), 'MMM d, yyyy');
        }
    }

    const shouldShowInlineRangeText = !!rangeText && !isSmallScreenWidth;

    const maxPopupHeight = Math.round(windowHeight * 0.85);

    const mobileButtonStyle = isSmallScreenWidth ? styles.flex1 : {minWidth: 120};
    const buttonRowSpacing = selectedDateModifier ? styles.mt4 : styles.mt2;
    const topPaddingStyle = selectedDateModifier ? (isSmallScreenWidth ? styles.pt0 : styles.pt4) : undefined;

    return (
        <View style={[topPaddingStyle, styles.pb4, isSmallScreenWidth && styles.flexGrow1, isSmallScreenWidth && {maxHeight: maxPopupHeight}]}>
            {isSmallScreenWidth && !selectedDateModifier && <Text style={[styles.textLabel, styles.ph5, styles.pb3]}>{label}</Text>}
            <ScrollView
                style={[isSmallScreenWidth && styles.flexGrow1]}
                contentContainerStyle={[
                    !isSmallScreenWidth && !selectedDateModifier && styles.pt4,
                    isSmallScreenWidth && selectedDateModifier && styles.pt0,
                ]}
            >
                {!!selectedDateModifier && isSmallScreenWidth && (
                    <HeaderWithBackButton
                        shouldDisplayHelpButton={false}
                        title={translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`)}
                        onBackButtonPress={clearSelection}
                    />
                )}
                {!!selectedDateModifier && !isSmallScreenWidth && (
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.ph5, styles.pb2, styles.gap2]}>
                        <PressableWithoutFeedback
                            onPress={clearSelection}
                            role={CONST.ROLE.BUTTON}
                            accessibilityLabel={translate('common.back')}
                        >
                            <Icon
                                src={backArrowIcon.BackArrow}
                                fill={theme.icon}
                                small
                            />
                        </PressableWithoutFeedback>
                        <Text style={[styles.textLabelSupporting]}>
                            {translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`)}
                        </Text>
                    </View>
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
                {isSmallScreenWidth && rangeText && (
                    <Text style={[styles.textMicroSupporting, styles.ph5, styles.mt4, styles.textAlignCenter]}>
                        {`${translate('common.range')}: `}
                        <Text style={[styles.textMicroSupporting, styles.textStrong]}>{rangeText}</Text>
                    </Text>
                )}
            </ScrollView>
            <View style={[styles.flexRow, styles.ph5, buttonRowSpacing, styles.alignItemsCenter, isSmallScreenWidth && styles.gap2]}>
                {shouldShowInlineRangeText && (
                    <Text style={[styles.textLabelSupporting, styles.flex1, styles.mr3]}>
                        {`${translate('common.range')}: `}
                        <Text style={[styles.textLabelSupporting, styles.textStrong]}>{rangeText}</Text>
                    </Text>
                )}
                {!shouldShowInlineRangeText && !isSmallScreenWidth && <View style={styles.flex1} />}
                <Button
                    medium
                    style={[!isSmallScreenWidth && styles.mr2, mobileButtonStyle]}
                    text={translate('common.reset')}
                    onPress={resetChanges}
                />
                <Button
                    success
                    medium
                    style={[mobileButtonStyle]}
                    text={translate('common.apply')}
                    onPress={applyChanges}
                />
            </View>
        </View>
    );
}

export type {DateSelectPopupProps};
export default DateSelectPopup;
