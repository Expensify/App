import React from 'react';
import {View} from 'react-native';
import Search from '@components/Search';
import WorkspaceSwitcherButton from '@components/WorkspaceSwitcherButton';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import SignInOrAvatarWithOptionalStatus from '@pages/home/sidebar/SignInOrAvatarWithOptionalStatus';
import * as Session from '@userActions/Session';
import ROUTES from '@src/ROUTES';

function TopBar() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {activeWorkspaceID} = useActiveWorkspace();

    return (
        <View
            style={[styles.gap4, styles.flexRow, styles.ph5, styles.pv5, styles.justifyContentBetween, styles.alignItemsCenter]}
            dataSet={{dragArea: true}}
        >
            <WorkspaceSwitcherButton activeWorkspaceID={activeWorkspaceID} />
            <Search
                placeholder={translate('sidebarScreen.buttonSearch')}
                onPress={Session.checkIfActionIsAllowed(() => Navigation.navigate(ROUTES.SEARCH))}
                containerStyle={[styles.flex1]}
            />
            <SignInOrAvatarWithOptionalStatus />
        </View>
    );
}

TopBar.displayName = 'TopBar';

export default TopBar;
