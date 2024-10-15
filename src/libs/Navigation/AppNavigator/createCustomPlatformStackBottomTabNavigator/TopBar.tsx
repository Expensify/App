import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Breadcrumbs from '@components/Breadcrumbs';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import SearchButton from '@components/Search/SearchRouter/SearchButton';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import WorkspaceSwitcherButton from '@components/WorkspaceSwitcherButton';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import Performance from '@libs/Performance';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import SignInButton from '@pages/home/sidebar/SignInButton';
import * as Session from '@userActions/Session';
import Timing from '@userActions/Timing';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type TopBarProps = {breadcrumbLabel: string; activeWorkspaceID?: string; shouldDisplaySearch?: boolean; isCustomSearchQuery?: boolean; shouldDisplaySearchRouter?: boolean};

function TopBar({breadcrumbLabel, activeWorkspaceID, shouldDisplaySearch = true, isCustomSearchQuery = false, shouldDisplaySearchRouter = false}: TopBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const policy = usePolicy(activeWorkspaceID);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: (sessionValue) => sessionValue && {authTokenType: sessionValue.authTokenType}});
    const isAnonymousUser = Session.isAnonymousUser(session);

    const headerBreadcrumb = policy?.name
        ? {type: CONST.BREADCRUMB_TYPE.STRONG, text: policy.name}
        : {
              type: CONST.BREADCRUMB_TYPE.ROOT,
          };

    const displaySignIn = isAnonymousUser;
    const displaySearch = !isAnonymousUser && shouldDisplaySearch;

    return (
        <View style={styles.w100}>
            <View
                style={[styles.flexRow, styles.gap4, styles.mh3, styles.mv5, styles.alignItemsCenter, styles.justifyContentBetween]}
                dataSet={{dragArea: true}}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.ml2]}>
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
                </View>
                {displaySignIn && <SignInButton />}
                {isCustomSearchQuery && (
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('common.cancel')}
                        style={[styles.textBlue]}
                        onPress={() => {
                            Navigation.goBack(ROUTES.SEARCH_CENTRAL_PANE.getRoute({query: SearchQueryUtils.buildCannedSearchQuery()}));
                        }}
                    >
                        <Text style={[styles.textBlue]}>{translate('common.cancel')}</Text>
                    </PressableWithoutFeedback>
                )}
                {shouldDisplaySearchRouter && <SearchButton />}
                {displaySearch && (
                    <Tooltip text={translate('common.find')}>
                        <PressableWithoutFeedback
                            accessibilityLabel={translate('sidebarScreen.buttonFind')}
                            style={[styles.flexRow, styles.mr2, styles.touchableButtonImage]}
                            onPress={Session.checkIfActionIsAllowed(() => {
                                Timing.start(CONST.TIMING.CHAT_FINDER_RENDER);
                                Performance.markStart(CONST.TIMING.CHAT_FINDER_RENDER);
                                Navigation.navigate(ROUTES.CHAT_FINDER);
                            })}
                        >
                            <Icon
                                src={Expensicons.MagnifyingGlass}
                                fill={theme.icon}
                            />
                        </PressableWithoutFeedback>
                    </Tooltip>
                )}
            </View>
        </View>
    );
}

TopBar.displayName = 'TopBar';

export default TopBar;
