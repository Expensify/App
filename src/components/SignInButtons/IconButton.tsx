import Icon from '@components/Icon';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {ValueOf} from 'type-fest';

import React from 'react';

type IconButtonProps = {
    onPress?: () => void;
    provider: ValueOf<typeof CONST.SIGN_IN_METHOD>;
};

function IconButton({onPress = () => {}, provider}: IconButtonProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const icons = useMemoizedLazyExpensifyIcons(['AppleLogo', 'GoogleLogo']);

    const providerData = {
        [CONST.SIGN_IN_METHOD.APPLE]: {
            icon: icons.AppleLogo,
            accessibilityLabel: 'common.signInWithApple' as const,
            sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.PROVIDER_BUTTON.APPLE,
        },
        [CONST.SIGN_IN_METHOD.GOOGLE]: {
            icon: icons.GoogleLogo,
            accessibilityLabel: 'common.signInWithGoogle' as const,
            sentryLabel: CONST.SENTRY_LABEL.SIGN_IN.PROVIDER_BUTTON.GOOGLE,
        },
    } satisfies Record<
        ValueOf<typeof CONST.SIGN_IN_METHOD>,
        {
            icon: IconAsset;
            accessibilityLabel: TranslationPaths;
            sentryLabel: SentryLabel;
        }
    >;

    return (
        <PressableWithoutFeedback
            sentryLabel={providerData[provider].sentryLabel}
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

export default IconButton;
