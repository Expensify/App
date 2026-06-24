import React, {useContext} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated from 'react-native-reanimated';
import type {AnimatedStyle} from 'react-native-reanimated';
import LoadingBar from '@components/LoadingBar';
import {PressableWithoutFeedback} from '@components/Pressable';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import SidePanelButton from '@components/SidePanel/SidePanelButton';
import Text from '@components/Text';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import Navigation from '@libs/Navigation/Navigation';
import NavigationTabBarAvatar from '@pages/inbox/sidebar/NavigationTabBarAvatar';
import SignInButton from '@pages/inbox/sidebar/SignInButton';
import variables from '@styles/variables';
import {isAnonymousUser as isAnonymousUserUtil} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Session} from '@src/types/onyx';
import GlobalNavBarHeightContext from './GlobalNavBar/GlobalNavBarHeightContext';

type TopBarProps = {
    breadcrumbLabel: string;
    shouldDisplaySearch?: boolean;
    shouldDisplayHelpButton?: boolean;
    shouldShowLoadingBar?: boolean;
    cancelSearch?: () => void;
    children?: React.ReactNode;

    /** Drop the default horizontal margin on the breadcrumb row. */
    shouldRemoveHorizontalMargin?: boolean;

    /** Show the account avatar on the right (narrow only — wide layouts use the global nav bar). */
    shouldDisplayAccountAvatar?: boolean;

    /** Whether the account avatar should render in the selected/active state (green ring). */
    isAccountAvatarSelected?: boolean;

    breadcrumbAnimatedStyle?: StyleProp<AnimatedStyle<ViewStyle>>;
};

const authTokenTypeSelector = (session: OnyxEntry<Session>) => session && {authTokenType: session.authTokenType};

function TopBar({
    breadcrumbLabel,
    shouldDisplaySearch = true,
    shouldDisplayHelpButton = false,
    cancelSearch,
    shouldShowLoadingBar,
    children,
    shouldRemoveHorizontalMargin = false,
    shouldDisplayAccountAvatar = false,
    isAccountAvatarSelected = false,
    breadcrumbAnimatedStyle,
}: TopBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const isAnonymousUser = isAnonymousUserUtil(session);

    const isInLandscapeMode = useIsInLandscapeMode();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {wideRHPRouteKeys} = useWideRHPState();
    const isWideRHPVisible = !!wideRHPRouteKeys.length;
    const isGlobalNavBarVisible = useContext(GlobalNavBarHeightContext) > 0;

    const displaySignIn = isAnonymousUser;
    const displaySearch = !isAnonymousUser && shouldDisplaySearch && !isGlobalNavBarVisible;
    const displayHelpButton = shouldDisplayHelpButton && !isGlobalNavBarVisible;
    const displayAccountAvatar = shouldDisplayAccountAvatar && shouldUseNarrowLayout && !isAnonymousUser;

    return (
        <View style={[styles.w100, styles.zIndex10]}>
            <View
                style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.justifyContentBetween,
                    !shouldRemoveHorizontalMargin && styles.ml5,
                    !shouldRemoveHorizontalMargin && styles.mr5,
                    shouldRemoveHorizontalMargin && {
                        width: '100%',
                        maxWidth: variables.contentMaxWidth,
                        alignSelf: 'center',
                        paddingHorizontal: 20,
                    },
                    styles.headerBarHeight,
                ]}
                dataSet={{dragArea: true}}
                onTouchStart={isInLandscapeMode ? () => Keyboard.dismiss() : undefined}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.pr2]}>
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
                {displayHelpButton && <SidePanelButton />}
                {displayAccountAvatar && (
                    <NavigationTabBarAvatar
                        isSelected={isAccountAvatarSelected}
                        onPress={() => interceptAnonymousUser(() => Navigation.navigate(ROUTES.SETTINGS))}
                        shouldShowLabel={false}
                        wrapperStyle={[styles.alignItemsCenter, {marginLeft: 10}]}
                        shouldShowHoverBackground={false}
                    />
                )}
            </View>
            <LoadingBar shouldShow={!isWideRHPVisible && !!shouldShowLoadingBar} />
        </View>
    );
}

export type {TopBarProps};

export default TopBar;
