import React from 'react';
import {Linking} from 'react-native';
import DateIcon from '@components/DateIcon';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import WidgetContainer from '@components/WidgetContainer';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

const announcements = CONST.HOME.ANNOUNCEMENTS.toSorted((a, b) => {
    if (a.publishedDate > b.publishedDate) {
        return -1;
    }
    if (a.publishedDate < b.publishedDate) {
        return 1;
    }
    return 0;
});

function AnnouncementSection() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    return (
        <WidgetContainer
            title={translate('homePage.announcements')}
            containerStyles={shouldUseNarrowLayout ? styles.pb2 : styles.pb5}
        >
            {announcements.map((announcement) => (
                <MenuItemWithTopDescription
                    key={announcement.title}
                    description={announcement.subtitle}
                    title={announcement.title}
                    titleStyle={styles.textBold}
                    onPress={() => Linking.openURL(announcement.url)}
                    shouldShowRightIcon
                    leftComponent={<DateIcon date={announcement.publishedDate} />}
                    wrapperStyle={[styles.alignItemsCenter, shouldUseNarrowLayout ? styles.ph5 : styles.ph8]}
                    hasSubMenuItems
                    viewMode={CONST.OPTION_MODE.COMPACT}
                    rightIconWrapperStyle={styles.pl2}
                    shouldCheckActionAllowedOnPress={false}
                />
            ))}
        </WidgetContainer>
    );
}

export default AnnouncementSection;
