import React, {useCallback} from 'react';
import {InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import {dismissInstantSubmitExplanation} from '@userActions/User';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import FeatureTrainingModal from './FeatureTrainingModal';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';
import Text from './Text';

const menuSections = [
    {
        icon: Illustrations.PaperAirplane,
        titleTranslationKey: 'autoSubmitModal.submittedExpensesTitle',
        descriptionTranslationKey: 'autoSubmitModal.submittedExpensesDescription',
    },
    {
        icon: Illustrations.Pencil,
        titleTranslationKey: 'autoSubmitModal.pendingExpensesTitle',
        descriptionTranslationKey: 'autoSubmitModal.pendingExpensesDescription',
    },
];

function AutoSubmitModal() {
    const [dismissedInstantSubmitExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_INSTANT_SUBMIT_EXPLANATION, {canBeMissing: true});
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

    const onClose = useCallback((willShowAgain: boolean) => {
        InteractionManager.runAfterInteractions(() => {
            if (!willShowAgain) {
                dismissInstantSubmitExplanation(true);
            } else {
                dismissInstantSubmitExplanation(false);
            }
        });
    }, []);

    return (
        <FeatureTrainingModal
            title={translate('autoSubmitModal.title')}
            description={translate('autoSubmitModal.description')}
            confirmText={translate('common.buttonConfirm')}
            image={Illustrations.ReceiptsStackedOnPin}
            contentFitImage="cover"
            width={variables.holdEducationModalWidth}
            imageWidth={variables.changePolicyEducationModalIconWidth}
            imageHeight={variables.changePolicyEducationModalIconHeight}
            illustrationAspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
            illustrationInnerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getBackgroundColorStyle(colors.green700), styles.p8]}
            modalInnerContainerStyle={styles.pt0}
            illustrationOuterContainerStyle={styles.p0}
            shouldShowDismissModalOption={dismissedInstantSubmitExplanation === false}
            onConfirm={onClose}
            titleStyles={[styles.mb1]}
            contentInnerContainerStyles={[styles.mb5]}
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
AutoSubmitModal.displayName = 'AutoSubmitModal';
