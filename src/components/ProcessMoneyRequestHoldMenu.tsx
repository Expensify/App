import React, {useMemo} from 'react';
import {View} from 'react-native';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import FeatureTrainingModal from './FeatureTrainingModal';
import HoldMenuSectionList from './HoldMenuSectionList';
import * as Illustrations from './Icon/Illustrations';
import Text from './Text';
import TextPill from './TextPill';

type ProcessMoneyRequestHoldMenuProps = {
    /** Method to trigger when pressing outside of the popover menu to close it */
    onClose: () => void;

    /** Method to trigger when pressing confirm button */
    onConfirm: () => void;
};

function ProcessMoneyRequestHoldMenu({onClose, onConfirm}: ProcessMoneyRequestHoldMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    useBeforeRemove(onClose);

    const title = useMemo(
        () => (
            <View style={[styles.flexRow, styles.alignItemsCenter, onboardingIsMediumOrLargerScreenWidth ? styles.mb1 : styles.mb2]}>
                <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text>
                <TextPill textStyles={styles.holdRequestInline}>{translate('iou.holdEducationalText')}</TextPill>
            </View>
        ),
        [onboardingIsMediumOrLargerScreenWidth, styles.flexRow, styles.alignItemsCenter, styles.mb1, styles.mb2, styles.textHeadline, styles.mr2, styles.holdRequestInline, translate],
    );

    return (
        <FeatureTrainingModal
            title={title}
            description={translate('iou.whatIsHoldExplain')}
            confirmText={translate('common.buttonConfirm')}
            image={Illustrations.HoldExpense}
            contentFitImage="cover"
            width={variables.holdEducationModalWidth}
            illustrationAspectRatio={CONST.ILLUSTRATION_ASPECT_RATIO}
            contentInnerContainerStyles={styles.mb5}
            modalInnerContainerStyle={styles.pt0}
            illustrationOuterContainerStyle={styles.p0}
            onClose={onClose}
            onConfirm={onConfirm}
        >
            <HoldMenuSectionList />
        </FeatureTrainingModal>
    );
}

ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';

export default ProcessMoneyRequestHoldMenu;
