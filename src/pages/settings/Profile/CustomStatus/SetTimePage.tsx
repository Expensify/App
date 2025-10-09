import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TimePicker from '@components/TimePicker/TimePicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDraftCustomStatusCustomMode} from '@libs/actions/User';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SetTimePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [CustomStatusCustomMode] = useOnyx(ONYXKEYS.CUSTOM_STATUS_DRAFT_CUSTOM_MODE);
    const CustomStatusDate = CustomStatusCustomMode ?? '';

    const onSubmit = (time: string) => {
        updateDraftCustomStatusCustomMode(DateUtils.combineDateAndTime(time, CustomStatusDate));

        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={SetTimePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('statusPage.time')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER)}
            />
            <View style={styles.flex1}>
                <TimePicker
                    defaultValue={CustomStatusDate}
                    onSubmit={onSubmit}
                />
            </View>
        </ScreenWrapper>
    );
}

SetTimePage.displayName = 'SetTimePage';

export default SetTimePage;
