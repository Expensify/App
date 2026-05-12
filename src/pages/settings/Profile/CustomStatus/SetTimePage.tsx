import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import TimePicker from '@components/TimePicker/TimePicker';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateStatusDraftCustomClearAfterDate} from '@libs/actions/User';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

function SetTimePage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [statusDraftCustomClearAfterDate] = useOnyx(ONYXKEYS.STATUS_DRAFT_CUSTOM_CLEAR_AFTER_DATE);
    const customStatusClearAfterDate = statusDraftCustomClearAfterDate ?? '';

    const onSubmit = (time: string) => {
        updateStatusDraftCustomClearAfterDate(DateUtils.combineDateAndTime(time, customStatusClearAfterDate));

        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="SetTimePage"
        >
            <HeaderWithBackButton
                title={translate('statusPage.time')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER)}
            />
            <ScrollView
                style={styles.flex1}
                contentContainerStyle={styles.flexGrow1}
            >
                <TimePicker
                    defaultValue={customStatusClearAfterDate}
                    onSubmit={onSubmit}
                />
            </ScrollView>
        </ScreenWrapper>
    );
}

export default SetTimePage;
