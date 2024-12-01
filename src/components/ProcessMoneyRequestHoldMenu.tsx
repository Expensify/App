import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useMemo} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import FeatureTrainingModal from './FeatureTrainingModal';
import HoldMenuSectionList from './HoldMenuSectionList';
import LottieAnimations from './LottieAnimations';
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
    const navigation = useNavigation();

    useEffect(() => {
        const unsub = navigation.addListener('beforeRemove', () => {
            onClose();
        });
        return unsub;
    }, [navigation, onClose]);

    const title = useMemo(
        () => (
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb3]}>
                <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text>
                <TextPill textStyles={styles.holdRequestInline}>{translate('violations.hold')}</TextPill>
            </View>
        ),
        [styles.flexRow, styles.alignItemsCenter, styles.mb3, styles.textHeadline, styles.mr2, styles.holdRequestInline],
    );

    return (
        <FeatureTrainingModal
            animation={LottieAnimations.PreferencesDJ}
            title={title}
            description={translate('iou.whatIsHoldExplain')}
            confirmText={translate('common.buttonConfirm')}
            onClose={onClose}
            onConfirm={onConfirm}
            children={<HoldMenuSectionList />}
            videoAspectRatio={LottieAnimations.PreferencesDJ.w / LottieAnimations.PreferencesDJ.h}
        />
    );
}

ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';

export default ProcessMoneyRequestHoldMenu;
