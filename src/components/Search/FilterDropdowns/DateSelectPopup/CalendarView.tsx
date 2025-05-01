import React, {useState} from 'react';
import {View} from 'react-native';
import type {ValueOf} from 'type-fest';
import Button from '@components/Button';
import DatePicker from '@components/DatePicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type CONST from '@src/CONST';

type CalendarViewProps = {
    view: ValueOf<typeof CONST.SEARCH.DATE_FILTERS>;
    value: string | null;
    navigateBack: () => void;
    setValue: (key: ValueOf<typeof CONST.SEARCH.DATE_FILTERS>, value: string | null) => void;
};

function CalendarView({view, value, navigateBack, setValue}: CalendarViewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [localDateValue, setLocalDateValue] = useState(value);

    const resetChanges = () => {
        setValue(view, null);
        navigateBack();
    };

    const saveChanges = () => {
        setValue(view, localDateValue);
        navigateBack();
    };

    return (
        <View style={[styles.pv4, styles.gap4]}>
            <HeaderWithBackButton
                style={[styles.h10]}
                onBackButtonPress={navigateBack}
            />

            <View style={[styles.ph5]}>
                <DatePicker
                    inputID="dateSelectPopup"
                    value={localDateValue ?? undefined}
                    label={translate(`common.${view}`)}
                    onInputChange={(date) => setLocalDateValue(date)}
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
                    text={translate('common.save')}
                    onPress={saveChanges}
                />
            </View>
        </View>
    );
}

CalendarView.displayName = 'CalendarView';
export default CalendarView;
