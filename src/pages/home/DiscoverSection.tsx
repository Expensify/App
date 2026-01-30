import React from 'react';
import {Image, Linking, View} from 'react-native';
import HomeTestDriveImage from '@assets/images/home-testdrive-image.png';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {PressableWithoutFeedback} from '@components/Pressable';
import WidgetContainer from '@components/WidgetContainer';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import useLocalize from '@hooks/useLocalize';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {completeTestDriveTask} from '@libs/actions/Task';
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
    const styles = useThemeStyles();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const {
        taskReport: viewTourTaskReport,
        taskParentReport: viewTourTaskParentReport,
        isOnboardingTaskParentReportArchived: isViewTourTaskParentReportArchived,
        hasOutstandingChildTask,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR);
    const parentReportAction = useParentReportAction(viewTourTaskReport);
    const [hasSeenTour = true] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector, canBeMissing: true});

    const handlePress = () => {
        Linking.openURL(getTestDriveURL(shouldUseNarrowLayout, introSelected, isCurrentUserPolicyAdmin));

        if (hasSeenTour || !viewTourTaskReport || viewTourTaskReport.stateNum === CONST.REPORT.STATE_NUM.APPROVED) {
            return;
        }

        completeTestDriveTask(
            viewTourTaskReport,
            viewTourTaskParentReport,
            isViewTourTaskParentReportArchived,
            currentUserPersonalDetails.accountID,
            hasOutstandingChildTask,
            parentReportAction,
            false,
        );
    };

    if (hasSeenTour) {
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
                titleStyle={styles.textBold}
                description={translate('homePage.discoverSection.menuItemDescription')}
                onPress={handlePress}
                style={shouldUseNarrowLayout ? styles.mb2 : styles.mb5}
                wrapperStyle={shouldUseNarrowLayout ? styles.ph5 : styles.ph8}
                numberOfLinesTitle={MAX_NUMBER_OF_LINES_TITLE}
                hasSubMenuItems
                viewMode={CONST.OPTION_MODE.COMPACT}
                rightIconWrapperStyle={styles.pl2}
            />
        </WidgetContainer>
    );
}

export default DiscoverSection;
