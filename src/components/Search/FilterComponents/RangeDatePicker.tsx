import {isValid, parse} from 'date-fns';
import React from 'react';
import {View} from 'react-native';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type RangeDatePickerProps = {
    /** The "From" date value */
    fromValue?: string;

    /** The "To" date value */
    toValue?: string;

    /** Callback when "From" date is selected */
    onFromSelected: (date: string) => void;

    /** Callback when "To" date is selected */
    onToSelected: (date: string) => void;

    /** Force vertical stacking of calendars */
    forceVertical?: boolean;
};

function parseCalendarDate(dateValue?: string): Date | undefined {
    if (!dateValue) {
        return undefined;
    }

    const parsedDate = parse(dateValue, CONST.DATE.FNS_FORMAT_STRING, new Date());
    return isValid(parsedDate) ? parsedDate : undefined;
}

function RangeDatePicker({fromValue, toValue, onFromSelected, onToSelected, forceVertical = false}: RangeDatePickerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const shouldStack = forceVertical || isSmallScreenWidth;
    const fromMaxDate = parseCalendarDate(toValue) ?? CONST.CALENDAR_PICKER.MAX_DATE;
    const toMinDate = parseCalendarDate(fromValue) ?? CONST.CALENDAR_PICKER.MIN_DATE;

    return (
        <View style={[!shouldStack && styles.flexRow, !shouldStack && styles.alignItemsStretch, styles.mh5, isSmallScreenWidth && styles.mt3]}>
            <View style={[!shouldStack && styles.flex1, !shouldStack && styles.mr2]}>
                <View style={[styles.borderedContentCard, !shouldStack && styles.flex1]}>
                    <Text style={[styles.textLabelSupporting, styles.mb2, styles.ph4, styles.pt4]}>{translate('common.from')}</Text>
                    <CalendarPicker
                        value={fromValue}
                        onSelected={onFromSelected}
                        minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                        maxDate={fromMaxDate}
                        headerContainerStyle={styles.ph4}
                    />
                </View>
            </View>

            <View style={[!shouldStack && styles.flex1, !shouldStack && styles.ml2, shouldStack && styles.mt4]}>
                <View style={[styles.borderedContentCard, !shouldStack && styles.flex1]}>
                    <Text style={[styles.textLabelSupporting, styles.mb2, styles.ph4, styles.pt4]}>{translate('common.to')}</Text>
                    <CalendarPicker
                        value={toValue}
                        onSelected={onToSelected}
                        minDate={toMinDate}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                        headerContainerStyle={styles.ph4}
                    />
                </View>
            </View>
        </View>
    );
}

export default RangeDatePicker;
