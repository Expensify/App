import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import * as User from '@userActions/User';
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
    const [dismissedInstantSubmitExplanation] = useOnyx(ONYXKEYS.NVP_DISMISSED_INSTANT_SUBMIT_EXPLANATION);
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    const onClose = useCallback((willShowAgain: boolean) => {
        if (!willShowAgain) {
            User.dismissInstantSubmitExplanation(true);
        } else {
            User.dismissInstantSubmitExplanation(false);
        }
    }, []);

    // const title = useMemo(
    //     () => (
    //         <View style={[styles.flexRow, styles.alignItemsCenter, onboardingIsMediumOrLargerScreenWidth ? styles.mb1 : styles.mb2]}>
    //             <Text style={[styles.textHeadline, styles.mr2]}>{translate('autoSubmitModal.title')}</Text>
    //         </View>
    //     ),
    //     [onboardingIsMediumOrLargerScreenWidth, styles.flexRow, styles.alignItemsCenter, styles.mb1, styles.mb2, styles.textHeadline, styles.mr2, translate],
    // );

    return (
        <FeatureTrainingModal
            title={translate('autoSubmitModal.title')}
            description={translate('autoSubmitModal.description')}
            confirmText={translate('common.buttonConfirm')}
            image={Illustrations.ReceiptsStackedOnPin}
            contentFitImage="cover"
            width={variables.holdEducationModalWidth}
            illustrationAspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
            illustrationInnerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getBackgroundColorStyle(colors.green700), styles.p8]}
            modalInnerContainerStyle={styles.pt0}
            illustrationOuterContainerStyle={styles.p0}
            shouldShowDismissModalOption={!dismissedInstantSubmitExplanation}
            onConfirm={onClose}
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
                        <Text style={[styles.textSupporting]}>{translate(section.descriptionTranslationKey as TranslationPaths)}</Text>
                    </View>
                </View>
            ))}
        </FeatureTrainingModal>
    );
}

export default AutoSubmitModal;
AutoSubmitModal.displayName = 'AutoSubmitModal';
