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
import {getDateRangeDisplayValueFromFormValue} from '@libs/SearchQueryUtils';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

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
    const [rangeText, setRangeText] = useState(() =>
        getDateRangeDisplayValueFromFormValue(value[CONST.SEARCH.DATE_MODIFIERS.RANGE], value[CONST.SEARCH.DATE_MODIFIERS.AFTER], value[CONST.SEARCH.DATE_MODIFIERS.BEFORE]),
    );

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
                setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({animated: true});
                }, 100);
                return;
            }

            searchDatePresetFilterBaseRef.current.setDateValueOfSelectedDateModifier();
            updateRangeText();
            clearSelection();
            return;
        }

        const dateValues = searchDatePresetFilterBaseRef.current.getDateValues();
        onChange(dateValues);
        closeOverlay();
    }, [clearSelection, closeOverlay, onChange, selectedDateModifier, updateRangeText]);

    const resetChanges = useCallback(() => {
        if (!searchDatePresetFilterBaseRef.current) {
            return;
        }

        if (selectedDateModifier) {
            searchDatePresetFilterBaseRef.current.clearDateValueOfSelectedDateModifier();
            updateRangeText();
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
        setRangeText('');
        setShouldShowRangeError(false);
        onChange(emptyDateValues);
        closeOverlay();
    }, [clearSelection, closeOverlay, onChange, selectedDateModifier, updateRangeText]);

    const isInRangeMode = selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE;

    const maxPopupHeight = Math.round(windowHeight * 0.875);

    // For non-Range modes, use original simple styles. For Range, use custom layout
    const useRangeLayout = isInRangeMode;
    const datePresetFilterBase = (
        <DatePresetFilterBase
            ref={searchDatePresetFilterBaseRef}
            defaultDateValues={value}
            selectedDateModifier={selectedDateModifier}
            onSelectDateModifier={setSelectedDateModifier}
            presets={presets}
            shouldShowRangeError={shouldShowRangeError}
            onDateValuesChange={updateRangeText}
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
    const mobileContainerStyle = useRangeLayout ? [topPaddingStyle, styles.flexGrow1, {maxHeight: maxPopupHeight}] : styles.gap2;
    const mobileLabelStyle = useRangeLayout ? [styles.textLabel, styles.ph5, styles.pb3] : [styles.textLabel, styles.textSupporting, styles.ph5, styles.pv1];
    const mobileButtonRowStyle = useRangeLayout ? [styles.flexRow, styles.ph5, buttonRowSpacing, styles.alignItemsCenter, styles.gap2] : [styles.flexRow, styles.gap2, styles.ph5];

    return (
        <View style={mobileContainerStyle}>
            {!selectedDateModifier && <Text style={mobileLabelStyle}>{label}</Text>}
            <ScrollView
                ref={scrollViewRef}
                style={useRangeLayout ? [styles.flexGrow1] : undefined}
                contentContainerStyle={useRangeLayout ? [!selectedDateModifier && styles.pt4, selectedDateModifier && styles.pt0] : undefined}
            >
                {!!selectedDateModifier &&
                    (useRangeLayout ? (
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
                    ) : (
                        <HeaderWithBackButton
                            shouldDisplayHelpButton={false}
                            style={[styles.h10, styles.pb3]}
                            subtitle={translate(`common.${selectedDateModifier.toLowerCase() as SearchDateModifierLower}`)}
                            onBackButtonPress={handleBackPress}
                        />
                    ))}
                {datePresetFilterBase}
            </ScrollView>
            {!!rangeText && selectedDateModifier === CONST.SEARCH.DATE_MODIFIERS.RANGE && (
                <Text style={[styles.textLabelSupporting, styles.ph5, styles.mt2, styles.textAlignLeft]}>
                    {`${translate('common.range')}: `}
                    <Text style={[styles.textLabel]}>{rangeText}</Text>
                </Text>
            )}
            <View style={mobileButtonRowStyle}>
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
    );
}

export type {DateSelectPopupProps};
export default DateSelectPopup;
