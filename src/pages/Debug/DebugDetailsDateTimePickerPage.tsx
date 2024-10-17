import {format} from 'date-fns';
import React, {useState} from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import TimePicker from '@components/TimePicker/TimePicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {DebugParamList} from '@libs/Navigation/types';
import {appendParam} from '@libs/Url';
import type SCREENS from '@src/SCREENS';

type DebugDetailsDateTimePickerPageProps = PlatformStackScreenProps<DebugParamList, typeof SCREENS.DEBUG.DETAILS_DATE_TIME_PICKER_PAGE>;

function DebugDetailsDateTimePickerPage({
    route: {
        params: {fieldName, fieldValue = '', backTo = ''},
    },
    navigation,
}: DebugDetailsDateTimePickerPageProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [date, setDate] = useState(DateUtils.extractDate(fieldValue));
    return (
        <ScreenWrapper testID={DebugDetailsDateTimePickerPage.displayName}>
            <HeaderWithBackButton title={fieldName} />
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
                        onSubmit={(time) => {
                            // Check the navigation state and "backTo" parameter to decide navigation behavior
                            if (navigation.getState().routes.length === 1 && !backTo) {
                                // If there is only one route and "backTo" is empty, go back in navigation
                                Navigation.goBack();
                            } else if (!!backTo && navigation.getState().routes.length === 1) {
                                // If "backTo" is not empty and there is only one route, go back to the specific route defined in "backTo" with a country parameter
                                Navigation.goBack(appendParam(backTo, fieldName, format(new Date(`${date} ${time}`), 'yyyy-MM-dd HH:mm:ss.SSS')));
                            } else {
                                // Otherwise, navigate to the specific route defined in "backTo" with a country parameter
                                Navigation.navigate(appendParam(backTo, fieldName, format(new Date(`${date} ${time}`), 'yyyy-MM-dd HH:mm:ss.SSS')));
                            }
                        }}
                        defaultValue={fieldValue}
                        shouldValidate={false}
                        showFullFormat
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

DebugDetailsDateTimePickerPage.displayName = 'DebugDetailsDateTimePickerPage';

export default DebugDetailsDateTimePickerPage;
