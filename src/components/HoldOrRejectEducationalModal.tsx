import React from 'react';
import {View} from 'react-native';
import useBeforeRemove from '@hooks/useBeforeRemove';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import FeatureTrainingModal from './FeatureTrainingModal';
import Icon from './Icon';
import Text from './Text';

type SectionMenuItem = {
    /** The icon supplied with the section */
    icon: IconAsset;

    /** Translation key for the title */
    titleTranslationKey: TranslationPaths;
};

type HoldOrRejectEducationalModalProps = {
    /** Method to trigger when pressing outside of the popover menu to close it */
    onClose: () => void;

    /** Method to trigger when pressing confirm button */
    onConfirm: () => void;
};

function HoldOrRejectEducationalModal({onClose, onConfirm}: HoldOrRejectEducationalModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['Stopwatch', 'Rules', 'RealtimeReport', 'ThumbsDown', 'ModalHoldOrReject'] as const);

    useBeforeRemove(onClose);

    const menuSections: SectionMenuItem[] = [
        {
            icon: illustrations.Stopwatch,
            titleTranslationKey: 'iou.reject.holdExpenseTitle',
        },
        {
            icon: illustrations.Rules,
            titleTranslationKey: 'iou.reject.approveExpenseTitle',
        },
        {
            icon: illustrations.RealtimeReport,
            titleTranslationKey: 'iou.reject.heldExpenseLeftBehindTitle',
        },
        {
            icon: illustrations.ThumbsDown,
            titleTranslationKey: 'iou.reject.rejectExpenseTitle',
        },
    ];

    return (
        <FeatureTrainingModal
            title={translate('iou.reject.educationalTitle')}
            description={translate('iou.reject.educationalText')}
            confirmText={translate('common.buttonConfirm')}
            image={illustrations.ModalHoldOrReject}
            contentFitImage="cover"
            width={variables.holdEducationModalWidth}
            illustrationAspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
            contentInnerContainerStyles={styles.mb5}
            modalInnerContainerStyle={styles.pt0}
            illustrationOuterContainerStyle={styles.p0}
            shouldCloseOnConfirm={false}
            onClose={onClose}
            onConfirm={onConfirm}
        >
            <>
                {menuSections.map((section) => (
                    <View
                        key={section.titleTranslationKey}
                        style={[styles.flexRow, styles.alignItemsStart, styles.mt5]}
                    >
                        <Icon
                            width={variables.menuIconSize}
                            height={variables.menuIconSize}
                            src={section.icon}
                            additionalStyles={[styles.mr4]}
                        />
                        <View style={[styles.mb1, styles.flex1]}>
                            <Text style={[styles.textStrong]}>{translate(section.titleTranslationKey)}</Text>
                        </View>
                    </View>
                ))}
            </>
        </FeatureTrainingModal>
    );
}

HoldOrRejectEducationalModal.displayName = 'HoldOrRejectEducationalModal';

export default HoldOrRejectEducationalModal;
