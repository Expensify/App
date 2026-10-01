import Icon from '@components/Icon';
import LoadingBar from '@components/LoadingBar';
import {PressableWithoutFeedback} from '@components/Pressable';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import SidePanelButton from '@components/SidePanel/SidePanelButton';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import {useWideRHPState} from '@components/WideRHPContextProvider';

import useContentHeaderHeight from '@hooks/useContentHeaderHeight';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import SignInButton from '@pages/inbox/sidebar/SignInButton';

import {isAnonymousUser as isAnonymousUserUtil} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';

import type {StyleProp, ViewStyle} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {AnimatedStyle} from 'react-native-reanimated';

import React from 'react';
import {Keyboard, View} from 'react-native';
import Animated from 'react-native-reanimated';

import AccountAvatarButton from './AccountAvatarButton';

type TopBarProps = {
    breadcrumbLabel: string;
    shouldDisplaySearch?: boolean;
    shouldDisplayHelpButton?: boolean;
    shouldShowLoadingBar?: boolean;
    cancelSearch?: () => void;
    children?: React.ReactNode;
    breadcrumbAnimatedStyle?: StyleProp<AnimatedStyle<ViewStyle>>;

    /** Renders a back arrow before the label. Used where a tab root was reached from another page, such as More. */
    onBackButtonPress?: () => void;
};

const authTokenTypeSelector = (session: OnyxEntry<Session>) => session && {authTokenType: session.authTokenType};

function TopBar({
    breadcrumbLabel,
    shouldDisplaySearch = true,
    shouldDisplayHelpButton = false,
    cancelSearch,
    shouldShowLoadingBar,
    children,
    breadcrumbAnimatedStyle,
    onBackButtonPress,
}: TopBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['BackArrow']);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const isAnonymousUser = isAnonymousUserUtil(session);

    const isInLandscapeMode = useIsInLandscapeMode();
    const {contentHeaderHeightStyle} = useContentHeaderHeight();
    const {wideRHPRouteKeys} = useWideRHPState();
    const isWideRHPVisible = !!wideRHPRouteKeys.length;

    const displaySignIn = isAnonymousUser;
    const displaySearch = !isAnonymousUser && shouldDisplaySearch;

    return (
        <View style={[styles.w100, styles.zIndex10]}>
            <View
                style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, onBackButtonPress ? styles.ml2 : styles.ml5, styles.mr3, contentHeaderHeightStyle]}
                dataSet={{dragArea: true}}
                onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.pr2]}>
                    {!!onBackButtonPress && (
                        <Tooltip text={translate('common.back')}>
                            <PressableWithoutFeedback
                                onPress={onBackButtonPress}
                                accessibilityLabel={translate('common.back')}
                                role={CONST.ROLE.BUTTON}
                                style={[styles.touchableButtonImage]}
                                sentryLabel={CONST.SENTRY_LABEL.TOP_BAR.BACK_BUTTON}
                            >
                                <Icon
                                    src={icons.BackArrow}
                                    fill={theme.icon}
                                />
                            </PressableWithoutFeedback>
                        </Tooltip>
                    )}
                    <Animated.View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, breadcrumbAnimatedStyle]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.flexShrink1, styles.topBarLabel]}
                            accessibilityRole={CONST.ROLE.HEADER}
                        >
                            {breadcrumbLabel}
                        </Text>
                    </Animated.View>
                </View>
                {children}
                {displaySignIn && <SignInButton />}
                {!!cancelSearch && (
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('common.cancel')}
                        style={styles.textBlue}
                        sentryLabel={CONST.SENTRY_LABEL.TOP_BAR.CANCEL_BUTTON}
                        onPress={() => {
                            cancelSearch();
                        }}
                    >
                        <Text style={[styles.textBlue]}>{translate('common.cancel')}</Text>
                    </PressableWithoutFeedback>
                )}
                {displaySearch && <SearchButton />}
                {shouldDisplayHelpButton && <SidePanelButton />}
                <AccountAvatarButton />
            </View>
            <LoadingBar shouldShow={!isWideRHPVisible && !!shouldShowLoadingBar} />
        </View>
    );
}

export type {TopBarProps};

export default TopBar;
