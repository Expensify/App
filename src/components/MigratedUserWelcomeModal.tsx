import {useRoute} from '@react-navigation/native';
import {tryNewDotOnyxSelector} from '@selectors/Onboarding';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
import useIsPaidPolicyAdmin from '@hooks/useIsPaidPolicyAdmin';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import {openExternalLink} from '@libs/actions/Link';
import {dismissProductTraining} from '@libs/actions/Welcome';
import convertToLTR from '@libs/convertToLTR';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MigratedUserModalNavigatorParamList} from '@libs/Navigation/types';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import type {FeatureListItem} from './FeatureList';
import FeatureTrainingModal from './FeatureTrainingModal';
import Icon from './Icon';
// eslint-disable-next-line no-restricted-imports
import * as Illustrations from './Icon/Illustrations';
import LottieAnimations from './LottieAnimations';
import RenderHTML from './RenderHTML';

function MigratedUserWelcomeModal() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [isModalDisabled, setIsModalDisabled] = useState(true);
    const route = useRoute<PlatformStackRouteProp<MigratedUserModalNavigatorParamList, typeof SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT>>();
    const shouldOpenSearch = route?.params?.shouldOpenSearch === 'true';
    const illustrations = useMemoizedLazyIllustrations(['ChatBubbles']);
    const isCurrentUserPolicyAdmin = useIsPaidPolicyAdmin();

    const ExpensifyFeatures = useMemo<FeatureListItem[]>(
        () => [
            {
                icon: Illustrations.MagnifyingGlassReceipt,
                translationKey: 'migratedUserWelcomeModal.features.search',
            },
            {
                icon: Illustrations.ConciergeBot,
                translationKey: 'migratedUserWelcomeModal.features.concierge',
            },
            {
                icon: illustrations.ChatBubbles,
                translationKey: 'migratedUserWelcomeModal.features.chat',
            },
        ],
        [illustrations.ChatBubbles],
    );

    const [tryNewDot, tryNewDotMetadata] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT, {
        selector: tryNewDotOnyxSelector,
        canBeMissing: true,
    });
    const [dismissedProductTraining, dismissedProductTrainingMetadata] = useOnyx(ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING, {canBeMissing: true});

    useEffect(() => {
        if (isLoadingOnyxValue(tryNewDotMetadata, dismissedProductTrainingMetadata)) {
            return;
        }
        const {hasBeenAddedToNudgeMigration} = tryNewDot ?? {};

        Log.hmmm(
            `[MigratedUserWelcomeModal] useEffect triggered - hasBeenAddedToNudgeMigration: ${hasBeenAddedToNudgeMigration}, hasDismissedTraining: ${!!dismissedProductTraining?.migratedUserWelcomeModal}, shouldOpenSearch: ${shouldOpenSearch}`,
        );

        if (!!(hasBeenAddedToNudgeMigration && !dismissedProductTraining?.migratedUserWelcomeModal) || !shouldOpenSearch) {
            Log.hmmm('[MigratedUserWelcomeModal] Conditions not met, keeping modal disabled');
            return;
        }

        Log.hmmm('[MigratedUserWelcomeModal] Enabling modal and navigating to search');
        setIsModalDisabled(false);
        Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT})}));
    }, [dismissedProductTraining?.migratedUserWelcomeModal, setIsModalDisabled, tryNewDotMetadata, dismissedProductTrainingMetadata, tryNewDot, shouldOpenSearch]);

    return (
        <FeatureTrainingModal
            // We would like to show the Lottie animation instead of a video
            videoURL=""
            title={translate('migratedUserWelcomeModal.title')}
            description={translate('migratedUserWelcomeModal.subtitle')}
            confirmText={translate('migratedUserWelcomeModal.confirmText')}
            helpText={translate('migratedUserWelcomeModal.helpText')}
            onHelp={() => {
                Log.info('[MigratedUserWelcomeModal] onHelp called, opening help URL based on admin status and device type');
                const adminUrl = shouldUseNarrowLayout ? CONST.STORYLANE.ADMIN_MIGRATED_MOBILE : CONST.STORYLANE.ADMIN_MIGRATED;
                const employeeUrl = shouldUseNarrowLayout ? CONST.STORYLANE.EMPLOYEE_MIGRATED_MOBILE : CONST.STORYLANE.EMPLOYEE_MIGRATED;
                const helpUrl = isCurrentUserPolicyAdmin ? adminUrl : employeeUrl;
                openExternalLink(helpUrl);
                dismissProductTraining(CONST.MIGRATED_USER_WELCOME_MODAL);
            }}
            animation={LottieAnimations.WorkspacePlanet}
            onClose={() => {
                Log.hmmm('[MigratedUserWelcomeModal] onClose called, dismissing product training');
                dismissProductTraining(CONST.MIGRATED_USER_WELCOME_MODAL);
            }}
            animationStyle={[styles.emptyWorkspaceIllustrationStyle]}
            illustrationInnerContainerStyle={[StyleUtils.getBackgroundColorStyle(LottieAnimations.WorkspacePlanet.backgroundColor), styles.cardSectionIllustration]}
            illustrationOuterContainerStyle={styles.p0}
            contentInnerContainerStyles={[styles.mb5, styles.gap2]}
            contentOuterContainerStyles={!shouldUseNarrowLayout && [styles.mt8, styles.mh8]}
            modalInnerContainerStyle={{...styles.pt0, ...(shouldUseNarrowLayout ? {} : styles.pb8)}}
            isModalDisabled={isModalDisabled}
            shouldUseScrollView
        >
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
        </FeatureTrainingModal>
    );
}

export default MigratedUserWelcomeModal;
