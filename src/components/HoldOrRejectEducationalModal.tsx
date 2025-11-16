import React from 'react';
import {View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import useBeforeRemove from '@hooks/useBeforeRemove';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import FeatureTrainingModal from './FeatureTrainingModal';
import Icon from './Icon';
import Text from './Text';

const ILLUSTRATION_NAMES = {
    STOPWATCH: 'Stopwatch',
    RULES: 'Rules',
    REALTIME_REPORT: 'RealtimeReport',
    THUMBS_DOWN: 'ThumbsDown',
    MODAL_HOLD_OR_REJECT: 'ModalHoldOrReject',
} as const;

const illustrationNames = [
    ILLUSTRATION_NAMES.STOPWATCH,
    ILLUSTRATION_NAMES.RULES,
    ILLUSTRATION_NAMES.REALTIME_REPORT,
    ILLUSTRATION_NAMES.THUMBS_DOWN,
    ILLUSTRATION_NAMES.MODAL_HOLD_OR_REJECT,
] as const;
type IllustrationName = TupleToUnion<typeof illustrationNames>;

type SectionMenuItem = {
    /** The icon supplied with the section */
    iconName: IllustrationName;

    /** Translation key for the title */
    titleTranslationKey: TranslationPaths;
};

type HoldOrRejectEducationalModalProps = {
    /** Method to trigger when pressing outside of the popover menu to close it */
    onClose: () => void;

    /** Method to trigger when pressing confirm button */
    onConfirm: () => void;
};

const menuSections: SectionMenuItem[] = [
    {
        iconName: ILLUSTRATION_NAMES.STOPWATCH,
        titleTranslationKey: 'iou.reject.holdExpenseTitle',
    },
    {
        iconName: ILLUSTRATION_NAMES.RULES,
        titleTranslationKey: 'iou.reject.approveExpenseTitle',
    },
    {
        iconName: ILLUSTRATION_NAMES.REALTIME_REPORT,
        titleTranslationKey: 'iou.reject.heldExpenseLeftBehindTitle',
    },
    {
        iconName: ILLUSTRATION_NAMES.THUMBS_DOWN,
        titleTranslationKey: 'iou.reject.rejectExpenseTitle',
    },
];

function HoldOrRejectEducationalModal({onClose, onConfirm}: HoldOrRejectEducationalModalProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(illustrationNames);

    useBeforeRemove(onClose);

    return (
        <FeatureTrainingModal
            title={translate('iou.reject.educationalTitle')}
            description={translate('iou.reject.educationalText')}
            confirmText={translate('common.buttonConfirm')}
            image={illustrations[ILLUSTRATION_NAMES.MODAL_HOLD_OR_REJECT]}
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
                            src={illustrations[section.iconName]}
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
