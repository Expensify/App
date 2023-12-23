import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TimePicker from '@components/TimePicker/TimePicker';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as User from '@libs/actions/User';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
};

function SetTimePage({translate, customStatus}) {
    const styles = useThemeStyles();
    const clearAfter = lodashGet(customStatus, 'clearAfter', '');

    const onSubmit = (time) => {
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
                    inputID="timePicker"
                    defaultValue={clearAfter}
                    style={styles.flexGrow1}
                    onSubmit={onSubmit}
                />
            </View>
        </ScreenWrapper>
    );
}

SetTimePage.propTypes = propTypes;
SetTimePage.displayName = 'SetTimePage';

export default compose(
    withLocalize,
    withOnyx({
        customStatus: {
            key: ONYXKEYS.CUSTOM_STATUS_DRAFT,
        },
    }),
)(SetTimePage);
