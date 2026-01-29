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
import {hasSeenTourSelector} from '@src/selectors/Onboarding';

const MAX_NUMBER_OF_LINES_TITLE = 4;

function DiscoverSection() {
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isCurrentUserPolicyAdmin = useIsPaidPolicyAdmin();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector, canBeMissing: true});
    const styles = useThemeStyles();

    const handlePress = () => {
        Linking.openURL(getTestDriveURL(shouldUseNarrowLayout, introSelected, isCurrentUserPolicyAdmin));
    };

    if (isSelfTourViewed) {
        return null;
    }

    return (
        <WidgetContainer title={translate('homePage.discoverSection.title')}>
            <PressableWithoutFeedback
                onPress={handlePress}
                accessibilityRole={CONST.ROLE.BUTTON}
                accessibilityLabel={translate('homePage.discoverSection.title')}
                style={[shouldUseNarrowLayout ? styles.mh5 : styles.mh8, styles.mb5]}
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
                style={shouldUseNarrowLayout ? styles.mb2 : styles.mb5}
                wrapperStyle={shouldUseNarrowLayout ? styles.pl5 : styles.pl8}
                numberOfLinesTitle={MAX_NUMBER_OF_LINES_TITLE}
            />
        </WidgetContainer>
    );
}

export default DiscoverSection;
