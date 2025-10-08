import {View} from 'react-native';
import type {EdgeInsets} from 'react-native-safe-area-context';
import NavigationTabBar from '@components/Navigation/NavigationTabBar';
import NAVIGATION_TABS from '@components/Navigation/NavigationTabBar/NAVIGATION_TABS';
import TopBar from '@components/Navigation/TopBar';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import SidebarLinksData from './SidebarLinksData';

function SidebarInboxContent({shouldUseNarrowLayout, insets}: {shouldUseNarrowLayout: boolean; insets: EdgeInsets}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    return (
        <>
            <TopBar
                breadcrumbLabel={translate('common.inbox')}
                shouldDisplaySearch={shouldUseNarrowLayout}
                shouldDisplayHelpButton={shouldUseNarrowLayout}
            />
            <View style={[styles.flex1]}>
                <SidebarLinksData insets={insets} />
            </View>
            {!shouldUseNarrowLayout && <NavigationTabBar selectedTab={NAVIGATION_TABS.HOME} />}
        </>
    );
}

SidebarInboxContent.displayName = 'SidebarInboxContent';
export default SidebarInboxContent;
