import React, {useCallback, useMemo} from 'react';
import {InteractionManager, View} from 'react-native';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import {dismissASAPSubmitExplanation} from '@userActions/User';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import FeatureTrainingModal from './FeatureTrainingModal';
import Icon from './Icon';
// eslint-disable-next-line no-restricted-imports
import Text from './Text';

function AutoSubmitModal() {
    const [dismissedASAPSubmitExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_ASAP_SUBMIT_EXPLANATION, {canBeMissing: true});
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

    const onClose = useCallback((willShowAgain: boolean) => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            if (!willShowAgain) {
                dismissASAPSubmitExplanation(true);
            } else {
                dismissASAPSubmitExplanation(false);
            }
        });
    }, []);

    return (
        <FeatureTrainingModal
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
            modalInnerContainerStyle={styles.pt0}
            illustrationOuterContainerStyle={styles.p0}
            shouldShowDismissModalOption={dismissedASAPSubmitExplanation === false}
            onConfirm={onClose}
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
        </FeatureTrainingModal>
    );
}

export default AutoSubmitModal;
