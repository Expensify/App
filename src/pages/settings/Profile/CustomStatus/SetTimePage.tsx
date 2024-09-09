import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TimePicker from '@components/TimePicker/TimePicker';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@libs/actions/User';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';

type SetTimePageOnyxProps = {
    customStatus: OnyxEntry<OnyxTypes.CustomStatusDraft>;
};

type SetTimePageProps = SetTimePageOnyxProps;

function SetTimePage({customStatus}: SetTimePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const clearAfter = customStatus?.clearAfter ?? '';

    const onSubmit = (time: string) => {
        const timeToUse = DateUtils.combineDateAndTime(time, clearAfter);

        User.updateDraftCustomStatus({clearAfter: timeToUse});
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
                    defaultValue={clearAfter}
                    onSubmit={onSubmit}
                />
            </View>
        </ScreenWrapper>
    );
}

SetTimePage.displayName = 'SetTimePage';

export default withOnyx<SetTimePageProps, SetTimePageOnyxProps>({
    customStatus: {
        key: ONYXKEYS.CUSTOM_STATUS_DRAFT,
    },
})(SetTimePage);
