import React, {useMemo} from 'react';
import type {ValueOf} from 'type-fest';
import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

type IconButtonProps = {
    onPress?: () => void;
    provider: ValueOf<typeof CONST.SIGN_IN_METHOD>;
};

function IconButton({onPress = () => {}, provider}: IconButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['AppleLogo', 'GoogleLogo'] as const);

    const providerData = useMemo(
        () =>
            ({
                [CONST.SIGN_IN_METHOD.APPLE]: {
                    icon: icons.AppleLogo,
                    accessibilityLabel: 'common.signInWithApple' as const,
                },
                [CONST.SIGN_IN_METHOD.GOOGLE]: {
                    icon: icons.GoogleLogo,
                    accessibilityLabel: 'common.signInWithGoogle' as const,
                },
            }) satisfies Record<
                ValueOf<typeof CONST.SIGN_IN_METHOD>,
                {
                    icon: IconAsset;
                    accessibilityLabel: TranslationPaths;
                }
            >,
        [icons.AppleLogo, icons.GoogleLogo],
    );

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
