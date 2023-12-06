import PropTypes from 'prop-types';
import React from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import CONST from '@src/CONST';

const propTypes = {
    /** The on press method */
    onPress: PropTypes.func,

    /** Which provider you are using to sign in */
    provider: PropTypes.string.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    onPress: () => {},
};

const providerData = {
    [CONST.SIGN_IN_METHOD.APPLE]: {
        icon: Expensicons.AppleLogo,
        accessibilityLabel: 'common.signInWithApple',
    },
    [CONST.SIGN_IN_METHOD.GOOGLE]: {
        icon: Expensicons.GoogleLogo,
        accessibilityLabel: 'common.signInWithGoogle',
    },
};

function IconButton({onPress, translate, provider}) {
    const styles = useThemeStyles();
    return (
        <PressableWithoutFeedback
            onPress={onPress}
            style={styles.signInIconButton}
            role={CONST.ACCESSIBILITY_ROLE.BUTTON}
            accessibilityLabel={translate(providerData[provider].accessibilityLabel)}
        >
            <Icon
                src={providerData[provider].icon}
                height={40}
                width={40}
            />
        </PressableWithoutFeedback>
    );
}

IconButton.displayName = 'IconButton';
IconButton.propTypes = propTypes;
IconButton.defaultProps = defaultProps;

export default withLocalize(IconButton);
