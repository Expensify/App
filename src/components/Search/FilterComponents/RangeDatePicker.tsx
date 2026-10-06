import CalendarPicker from '@components/DatePicker/CalendarPicker';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import {format, max, min} from 'date-fns';
import React from 'react';
import {View} from 'react-native';

type RangeDatePickerProps = {
    fromValue?: string;
    toValue?: string;
    onFromSelected: (date: string) => void;
    onToSelected: (date: string) => void;

    /** Force vertical stacking of calendars */
    forceVertical?: boolean;
};

function RangeDatePicker({fromValue, toValue, onFromSelected, onToSelected, forceVertical = false}: RangeDatePickerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const shouldStack = forceVertical || isSmallScreenWidth;
    const fromDate = DateUtils.parseCalendarDate(fromValue);
    const toDate = DateUtils.parseCalendarDate(toValue);
    // A calendar reads defaultMonth only when it mounts, so an empty end remounts when the other end changes and opens on the new defaultMonth.
    const fromCalendarKey = fromDate ? 'from' : `from-${toValue ?? ''}`;
    const toCalendarKey = toDate ? 'to' : `to-${fromValue ?? ''}`;

    return (
        <View style={[!shouldStack && styles.flexRow, !shouldStack && styles.alignItemsStretch, styles.mh5, isSmallScreenWidth && styles.mt3]}>
            <View style={[!shouldStack && styles.flex1, !shouldStack && styles.mr2]}>
                <View style={[styles.borderedContentCard, !shouldStack && styles.flex1]}>
                    <Text style={[styles.textLabelSupporting, styles.mb2, styles.ph4, styles.pt4]}>{translate('common.from')}</Text>
                    <CalendarPicker
                        key={fromCalendarKey}
                        value={fromDate}
                        defaultMonth={toDate && min([new Date(), toDate])}
                        onSelected={(date) => onFromSelected(format(date, CONST.DATE.FNS_FORMAT_STRING))}
                        isDateSelectable={(date) => DateUtils.isWithinCalendarPickerRange(date) && (!toDate || date <= toDate)}
                        headerContainerStyle={styles.ph4}
                    />
                </View>
            </View>

            <View style={[!shouldStack && styles.flex1, !shouldStack && styles.ml2, shouldStack && styles.mt4]}>
                <View style={[styles.borderedContentCard, !shouldStack && styles.flex1]}>
                    <Text style={[styles.textLabelSupporting, styles.mb2, styles.ph4, styles.pt4]}>{translate('common.to')}</Text>
                    <CalendarPicker
                        key={toCalendarKey}
                        value={toDate}
                        defaultMonth={fromDate && max([new Date(), fromDate])}
                        onSelected={(date) => onToSelected(format(date, CONST.DATE.FNS_FORMAT_STRING))}
                        isDateSelectable={(date) => DateUtils.isWithinCalendarPickerRange(date) && (!fromDate || date >= fromDate)}
                        headerContainerStyle={styles.ph4}
                    />
                </View>
            </View>
        </View>
    );
}

export default RangeDatePicker;
