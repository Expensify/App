import React from 'react';
import {Image, Linking, View} from 'react-native';
import HomeTestDriveImage from '@assets/images/home-testdrive-image.png';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {PressableWithoutFeedback} from '@components/Pressable';
import WidgetContainer from '@components/WidgetContainer';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {getTestDriveURL} from '@libs/TourUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

function DiscoverSection() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isCurrentUserPolicyAdmin = useIsPaidPolicyAdmin();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const styles = useThemeStyles();

    const handlePress = () => {
        Linking.openURL(getTestDriveURL(shouldUseNarrowLayout, introSelected, isCurrentUserPolicyAdmin));
    };

    return (
        <WidgetContainer title={translate('homePage.discoverSection.title')}>
            <PressableWithoutFeedback
                onPress={handlePress}
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('homePage.discoverSection.title')}
                style={[styles.ph8, styles.pb4]}
            >
                <View style={[styles.br2, styles.overflowHidden]}>
                    <Image
                        source={HomeTestDriveImage}
                        style={styles.discoverSectionImage}
                    />
                </View>
            </PressableWithoutFeedback>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={isCurrentUserPolicyAdmin ? translate('homePage.discoverSection.menuItemTitleAdmin') : translate('homePage.discoverSection.menuItemTitleNonAdmin')}
                description={translate('homePage.discoverSection.menuItemDescription')}
                onPress={handlePress}
                style={styles.mb8}
                wrapperStyle={styles.pl8}
                numberOfLinesTitle={2}
            />
        </WidgetContainer>
    );
}

export default DiscoverSection;
