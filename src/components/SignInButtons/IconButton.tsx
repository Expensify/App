import React from 'react';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

const providerData = {
    [CONST.SIGN_IN_METHOD.APPLE]: {
        icon: Expensicons.AppleLogo,
        accessibilityLabel: 'common.signInWithApple',
    },
    [CONST.SIGN_IN_METHOD.GOOGLE]: {
        icon: Expensicons.GoogleLogo,
        accessibilityLabel: 'common.signInWithGoogle',
    },
} satisfies Record<
    ValueOf<typeof CONST.SIGN_IN_METHOD>,
    {
        icon: IconAsset;
        accessibilityLabel: TranslationPaths;
    }
>;

type IconButtonProps = {
    onPress?: () => void;
    provider: ValueOf<typeof CONST.SIGN_IN_METHOD>;
};

function IconButton({onPress = () => {}, provider}: IconButtonProps) {
    const {translate} = useLocalize();
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

export default IconButton;
