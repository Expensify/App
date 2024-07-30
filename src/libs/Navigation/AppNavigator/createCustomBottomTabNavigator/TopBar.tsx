import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Breadcrumbs from '@components/Breadcrumbs';
import Icon from '@components/Icon';
import * as Expensicons from '@components/Icon/Expensicons';
import {PressableWithoutFeedback} from '@components/Pressable';
import Tooltip from '@components/Tooltip';
import WorkspaceSwitcherButton from '@components/WorkspaceSwitcherButton';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import SignInButton from '@pages/home/sidebar/SignInButton';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type TopBarProps = {breadcrumbLabel: string; activeWorkspaceID?: string; shouldDisplaySearch?: boolean};

function TopBar({breadcrumbLabel, activeWorkspaceID, shouldDisplaySearch = true}: TopBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${activeWorkspaceID}`);
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
                {displaySearch && (
                    <Tooltip text={translate('common.find')}>
                        <PressableWithoutFeedback
                            accessibilityLabel={translate('sidebarScreen.buttonFind')}
                            style={[styles.flexRow, styles.mr2, styles.touchableButtonImage]}
                            onPress={Session.checkIfActionIsAllowed(() => Navigation.navigate(ROUTES.CHAT_FINDER))}
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
