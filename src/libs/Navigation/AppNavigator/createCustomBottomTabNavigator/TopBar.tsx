import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import type {Policy} from '@src/types/onyx';

type TopBarOnyxProps = {
    policy: OnyxEntry<Policy>;
};

// eslint-disable-next-line react/no-unused-prop-types
type TopBarProps = {activeWorkspaceID?: string} & TopBarOnyxProps;

function TopBar({policy}: TopBarProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();

    const headerBreadcrumb = policy?.name
        ? {type: CONST.BREADCRUMB_TYPE.STRONG, text: policy.name}
        : {
              type: CONST.BREADCRUMB_TYPE.ROOT,
          };

    return (
        <View style={styles.w100}>
            <View
                style={[styles.flexRow, styles.gap4, styles.mh3, styles.mv5, styles.alignItemsCenter, {justifyContent: 'space-between'}]}
                dataSet={{dragArea: true}}
            >
                <View style={[styles.flex1, styles.flexRow, styles.alignItemsCenter, styles.ml2]}>
                    <WorkspaceSwitcherButton policy={policy} />

                    <View style={[styles.ml3, styles.flex1]}>
                        <Breadcrumbs
                            breadcrumbs={[
                                headerBreadcrumb,
                                {
                                    text: translate('common.chats'),
                                },
                            ]}
                        />
                    </View>
                </View>
                {Session.isAnonymousUser() ? (
                    <SignInButton />
                ) : (
                    <Tooltip text={translate('common.search')}>
                        <PressableWithoutFeedback
                            accessibilityLabel={translate('sidebarScreen.buttonSearch')}
                            style={[styles.flexRow, styles.mr2]}
                            onPress={Session.checkIfActionIsAllowed(() => Navigation.navigate(ROUTES.SEARCH))}
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

export default withOnyx<TopBarProps, TopBarOnyxProps>({
    policy: {
        key: ({activeWorkspaceID}) => `${ONYXKEYS.COLLECTION.POLICY}${activeWorkspaceID}`,
    },
})(TopBar);
