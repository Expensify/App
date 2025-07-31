import React from 'react';
import {View} from 'react-native';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import FeatureTrainingModal from './FeatureTrainingModal';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';
import Text from './Text';

type SectionMenuItem = {
    /** The icon supplied with the section */
    icon: IconAsset;

    /** Translation key for the title */
    titleTranslationKey: TranslationPaths;
};

type HoldOrDeclineEducationalModalProps = {
    /** Method to trigger when pressing outside of the popover menu to close it */
    onClose: () => void;

    /** Method to trigger when pressing confirm button */
    onConfirm: () => void;
};

const menuSections: SectionMenuItem[] = [
    {
        icon: Illustrations.Stopwatch,
        titleTranslationKey: 'iou.decline.holdExpenseTitle',
    },
    {
        icon: Illustrations.RealtimeReport,
        titleTranslationKey: 'iou.decline.heldExpenseLeftBehindTitle',
    },
    {
        icon: Illustrations.ThumbsDown,
        titleTranslationKey: 'iou.decline.declineExpenseTitle',
    },
];

function HoldOrDeclineEducationalModal({onClose, onConfirm}: HoldOrDeclineEducationalModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    useBeforeRemove(onClose);

    return (
        <FeatureTrainingModal
            title={translate('iou.decline.educationalTitle')}
            description={translate('iou.decline.educationalText')}
            confirmText={translate('common.buttonConfirm')}
            image={Illustrations.ModalHoldOrDecline}
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
                        <Text style={[styles.mb1, styles.textStrong]}>{translate(section.titleTranslationKey)}</Text>
                    </View>
                ))}
            </>
        </FeatureTrainingModal>
    );
}

HoldOrDeclineEducationalModal.displayName = 'HoldOrDeclineEducationalModal';

export default HoldOrDeclineEducationalModal;
