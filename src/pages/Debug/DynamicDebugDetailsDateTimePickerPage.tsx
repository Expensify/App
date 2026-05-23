import {format} from 'date-fns';
import React, {useState} from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TimePicker from '@components/TimePicker/TimePicker';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import {appendParam} from '@libs/Url';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type DynamicDebugDetailsDateTimePickerPageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.DYNAMIC_DETAILS_DATE_TIME_PICKER_PAGE>;

function DynamicDebugDetailsDateTimePickerPage({
    route: {
        params: {fieldName, fieldValue = ''},
    },
}: DynamicDebugDetailsDateTimePickerPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.DETAILS_DATE_TIME_PICKER.path);
    const [date, setDate] = useState(() => DateUtils.extractDate(fieldValue));

    const handleSubmit = (time: string) => {
        const formattedDateTime = format(new Date(`${date} ${time}`), 'yyyy-MM-dd HH:mm:ss.SSS');
        Navigation.goBack(appendParam(backPath, fieldName ?? '', formattedDateTime), {compareParams: false});
    };

    return (
        <ScreenWrapper testID="DynamicDebugDetailsDateTimePickerPage">
            <HeaderWithBackButton
                title={fieldName}
                shouldShowBackButton
                onBackButtonPress={() => {
                    Navigation.goBack(fieldValue ? appendParam(backPath, fieldName, fieldValue) : backPath, {compareParams: false});
                }}
            />
            <ScrollView contentContainerStyle={styles.gap8}>
                <View style={styles.ph5}>
                    <Text style={styles.headerText}>{translate('debug.date')}</Text>
                    <DatePicker
                        inputID=""
                        value={date}
                        onInputChange={setDate}
                    />
                </View>
                <View>
                    <Text style={[styles.headerText, styles.ph5]}>{translate('debug.time')}</Text>
                    <TimePicker
                        onSubmit={handleSubmit}
                        defaultValue={fieldValue}
                        shouldValidate={false}
                        showFullFormat
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default DynamicDebugDetailsDateTimePickerPage;
