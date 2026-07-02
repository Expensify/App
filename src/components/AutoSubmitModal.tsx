import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
import useBeforeRemove from '@hooks/useBeforeRemove';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import {dismissASAPSubmitExplanation} from '@userActions/User';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import CenteredModalLayout from './CenteredModalLayout';
import FeatureTrainingContent from './FeatureTrainingContent';
import Icon from './Icon';
import Text from './Text';

function AutoSubmitModal() {
    const [dismissedASAPSubmitExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_ASAP_SUBMIT_EXPLANATION);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['PaperAirplane', 'Pencil', 'ReceiptsStackedOnPin']);
    const menuSections = useMemo(
        () => [
            {
                icon: illustrations.PaperAirplane,
                titleTranslationKey: 'autoSubmitModal.submittedExpensesTitle',
                descriptionTranslationKey: 'autoSubmitModal.submittedExpensesDescription',
            },
            {
                icon: illustrations.Pencil,
                titleTranslationKey: 'autoSubmitModal.pendingExpensesTitle',
                descriptionTranslationKey: 'autoSubmitModal.pendingExpensesDescription',
            },
        ],
        [illustrations.PaperAirplane, illustrations.Pencil],
    );

    const willShowAgainRef = useRef<boolean | null>(null);

    const persistDismiss = () => {
        if (willShowAgainRef.current === null) {
            return;
        }

        const shouldDismiss = !willShowAgainRef.current;
        willShowAgainRef.current = null;

        // Defer the Onyx write until after the close transition finishes. This prevents potential checkbox flicker.
        TransitionTracker.runAfterTransitions({
            callback: () => dismissASAPSubmitExplanation(shouldDismiss),
            waitForUpcomingTransition: true,
        });
    };

    useBeforeRemove(persistDismiss);

    const handleClose = () => Navigation.goBack();

    const onConfirm = (willShowAgain: boolean) => {
        willShowAgainRef.current = willShowAgain;
    };

    return (
        <CenteredModalLayout
            onBackdropPress={handleClose}
            width={variables.holdEducationModalWidth}
            contentStyle={[styles.pt0, styles.pb0]}
        >
            <FeatureTrainingContent
                title={translate('autoSubmitModal.title')}
                description={translate('autoSubmitModal.description')}
                confirmText={translate('common.buttonConfirm')}
                image={illustrations.ReceiptsStackedOnPin}
                contentFitImage="cover"
                width={variables.holdEducationModalWidth}
                imageWidth={variables.changePolicyEducationModalIconWidth}
                imageHeight={variables.changePolicyEducationModalIconHeight}
                illustrationAspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
                illustrationInnerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getBackgroundColorStyle(colors.green700), styles.p8]}
                illustrationOuterContainerStyle={styles.p0}
                shouldShowDismissModalOption={dismissedASAPSubmitExplanation === false}
                onConfirm={onConfirm}
                onClose={handleClose}
                titleStyles={[styles.mb1]}
                contentInnerContainerStyles={[styles.mb5]}
                shouldUseScrollView
            >
                {menuSections.map((section) => (
                    <View
                        key={section.titleTranslationKey}
                        style={[styles.flexRow, styles.alignItemsCenter, styles.mt3]}
                    >
                        <Icon
                            width={variables.menuIconSize}
                            height={variables.menuIconSize}
                            src={section.icon}
                            additionalStyles={[styles.mr4]}
                        />
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <Text style={[styles.textStrong, styles.mb1]}>{translate(section.titleTranslationKey as TranslationPaths)}</Text>
                            <Text style={[styles.mutedTextLabel, styles.lh16]}>{translate(section.descriptionTranslationKey as TranslationPaths)}</Text>
                        </View>
                    </View>
                ))}
            </FeatureTrainingContent>
        </CenteredModalLayout>
    );
}

export default AutoSubmitModal;
