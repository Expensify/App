import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import EmojiPickerButtonDropdown from '@components/EmojiPicker/EmojiPickerButtonDropdown';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import compose from '@libs/compose';
import Navigation from '@libs/Navigation/Navigation';
import useThemeStyles from '@styles/useThemeStyles';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    /** The draft status of the user */
    // eslint-disable-next-line react/require-default-props
    draftStatus: PropTypes.shape({
        /** The emoji code of the draft status */
        emojiCode: PropTypes.string,
        /** The text of the draft status */
        text: PropTypes.string,
    }),

    ...withCurrentUserPersonalDetailsPropTypes,
};

const INPUT_IDS = {
    EMOJI_CODE: 'emojiCode',
    STATUS_TEXT: 'statusText',
};

function StatusSetPage({draftStatus, currentUserPersonalDetails}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const defaultEmoji = lodashGet(draftStatus, 'emojiCode') || lodashGet(currentUserPersonalDetails, 'status.emojiCode', '💬');
    const defaultText = lodashGet(draftStatus, 'text') || lodashGet(currentUserPersonalDetails, 'status.text', '');

    const onSubmit = (value) => {
        User.updateDraftCustomStatus({text: value.statusText.trim(), emojiCode: value.emojiCode});
        Navigation.goBack(ROUTES.SETTINGS_STATUS);
    };

    return (
        <ScreenWrapper testID={StatusSetPage.displayName}>
            <HeaderWithBackButton
                title={translate('statusPage.status')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM}
                style={[styles.flexGrow1, styles.ph5]}
                submitButtonText={translate('statusPage.save')}
                onSubmit={onSubmit}
                enabledWhenOffline
            >
                <View>
                    <View style={[styles.mb4]}>
                        <View style={[styles.mt1]}>
                            <InputWrapper
                                InputComponent={EmojiPickerButtonDropdown}
                                inputID={INPUT_IDS.EMOJI_CODE}
                                aria-label={INPUT_IDS.EMOJI_CODE}
                                defaultValue={defaultEmoji}
                            />
                        </View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.STATUS_TEXT}
                            label={translate('statusPage.message')}
                            aria-label={INPUT_IDS.STATUS_TEXT}
                            role={CONST.ACCESSIBILITY_ROLE.TEXT}
                            defaultValue={defaultText}
                            maxLength={CONST.STATUS_TEXT_MAX_LENGTH}
                            autoFocus
                            shouldDelayFocus
                        />
                    </View>
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

StatusSetPage.displayName = 'StatusSetPage';
StatusSetPage.propTypes = propTypes;

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        draftStatus: {
            key: ONYXKEYS.CUSTOM_STATUS_DRAFT,
        },
    }),
)(StatusSetPage);
