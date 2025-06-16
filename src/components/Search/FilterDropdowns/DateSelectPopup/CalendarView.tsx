import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import CalendarPicker from '@components/DatePicker/CalendarPicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {SearchDateModifier, SearchDateModifierLower} from '@libs/SearchUIUtils';
import CONST from '@src/CONST';

type CalendarViewProps = {
    view: SearchDateModifier;
    value: string | null;
    navigateBack: () => void;
    setValue: (key: SearchDateModifier, value: string | null) => void;
};

function CalendarView({view, value, navigateBack, setValue}: CalendarViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [localDateValue, setLocalDateValue] = useState(value);

    const lowerDateModifier = view.toLowerCase() as SearchDateModifierLower;

    const resetChanges = () => {
        setValue(view, null);
        navigateBack();
    };

    const saveChanges = () => {
        setValue(view, localDateValue);
        navigateBack();
    };

    return (
        <View style={[!shouldUseNarrowLayout && styles.pv4]}>
            <HeaderWithBackButton
                shouldDisplayHelpButton={false}
                style={[styles.h10, styles.pb3]}
                subtitle={translate(`common.${lowerDateModifier}`)}
                onBackButtonPress={navigateBack}
            />

            <CalendarPicker
                value={localDateValue ?? undefined}
                onSelected={setLocalDateValue}
                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                minDate={CONST.CALENDAR_PICKER.MIN_DATE}
            />

            <View style={[styles.flexRow, styles.gap2, styles.ph5, styles.pt2]}>
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
                    text={translate('common.save')}
                    onPress={saveChanges}
                />
            </View>
        </View>
    );
}

CalendarView.displayName = 'CalendarView';
export default CalendarView;
