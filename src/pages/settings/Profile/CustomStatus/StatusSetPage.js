import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import Form from '../../../../components/Form';
import HeaderWithBackButton from '../../../../components/HeaderWithBackButton';
import ROUTES from '../../../../ROUTES';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Navigation from '../../../../libs/Navigation/Navigation';
import compose from '../../../../libs/compose';
import styles from '../../../../styles/styles';
import useLocalize from '../../../../hooks/useLocalize';
import CONST from '../../../../CONST';
import EmojiPickerButtonDropdown from '../../../../components/EmojiPicker/EmojiPickerButtonDropdown';
import ONYXKEYS from '../../../../ONYXKEYS';
import * as User from '../../../../libs/actions/User';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes} from '../../../../components/withCurrentUserPersonalDetails';
import TextInput from '../../../../components/TextInput';

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
    const {translate} = useLocalize();
    const defaultEmoji = lodashGet(draftStatus, 'emojiCode') || lodashGet(currentUserPersonalDetails, 'status.emojiCode', '💬');
    const defaultText = lodashGet(draftStatus, 'text') || lodashGet(currentUserPersonalDetails, 'status.text', '');

    const onSubmit = (value) => {
        User.updateDraftCustomStatus({text: value.statusText, emojiCode: value.emojiCode});
        Navigation.goBack(ROUTES.SETTINGS_STATUS);
    };

    return (
        <ScreenWrapper>
            <HeaderWithBackButton
                title={translate('statusPage.status')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_STATUS)}
            />
            <Form
                formID={ONYXKEYS.FORMS.SETTINGS_STATUS_SET_FORM}
                style={[styles.flexGrow1, styles.ph5]}
                submitButtonText="Save"
                onSubmit={onSubmit}
                enabledWhenOffline
            >
                <View>
                    <View style={[styles.mb4]}>
                        <View style={[styles.mt1]}>
                            <EmojiPickerButtonDropdown
                                inputID={INPUT_IDS.EMOJI_CODE}
                                accessibilityLabel={INPUT_IDS.EMOJI_CODE}
                                defaultValue={defaultEmoji}
                            />
                        </View>
                        <TextInput
                            inputID={INPUT_IDS.STATUS_TEXT}
                            label={translate('statusPage.message')}
                            accessibilityLabel={INPUT_IDS.STATUS_TEXT}
                            accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                            defaultValue={defaultText}
                            maxLength={100}
                            autoFocus
                            shouldDelayFocus
                        />
                    </View>
                </View>
            </Form>
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
