import React, {useMemo} from 'react';
import {View} from 'react-native';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Accessibility from '@libs/Accessibility';
import {openExternalLink} from '@libs/actions/Link';
import {dismissProductTraining} from '@libs/actions/Welcome';
import convertToLTR from '@libs/convertToLTR';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {FeatureListItem} from './FeatureList';
import FeatureTrainingModal from './FeatureTrainingModal';
import Icon from './Icon';
import LottieAnimations from './LottieAnimations';
import RenderHTML from './RenderHTML';

function MigratedUserWelcomeModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isReduceMotionEnabled = Accessibility.useReducedMotion();
    const illustrations = useMemoizedLazyIllustrations(['ChatBubbles', 'ConciergeBot', 'PlanetWithMobileApp', 'MagnifyingGlassReceipt']);
    const isCurrentUserPolicyAdmin = useIsPaidPolicyAdmin();

    const ExpensifyFeatures = useMemo<FeatureListItem[]>(
        () => [
            {
                icon: illustrations.MagnifyingGlassReceipt,
                translationKey: 'migratedUserWelcomeModal.features.search',
            },
            {
                icon: illustrations.ConciergeBot,
                translationKey: 'migratedUserWelcomeModal.features.concierge',
            },
            {
                icon: illustrations.ChatBubbles,
                translationKey: 'migratedUserWelcomeModal.features.chat',
            },
        ],
        [illustrations.ChatBubbles, illustrations.ConciergeBot, illustrations.MagnifyingGlassReceipt],
    );

    const onHelp = () => {
        Log.info('[MigratedUserWelcomeModal] onHelp called, opening help URL based on admin status and device type');
        const adminUrl = shouldUseNarrowLayout ? CONST.STORYLANE.ADMIN_MIGRATED_MOBILE : CONST.STORYLANE.ADMIN_MIGRATED;
        const employeeUrl = shouldUseNarrowLayout ? CONST.STORYLANE.EMPLOYEE_MIGRATED_MOBILE : CONST.STORYLANE.EMPLOYEE_MIGRATED;
        const helpUrl = isCurrentUserPolicyAdmin ? adminUrl : employeeUrl;
        openExternalLink(helpUrl);
        dismissProductTraining(CONST.MIGRATED_USER_WELCOME_MODAL);
    };

    const onClose = () => {
        Log.hmmm('[MigratedUserWelcomeModal] onClose called, dismissing product training');
        dismissProductTraining(CONST.MIGRATED_USER_WELCOME_MODAL);
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT})}));
    };

    const featureListContent = (
        <View
            style={[styles.gap3, styles.pt1, styles.pl1]}
            fsClass={CONST.FULLSTORY.CLASS.UNMASK}
        >
            {ExpensifyFeatures.map(({translationKey, icon}) => (
                <View
                    key={translationKey}
                    style={[styles.flexRow, styles.alignItemsCenter, styles.wAuto]}
                >
                    <Icon
                        src={icon}
                        height={variables.menuIconSize}
                        width={variables.menuIconSize}
                    />
                    <View style={[styles.flexRow, styles.alignItemsCenter, styles.wAuto, styles.flex1, styles.ml6]}>
                        <RenderHTML html={`<comment>${convertToLTR(translate(translationKey))}</comment>`} />
                    </View>
                </View>
            ))}
        </View>
    );

    if (isReduceMotionEnabled) {
        return (
            <FeatureTrainingModal
                image={illustrations.PlanetWithMobileApp}
                title={translate('migratedUserWelcomeModal.title')}
                description={translate('migratedUserWelcomeModal.subtitle')}
                confirmText={translate('migratedUserWelcomeModal.confirmText')}
                helpText={translate('migratedUserWelcomeModal.helpText')}
                onHelp={onHelp}
                onClose={onClose}
                illustrationInnerContainerStyle={[StyleUtils.getBackgroundColorStyle(LottieAnimations.WorkspacePlanet.backgroundColor), styles.cardSectionIllustration]}
                illustrationOuterContainerStyle={styles.p0}
                contentInnerContainerStyles={[styles.mb5, styles.gap2]}
                contentOuterContainerStyles={!shouldUseNarrowLayout && [styles.mt8, styles.mh8]}
                modalInnerContainerStyle={{...styles.pt0, ...(shouldUseNarrowLayout ? {} : styles.pb8)}}
                shouldUseScrollView
            >
                {featureListContent}
            </FeatureTrainingModal>
        );
    }

    return (
        <FeatureTrainingModal
            // We would like to show the Lottie animation instead of a video
            videoURL=""
            animation={LottieAnimations.WorkspacePlanet}
            animationStyle={[styles.emptyWorkspaceIllustrationStyle]}
            title={translate('migratedUserWelcomeModal.title')}
            description={translate('migratedUserWelcomeModal.subtitle')}
            confirmText={translate('migratedUserWelcomeModal.confirmText')}
            helpText={translate('migratedUserWelcomeModal.helpText')}
            onHelp={onHelp}
            onClose={onClose}
            illustrationInnerContainerStyle={[StyleUtils.getBackgroundColorStyle(LottieAnimations.WorkspacePlanet.backgroundColor), styles.cardSectionIllustration]}
            illustrationOuterContainerStyle={styles.p0}
            contentInnerContainerStyles={[styles.mb5, styles.gap2]}
            contentOuterContainerStyles={!shouldUseNarrowLayout && [styles.mt8, styles.mh8]}
            modalInnerContainerStyle={{...styles.pt0, ...(shouldUseNarrowLayout ? {} : styles.pb8)}}
            shouldUseScrollView
        >
            {featureListContent}
        </FeatureTrainingModal>
    );
}

export default MigratedUserWelcomeModal;
