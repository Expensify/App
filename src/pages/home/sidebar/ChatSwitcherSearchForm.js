import _ from 'underscore';
import React from 'react';
import {
    Image,
    TouchableOpacity,
    View,
    Text
} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../../../styles/styles';
import themeColors from '../../../styles/themes/default';
import logoCircle from '../../../../assets/images/expensify-logo-round.png';
import TextInputWithFocusStyles from '../../../components/TextInputWithFocusStyles';
import iconX from '../../../../assets/images/icon-x.png';
import {getDisplayName} from '../../../libs/actions/PersonalDetails';
import PillWithCancelButton from '../../../components/PillWithCancelButton';
import ChatSwitcherOptionPropTypes from './ChatSwitcherOptionPropTypes';
import ChatSearchInput from '../../../components/ChatSearchInput';

const propTypes = {
    // A ref to forward to the text input
    forwardedRef: PropTypes.func.isRequired,

    // Whether or not the clear button is visible
    isClearButtonVisible: PropTypes.bool.isRequired,

    // Whether or not the logo is visible
    isLogoVisible: PropTypes.bool.isRequired,

    // The current value of the search input
    searchValue: PropTypes.string.isRequired,

    // A function to call when the text has changed in the input
    onChangeText: PropTypes.func.isRequired,

    // A function to call when the clear button is clicked
    onClearButtonClick: PropTypes.func.isRequired,

    // A function to call when the input has gotten focus
    onFocus: PropTypes.func.isRequired,

    // A function to call when a key has been pressed in the input
    onKeyPress: PropTypes.func.isRequired,

    // Remove selected user from group DM list
    onRemoveFromGroup: PropTypes.func.isRequired,

    // Begins / navigates to the chat between the various group users
    onConfirmUsers: PropTypes.func.isRequired,

    // Users selected to begin a group report DM
    usersToStartGroupReportWith: PropTypes.arrayOf(ChatSwitcherOptionPropTypes),
};

const defaultProps = {
    usersToStartGroupReportWith: [],
};

const ChatSwitcherSearchForm = props => (
    <View style={[styles.flexRow, styles.sidebarHeaderTop]}>
        {props.isLogoVisible && (
            <View style={[styles.mr3]}>
                <Image
                    resizeMode="contain"
                    style={[styles.sidebarHeaderLogo]}
                    source={logoCircle}
                />
            </View>
        )}

        {props.usersToStartGroupReportWith.length > 0
            ? (
                <View
                    style={[
                        styles.chatSwitcherGroupDMContainer,
                        styles.flex1,
                    ]}
                >
                    <View style={[styles.flexGrow1]}>
                        <View style={styles.chatSwitcherPillsInput}>
                            {_.map(props.usersToStartGroupReportWith, user => (
                                <View
                                    key={user.login}
                                    style={[styles.chatSwticherPillWrapper]}
                                >
                                    <PillWithCancelButton
                                        text={getDisplayName(user.login)}
                                        onCancel={() => props.onRemoveFromGroup(user)}
                                    />
                                </View>
                            ))}
                            <View
                                style={[
                                    styles.chatSwitcherInputGroup,
                                    styles.flexRow,
                                    styles.flexGrow1,
                                    styles.flexAlignSelfStretch,
                                ]}
                            >
                                <TextInputWithFocusStyles
                                    styleFocusIn={[styles.textInputNoOutline]}
                                    ref={props.forwardedRef}
                                    style={[styles.chatSwitcherGroupDMTextInput, styles.mb1]}
                                    value={props.searchValue}

                                    // We don't want to handle this blur event when
                                    // we are composing a group DM since it will reset
                                    // everything when we try to remove a user or start
                                    // the conversation
                                    // eslint-disable-next-line react/jsx-props-no-multi-spaces
                                    onChangeText={props.onChangeText}
                                    onFocus={props.onFocus}
                                    onKeyPress={props.onKeyPress}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={[styles.ml1, styles.flexJustifyEnd]}>
                        <TouchableOpacity
                            style={[styles.button, styles.buttonSmall, styles.buttonSuccess, styles.chatSwitcherGo]}
                            onPress={props.onConfirmUsers}
                            underlayColor={themeColors.componentBG}
                        >
                            <Text
                                style={[
                                    styles.buttonText,
                                    styles.buttonSmallText,
                                    styles.buttonSuccessText
                                ]}
                            >
                                Go
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
            : (
                <ChatSearchInput
                    ref={props.forwardedRef}
                    value={props.searchValue}
                    onChange={props.onChangeText}
                    onFocus={props.onFocus}
                    onKeyPress={props.onKeyPress}
                    placeholder="Find or start a chat"
                />
            )}

        {props.isClearButtonVisible && (
            <TouchableOpacity
                style={[styles.chatSwitcherInputClear, styles.ml2]}
                onPress={props.onClearButtonClick}
                underlayColor={themeColors.componentBG}
            >
                <Image
                    resizeMode="contain"
                    style={[styles.chatSwitcherInputClearIcon]}
                    source={iconX}
                />
            </TouchableOpacity>
        )}
    </View>
);

ChatSwitcherSearchForm.propTypes = propTypes;
ChatSwitcherSearchForm.defaultProps = defaultProps;
ChatSwitcherSearchForm.displayName = 'ChatSwitcherSearchForm';

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <ChatSwitcherSearchForm {...props} forwardedRef={ref} />
));
