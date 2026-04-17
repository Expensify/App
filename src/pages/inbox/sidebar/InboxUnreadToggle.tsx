import React from 'react';
import {View} from 'react-native';
import Switch from '@components/Switch';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import {useSidebarOrderedReportsActions, useSidebarOrderedReportsState} from '@hooks/useSidebarOrderedReports';
import useThemeStyles from '@hooks/useThemeStyles';

function InboxUnreadToggle() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {showUnreadOnly} = useSidebarOrderedReportsState();
    const {toggleUnreadFilter} = useSidebarOrderedReportsActions();

    return (
        <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap2]}>
            <Text style={[styles.textSmall, styles.textSupporting]}>{translate('inboxTabs.unreadToggle')}</Text>
            <Switch
                isOn={showUnreadOnly}
                onToggle={() => toggleUnreadFilter()}
                accessibilityLabel={translate('inboxTabs.unreadToggle')}
                size="small"
            />
        </View>
    );
}

InboxUnreadToggle.displayName = 'InboxUnreadToggle';

export default InboxUnreadToggle;
