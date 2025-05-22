import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import LoadingBar from '@components/LoadingBar';
import {PressableWithoutFeedback} from '@components/Pressable';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import HelpButton from '@components/SidePanel/HelpComponents/HelpButton';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import SignInButton from '@pages/home/sidebar/SignInButton';
import {isAnonymousUser as isAnonymousUserUtil} from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';

type TopBarProps = {
    breadcrumbLabel: string;
    shouldDisplaySearch?: boolean;
    shouldDisplayHelpButton?: boolean;
    shouldShowLoadingBar?: boolean;
    cancelSearch?: () => void;
};

function TopBar({breadcrumbLabel, shouldDisplaySearch = true, shouldDisplayHelpButton = true, cancelSearch, shouldShowLoadingBar = false}: TopBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: (sessionValue) => sessionValue && {authTokenType: sessionValue.authTokenType}, canBeMissing: true});
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
    const isAnonymousUser = isAnonymousUserUtil(session);

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
                {shouldDisplayHelpButton && <HelpButton />}
                {displaySearch && <SearchButton />}
            </View>
            <LoadingBar shouldShow={(isLoadingReportData ?? false) || shouldShowLoadingBar} />
        </View>
    );
}

TopBar.displayName = 'TopBar';

export default TopBar;
