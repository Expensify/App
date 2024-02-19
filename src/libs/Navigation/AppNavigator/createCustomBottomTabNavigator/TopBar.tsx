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

    const title = policy?.name ?? translate('common.chats');

    return (
        <View style={styles.w100}>
            <View
                style={[styles.gap4, styles.flexRow, styles.m5, styles.alignItemsCenter]}
                dataSet={{dragArea: true}}
            >
                <WorkspaceSwitcherButton policy={policy} />

                <View style={styles.flexGrow1}>
                    <Breadcrumbs
                        breadcrumbs={[
                            {
                                type: CONST.BREADCRUMB_TYPE.ROOT,
                            },
                            {
                                text: title,
                            },
                        ]}
                    />
                </View>
                <Tooltip text={translate('common.search')}>
                    <PressableWithoutFeedback
                        accessibilityLabel={translate('sidebarScreen.buttonSearch')}
                        style={[styles.flexRow, styles.ph5]}
                        onPress={Session.checkIfActionIsAllowed(() => Navigation.navigate(ROUTES.SEARCH))}
                    >
                        <Icon
                            src={Expensicons.MagnifyingGlass}
                            fill={theme.icon}
                        />
                    </PressableWithoutFeedback>
                </Tooltip>
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
