import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TimePicker from '@components/TimePicker';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useLocalize from '@hooks/useLocalize';
import usePrivatePersonalDetails from '@hooks/usePrivatePersonalDetails';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as User from '@libs/actions/User';
import compose from '@libs/compose';
import DateUtils from '@libs/DateUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import styles from '@styles/styles';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
};

function SetTimePage({translate, privatePersonalDetails, customStatus}) {
    usePrivatePersonalDetails();
    const {isExtraSmallScreenHeight} = useWindowDimensions();
    const localize = useLocalize();
    const clearAfter = lodashGet(customStatus, 'clearAfter', '');

    const onSubmit = ({timePicker}) => {
        const timeToUse = DateUtils.combineDateAndTime(timePicker, clearAfter);

        User.updateDraftCustomStatus({clearAfter: timeToUse});
        Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER);
    };
    const validate = (v) => {
        const error = {};

        if (!ValidationUtils.isTimeAtLeastOneMinuteInFuture(v.timePicker, clearAfter)) {
            error.timePicker = localize.translate('common.error.invalidTimeShouldBeFuture');
        }

        return error;
    };

    if (lodashGet(privatePersonalDetails, 'isLoading', true)) {
        return <FullscreenLoadingIndicator />;
    }
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={SetTimePage.displayName}
        >
            <HeaderWithBackButton
                title={translate('statusPage.time')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS_CLEAR_AFTER)}
            />
            <View style={styles.flex1}>
                <Form
                    style={[styles.flexGrow1]}
                    formID={ONYXKEYS.FORMS.SETTINGS_STATUS_SET_TIME_FORM}
                    onSubmit={onSubmit}
                    submitButtonText={translate('common.save')}
                    submitButtonStyles={[styles.flex0, styles.justifyContentStart, styles.mh5, styles.setTimeFormButtonContainer]}
                    errorMessageStyle={styles.timePickerButtonErrorText}
                    validate={validate}
                    enabledWhenOffline
                    shouldUseDefaultValue
                    useSmallerSubmitButtonSize={isExtraSmallScreenHeight}
                >
                    <TimePicker
                        inputID="timePicker"
                        defaultValue={DateUtils.extractTime12Hour(clearAfter)}
                        style={styles.flexGrow1}
                    />
                </Form>
            </View>
        </ScreenWrapper>
    );
}

SetTimePage.propTypes = propTypes;
SetTimePage.displayName = 'SetTimePage';

export default compose(
    withLocalize,
    withOnyx({
        privatePersonalDetails: {
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
        },
        customStatus: {
            key: ONYXKEYS.CUSTOM_STATUS_DRAFT,
        },
    }),
)(SetTimePage);
