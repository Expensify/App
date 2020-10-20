import React from 'react';
import {Image, TouchableOpacity, View} from 'react-native';
import PropTypes from 'prop-types';
import styles, {colors} from '../../../styles/StyleSheet';
import logoCircle from '../../../../assets/images/expensify-logo-round.png';
import TextInputWithFocusStyles from '../../../components/TextInputWithFocusStyles';
import iconX from '../../../../assets/images/icon-x.png';

const propTypes = {
    // A ref to forward to the text input
    forwardedRef: PropTypes.func.isRequired,

    // Whether or not the clear button is visible
    isClearButtonVisible: PropTypes.bool.isRequired,

    // Whether or not the logo is visible
    isLogoVisible: PropTypes.bool.isRequired,

    // The current value of the search input
    searchValue: PropTypes.string.isRequired,

    // A function to call when the input has been blurred
    onBlur: PropTypes.func.isRequired,

    // A function to call when the text has changed in the input
    onChangeText: PropTypes.func.isRequired,

    // A function to call when the clear button is clicked
    onClearButtonClick: PropTypes.func.isRequired,

    // A function to call when the input has gotten focus
    onFocus: PropTypes.func.isRequired,

    // A function to call when a key has been pressed in the input
    onKeyPress: PropTypes.func.isRequired,
};

const ChatSwitcherSearchForm = props => (
    <View style={[styles.flexRow, styles.mb4]}>
        {props.isLogoVisible && (
            <View style={[styles.mr2, styles.ml2]}>
                <Image
                    resizeMode="contain"
                    style={[styles.sidebarHeaderLogo]}
                    source={logoCircle}
                />
            </View>
        )}

        <TextInputWithFocusStyles
            styleFocusIn={[styles.textInputReversedFocus]}
            ref={props.forwardedRef}
            style={[styles.textInput, styles.textInputReversed, styles.flex1, styles.mr2]}
            value={props.searchValue}
            onBlur={props.onBlur}
            onChangeText={props.onChangeText}
            onFocus={props.onFocus}
            onKeyPress={props.onKeyPress}
            placeholder="Find or start a chat"
            placeholderTextColor={colors.icon}
        />

        {props.isClearButtonVisible && (
            <TouchableOpacity
                style={[styles.chatSwitcherInputClear]}
                onPress={props.onClearButtonClick}
                underlayColor={colors.componentBG}
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
ChatSwitcherSearchForm.displayName = 'ChatSwitcherSearchForm';

export default React.forwardRef((props, ref) => (
    /* eslint-disable-next-line react/jsx-props-no-spreading */
    <ChatSwitcherSearchForm {...props} forwardedRef={ref} />
));
