import React, {useMemo} from 'react';
import {View} from 'react-native';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import FeatureTrainingModal from './FeatureTrainingModal';
import Icon from './Icon';
import * as Illustrations from './Icon/Illustrations';
import Text from './Text';
import TextPill from './TextPill';

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
        icon: Illustrations.MoneyIntoWallet,
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
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    useBeforeRemove(onClose);

    const title = useMemo(
        () => (
            <View style={[styles.flexRow, styles.alignItemsCenter, onboardingIsMediumOrLargerScreenWidth ? styles.mb1 : styles.mb2]}>
                <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.decline.educationalTitle')}</Text>
                <TextPill textStyles={[styles.inlinePill, styles.yellowPillInline, styles.mr2]}>{translate('iou.hold')}</TextPill>
                <Text style={[styles.textHeadline, styles.mr2]}>{translate('common.or')}</Text>
                <TextPill textStyles={[styles.inlinePill, styles.redPillInline, styles.mr2]}>{translate('common.decline')}</TextPill>
                <Text style={styles.textHeadline}>{translate('iou.decline.questionMark')}</Text>
            </View>
        ),
        [
            styles.flexRow,
            styles.alignItemsCenter,
            styles.mb1,
            styles.mb2,
            styles.textHeadline,
            styles.mr2,
            styles.inlinePill,
            styles.yellowPillInline,
            styles.redPillInline,
            onboardingIsMediumOrLargerScreenWidth,
            translate,
        ],
    );

    return (
        <FeatureTrainingModal
            title={title}
            description={translate('iou.decline.educationalText')}
            confirmText={translate('common.buttonConfirm')}
            image={Illustrations.ModalHoldOrDecline}
            contentFitImage="cover"
            width={variables.holdEducationModalWidth}
            illustrationAspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
            contentInnerContainerStyles={styles.mb5}
            modalInnerContainerStyle={styles.pt0}
            illustrationOuterContainerStyle={styles.p0}
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
                        <Text style={[styles.mb1, styles.textStrong]}>
                            {translate(section.titleTranslationKey)}
                        </Text>
                    </View>
                ))}
            </>
        </FeatureTrainingModal>
    );
}

HoldOrDeclineEducationalModal.displayName = 'HoldOrDeclineEducationalModal';

export default HoldOrDeclineEducationalModal;
