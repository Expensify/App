import React, {useContext} from 'react';
import {Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Animated from 'react-native-reanimated';
import type {AnimatedStyle, StyleProps} from 'react-native-reanimated';
import LoadingBar from '@components/LoadingBar';
import {PressableWithoutFeedback} from '@components/Pressable';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import SidePanelButton from '@components/SidePanel/SidePanelButton';
import Text from '@components/Text';
import {useWideRHPState} from '@components/WideRHPContextProvider';
import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import SignInButton from '@pages/inbox/sidebar/SignInButton';
import variables from '@styles/variables';
import {isAnonymousUser as isAnonymousUserUtil} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
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

    breadcrumbAnimatedStyle?: AnimatedStyle<StyleProps>;
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
    breadcrumbAnimatedStyle,
}: TopBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const isAnonymousUser = isAnonymousUserUtil(session);

    const isInLandscapeMode = useIsInLandscapeMode();
    const {wideRHPRouteKeys} = useWideRHPState();
    const isWideRHPVisible = !!wideRHPRouteKeys.length;
    const isGlobalNavBarVisible = useContext(GlobalNavBarHeightContext) > 0;

    const displaySignIn = isAnonymousUser;
    const displaySearch = !isAnonymousUser && shouldDisplaySearch && !isGlobalNavBarVisible;
    const displayHelpButton = shouldDisplayHelpButton && !isGlobalNavBarVisible;

    return (
        <View style={[styles.w100, styles.zIndex10]}>
            <View
                style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.justifyContentBetween,
                    !shouldRemoveHorizontalMargin && styles.ml5,
                    !shouldRemoveHorizontalMargin && styles.mr3,
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
            </View>
            <LoadingBar shouldShow={!isWideRHPVisible && !!shouldShowLoadingBar} />
        </View>
    );
}

export type {TopBarProps};

export default TopBar;
