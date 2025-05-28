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

    /** Translation key for the title prefix */
    titlePrefixTranslationKey: TranslationPaths;

    /** Translation key for the title */
    titleTranslationKey: TranslationPaths;

    /** Translation key for the description */
    descriptionKey: TranslationPaths;
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
        titlePrefixTranslationKey: 'iou.decline.holdExpenseTitlePrefix',
        titleTranslationKey: 'iou.decline.holdExpenseTitle',
        descriptionKey: 'iou.decline.holdExpenseDescription',
    },
    {
        icon: Illustrations.ThumbsDown,
        titlePrefixTranslationKey: 'iou.decline.declineExpenseTitlePrefix',
        titleTranslationKey: 'iou.decline.declineExpenseTitle',
        descriptionKey: 'iou.decline.declineExpenseDescription',
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
                        <View style={[styles.flex1, styles.justifyContentCenter]}>
                            <Text style={[styles.mb1]}>
                                <Text style={[styles.mb1, styles.textStrong, styles.mr1]}>{translate(section.titlePrefixTranslationKey)}</Text>
                                {translate(section.titleTranslationKey)}
                            </Text>
                            <Text style={styles.textLabelSupporting}>{translate(section.descriptionKey)}</Text>
                        </View>
                    </View>
                ))}
            </>
        </FeatureTrainingModal>
    );
}

HoldOrDeclineEducationalModal.displayName = 'HoldOrDeclineEducationalModal';

export default HoldOrDeclineEducationalModal;
