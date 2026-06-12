import {View} from 'react-native';
import Icon from '@components/Icon';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import useConfirmModal from '@hooks/useConfirmModal';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {resetGPSDraftDetails} from '@libs/actions/GPSDraftDetails';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import {isTripStopped as isTripStoppedUtil} from '@src/libs/GPSDraftDetailsUtils';
import ONYXKEYS from '@src/ONYXKEYS';

function DiscardGPSTripButton() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan']);

    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);

    const {showConfirmModal} = useConfirmModal();

    const showDiscardConfirmation = () => {
        showConfirmModal({
            title: translate('gps.discardDistanceTrackingModal.title'),
            prompt: translate('gps.discardDistanceTrackingModal.prompt'),
            danger: true,
            confirmText: translate('gps.discardDistanceTrackingModal.confirm'),
            cancelText: translate('common.cancel'),
        }).then((result) => {
            if (result.action !== ModalActions.CONFIRM) {
                return;
            }

            resetGPSDraftDetails();
        });
    };

    const isTripStopped = isTripStoppedUtil(gpsDraftDetails);

    if (!isTripStopped) {
        return null;
    }

    return (
        <PressableWithoutFeedback
            accessibilityLabel={translate('gps.discard')}
            accessibilityRole="button"
            onPress={showDiscardConfirmation}
            sentryLabel={CONST.SENTRY_LABEL.IOU_REQUEST_STEP.GPS_DISCARD_BUTTON}
        >
            <View style={styles.primaryMediumIcon}>
                <Icon
                    fill={theme.icon}
                    src={icons.Trashcan}
                    width={variables.iconSizeSmall}
                    height={variables.iconSizeSmall}
                />
            </View>
        </PressableWithoutFeedback>
    );
}

export default DiscardGPSTripButton;
