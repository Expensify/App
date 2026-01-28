import React, {useContext} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import LoadingBar from '@components/LoadingBar';
import {PressableWithoutFeedback} from '@components/Pressable';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import SidePanelButton from '@components/SidePanel/SidePanelButton';
import Text from '@components/Text';
import {WideRHPContext} from '@components/WideRHPContextProvider';
import useLoadingBarVisibility from '@hooks/useLoadingBarVisibility';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import SignInButton from '@pages/inbox/sidebar/SignInButton';
import {isAnonymousUser as isAnonymousUserUtil} from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Session} from '@src/types/onyx';

type TopBarProps = {
    breadcrumbLabel: string;
    shouldDisplaySearch?: boolean;
    shouldDisplayHelpButton?: boolean;
    shouldShowLoadingBar?: boolean;
    cancelSearch?: () => void;
    children?: React.ReactNode;
};

const authTokenTypeSelector = (session: OnyxEntry<Session>) => session && {authTokenType: session.authTokenType};

function TopBar({breadcrumbLabel, shouldDisplaySearch = true, shouldDisplayHelpButton = true, cancelSearch, shouldShowLoadingBar = false, children}: TopBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector, canBeMissing: true});
    const shouldShowLoadingBarForReports = useLoadingBarVisibility();
    const isAnonymousUser = isAnonymousUserUtil(session);

    const {wideRHPRouteKeys} = useContext(WideRHPContext);
    const isWideRHPVisible = !!wideRHPRouteKeys.length;

    const displaySignIn = isAnonymousUser;
    const displaySearch = !isAnonymousUser && shouldDisplaySearch;

    return (
        <View style={[styles.w100, styles.zIndex10]}>
            <View
                style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentBetween, styles.ml5, styles.mr3, styles.headerBarHeight]}
                dataSet={{dragArea: true}}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.pr2]}>
                    <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.flexShrink1, styles.topBarLabel]}
                        >
                            {breadcrumbLabel}
                        </Text>
                    </View>
                </View>
                {children}
                {displaySignIn && <SignInButton />}
                {!!cancelSearch && (
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('common.cancel')}
                        style={styles.textBlue}
                        onPress={() => {
                            cancelSearch();
                        }}
                    >
                        <Text style={[styles.textBlue]}>{translate('common.cancel')}</Text>
                    </PressableWithoutFeedback>
                )}
                {shouldDisplayHelpButton && <SidePanelButton />}
                {displaySearch && <SearchButton />}
            </View>
            <LoadingBar shouldShow={!isWideRHPVisible && (shouldShowLoadingBarForReports || shouldShowLoadingBar)} />
        </View>
    );
}

export default TopBar;
