import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Breadcrumbs from '@components/Breadcrumbs';
import LoadingBar from '@components/LoadingBar';
import {PressableWithoutFeedback} from '@components/Pressable';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import HelpButton from '@components/SidePanel/HelpComponents/HelpButton';
import Text from '@components/Text';
import WorkspaceSwitcherButton from '@components/WorkspaceSwitcherButton';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import SignInButton from '@pages/home/sidebar/SignInButton';
import {isAnonymousUser as isAnonymousUserUtil} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type TopBarProps = {
    breadcrumbLabel: string;
    activeWorkspaceID?: string;
    shouldDisplaySearch?: boolean;
    shouldDisplayHelpButton?: boolean;
    shouldShowLoadingBar?: boolean;
    cancelSearch?: () => void;
};

function TopBar({breadcrumbLabel, activeWorkspaceID, shouldDisplaySearch = true, shouldDisplayHelpButton = true, cancelSearch, shouldShowLoadingBar = false}: TopBarProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const policy = usePolicy(activeWorkspaceID);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: (sessionValue) => sessionValue && {authTokenType: sessionValue.authTokenType}, canBeMissing: true});
    const [isLoadingReportData] = useOnyx(ONYXKEYS.IS_LOADING_REPORT_DATA, {canBeMissing: true});
    const isAnonymousUser = isAnonymousUserUtil(session);
    const {canUseLeftHandBar} = usePermissions();

    const headerBreadcrumb = policy?.name
        ? {type: CONST.BREADCRUMB_TYPE.STRONG, text: policy.name}
        : {
              type: CONST.BREADCRUMB_TYPE.ROOT,
          };

    const displaySignIn = isAnonymousUser;
    const displaySearch = !isAnonymousUser && shouldDisplaySearch;

    return (
        <View style={[styles.w100, styles.zIndex10]}>
            <View
                style={[
                    styles.flexRow,
                    styles.alignItemsCenter,
                    styles.justifyContentBetween,
                    styles.ml5,
                    styles.mr3,
                    canUseLeftHandBar ? [styles.headerBarDesktopHeight(true)] : [styles.mv5],
                ]}
                dataSet={{dragArea: true}}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.pr2]}>
                    {canUseLeftHandBar ? (
                        <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter]}>
                            <Text
                                numberOfLines={1}
                                style={[styles.flexShrink1, styles.topBarLabel]}
                            >
                                {breadcrumbLabel}
                            </Text>
                        </View>
                    ) : (
                        <>
                            <WorkspaceSwitcherButton policy={policy} />
                            <View style={[styles.ml3, styles.flex1]}>
                                <Breadcrumbs
                                    breadcrumbs={[
                                        headerBreadcrumb,
                                        {
                                            text: breadcrumbLabel,
                                        },
                                    ]}
                                />
                            </View>
                        </>
                    )}
                </View>
                {displaySignIn && <SignInButton />}
                {!!cancelSearch && (
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('common.cancel')}
                        style={[styles.textBlue, !canUseLeftHandBar && styles.ph2]}
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
