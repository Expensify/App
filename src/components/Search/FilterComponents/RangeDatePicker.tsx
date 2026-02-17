import React, {useCallback, useMemo, useState} from 'react';
import {View} from 'react-native';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import type {DayProps} from '@components/DatePicker/CalendarPicker/Day';
import FormHelpMessage from '@components/FormHelpMessage';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

/** Day component with green highlight for selected date */
function GreenSelectedDay({disabled, selected, children}: DayProps) {
    const themeStyles = useThemeStyles();
    return (
        <View style={[themeStyles.calendarDayContainer, selected ? themeStyles.buttonSuccess : {}]}>
            <Text style={[disabled ? themeStyles.buttonOpacityDisabled : {}, selected ? themeStyles.themeTextColor : {}]}>{children}</Text>
        </View>
    );
}

type RangeDatePickerProps = {
    /** The "From" date value */
    fromValue?: string;

    /** The "To" date value */
    toValue?: string;

    /** Callback when "From" date is selected */
    onFromSelected: (date: string) => void;

    /** Callback when "To" date is selected */
    onToSelected: (date: string) => void;

    /** Whether to show validation error */
    shouldShowError?: boolean;

    /** Force vertical stacking of calendars */
    forceVertical?: boolean;
};

function RangeDatePicker({fromValue, toValue, onFromSelected, onToSelected, shouldShowError = false, forceVertical = false}: RangeDatePickerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const shouldStack = forceVertical || isSmallScreenWidth;
    const fromMaxDate = useMemo(() => (toValue ? new Date(toValue) : CONST.CALENDAR_PICKER.MAX_DATE), [toValue]);
    const toMinDate = useMemo(() => (fromValue ? new Date(fromValue) : CONST.CALENDAR_PICKER.MIN_DATE), [fromValue]);
    const [fromCalendarRowsCount, setFromCalendarRowsCount] = useState(CONST.MAX_CALENDAR_PICKER_ROWS);
    const [toCalendarRowsCount, setToCalendarRowsCount] = useState(CONST.MAX_CALENDAR_PICKER_ROWS);

    const handleFromCalendarRowsCountChange = useCallback((rowCount: number) => {
        setFromCalendarRowsCount(rowCount);
    }, []);

    const handleToCalendarRowsCountChange = useCallback((rowCount: number) => {
        setToCalendarRowsCount(rowCount);
    }, []);

    const sharedDesktopCalendarRowCount = !shouldStack ? Math.max(fromCalendarRowsCount, toCalendarRowsCount) : undefined;

    return (
        <>
            <View style={[!shouldStack && styles.flexRow, styles.mh5, isSmallScreenWidth && styles.mt3]}>
                <View style={[!shouldStack && styles.flex1, !shouldStack && styles.mr2]}>
                    <View style={[styles.borderedContentCard]}>
                        <Text style={[styles.textLabelSupporting, styles.mb2, styles.ph4, styles.pt4]}>{translate('common.from')}</Text>
                        <CalendarPicker
                            value={fromValue}
                            onSelected={onFromSelected}
                            minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                            maxDate={fromMaxDate}
                            DayComponent={GreenSelectedDay}
                            headerContainerStyle={styles.ph4}
                            shouldUseFixedRowHeight={!shouldStack}
                            fixedRowCount={sharedDesktopCalendarRowCount}
                            onCalendarRowsCountChange={handleFromCalendarRowsCountChange}
                        />
                    </View>
                </View>

                <View style={[!shouldStack && styles.flex1, !shouldStack && styles.ml2, shouldStack && styles.mt4]}>
                    <View style={[styles.borderedContentCard]}>
                        <Text style={[styles.textLabelSupporting, styles.mb2, styles.ph4, styles.pt4]}>{translate('common.to')}</Text>
                        <CalendarPicker
                            value={toValue}
                            onSelected={onToSelected}
                            minDate={toMinDate}
                            maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                            DayComponent={GreenSelectedDay}
                            headerContainerStyle={styles.ph4}
                            shouldUseFixedRowHeight={!shouldStack}
                            fixedRowCount={sharedDesktopCalendarRowCount}
                            onCalendarRowsCountChange={handleToCalendarRowsCountChange}
                        />
                    </View>
                </View>
            </View>

            {shouldShowError && (
                <FormHelpMessage
                    isError
                    message={translate('search.errors.pleaseSelectDatesForBothFromAndTo')}
                    style={[styles.mh3, styles.mt2]}
                />
            )}
        </>
    );
}

export default RangeDatePicker;
