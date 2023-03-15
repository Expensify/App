import lodashGet from 'lodash/get';
import React, {Component} from 'react';
import {Pressable, View} from 'react-native';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../../components/ScreenWrapper';
import HeaderWithCloseButton from '../../../components/HeaderWithCloseButton';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import ROUTES from '../../../ROUTES';
import Form from '../../../components/Form';
import ONYXKEYS from '../../../ONYXKEYS';
import CONST from '../../../CONST';
import * as ValidationUtils from '../../../libs/ValidationUtils';
import TextInput from '../../../components/TextInput';
import Text from '../../../components/Text';
import styles from '../../../styles/styles';
import Navigation from '../../../libs/Navigation/Navigation';
import * as PersonalDetails from '../../../libs/actions/PersonalDetails';
import compose from '../../../libs/compose';
import * as ErrorUtils from '../../../libs/ErrorUtils';
import Picker from '../../../components/Picker';
import * as Expensicons from '../../../components/Icon/Expensicons';
import variables from '../../../styles/variables';
import * as StyleUtils from '../../../styles/StyleUtils';
import getButtonState from '../../../libs/getButtonState';
import Icon from '../../../components/Icon';
import * as EmojiPickerAction from '../../../libs/actions/EmojiPickerAction';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class StatusPage extends Component {
    constructor(props) {
        super(props);

        this.validate = this.validate.bind(this);
        this.updateStatus = this.updateStatus.bind(this);
        this.emojiBtnRef = React.createRef();

        this.state = {
            emoji: lodashGet(props.currentUserPersonalDetails, ['status', 'emojiCode'], ''),
        };
    }

    updateStatus(values) {
        PersonalDetails.updateStatus(
            values.emoji,
            values.text,
            values.timeout,
        );
    }

    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.lastName
     * @returns {Object} - An object containing the errors for each inputID
     */
    validate(values) {
    }

    render() {
        const currentUserDetails = this.props.currentUserPersonalDetails || {};

        return (
            <ScreenWrapper includeSafeAreaPaddingBottom={false}>
                <HeaderWithCloseButton
                    title={this.props.translate('profilePage.status')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <Form
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.PERSONAL_DETAILS}
                    validate={this.validate}
                    onSubmit={this.updateStatus}
                    submitButtonText={this.props.translate('common.save')}
                    enabledWhenOffline
                >
                    <Text style={[styles.mb6]}>
                        Emoji
                    </Text>
                    <View ref={this.emojiBtnRef} style={styles.mb4}>
                        <Pressable
                            onPress={() => {
                                EmojiPickerAction.showEmojiPicker(
                                    () => {},
                                    (emoji) => {
                                        this.setState({emoji});
                                    },
                                    this.emojiBtnRef.current,
                                );
                            }}
                            style={{
                                borderWidth: 1,
                                borderRadius: 5,
                                width: 30,
                                height: 30,
                            }}
                        >
                            {({hovered, pressed}) => (
                                this.state.emoji === '' ? (
                                    <Icon
                                        src={Expensicons.Emoji}
                                        width={24}
                                        height={24}
                                        fill={StyleUtils.getIconFillColor(
                                            getButtonState(hovered, pressed),
                                        )}
                                    />
                                ) : (
                                    <Text style={{fontSize: 24}}>
                                        {this.state.emoji}
                                    </Text>
                                )
                            )}
                        </Pressable>
                    </View>
                    <View>
                        <TextInput
                            inputID="text"
                            label="Status"
                            placeholder="What's your status?"
                        />
                    </View>
                    <View>
                        {/* <Picker
                            inputID="timeout"
                            name="timeout"
                            label={this.props.translate('common.lastName')}
                            defaultValue={lodashGet(currentUserDetails, 'lastName', '')}
                            placeholder={this.props.translate('displayNamePage.doe')}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        /> */}
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

StatusPage.propTypes = propTypes;
StatusPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
)(StatusPage);
