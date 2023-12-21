import React from 'react';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import withLocalize, {WithLocalizeProps} from '@components/withLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {TranslationPaths} from '@src/languages/types';

const providerData = {
    [CONST.SIGN_IN_METHOD.APPLE]: {
        icon: Expensicons.AppleLogo,
        accessibilityLabel: 'common.signInWithApple' as TranslationPaths,
    },
    [CONST.SIGN_IN_METHOD.GOOGLE]: {
        icon: Expensicons.GoogleLogo,
        accessibilityLabel: 'common.signInWithGoogle' as TranslationPaths,
    },
};

type IconButtonProps = WithLocalizeProps & {
    onPress: () => void;
    provider: keyof typeof providerData;
};

function IconButton({onPress, provider, translate}: IconButtonProps) {
    const styles = useThemeStyles();
    return (
        <PressableWithoutFeedback
            onPress={onPress}
            style={styles.signInIconButton}
            role={CONST.ROLE.BUTTON}
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

export default withLocalize(IconButton);
