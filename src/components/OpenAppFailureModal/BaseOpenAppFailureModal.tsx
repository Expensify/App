import Button from '@components/ButtonComposed';
import Header from '@components/Header';
import Modal from '@components/Modal';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useBottomSafeSafeAreaPaddingStyle from '@hooks/useBottomSafeSafeAreaPaddingStyle';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {setIsOpenAppFailureModalOpen} from '@libs/actions/isOpenAppFailureModalOpen';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';
import {View} from 'react-native';

type BaseOpenAppFailureModalProps = {
    onRefreshAndTryAgainButtonPress: () => void;
};

function BaseOpenAppFailureModal({onRefreshAndTryAgainButtonPress}: BaseOpenAppFailureModalProps) {
    const [isOpenAppFailureModalOpen = false] = useOnyx(ONYXKEYS.IS_OPEN_APP_FAILURE_MODAL_OPEN);
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to be consistent with BaseModal component
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const bottomSafeAreaPaddingStyle = useBottomSafeSafeAreaPaddingStyle({addBottomSafeAreaPadding: isSmallScreenWidth, addOfflineIndicatorBottomSafeAreaPadding: false, style: styles.p6});

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            isVisible={isOpenAppFailureModalOpen}
            shouldTreatModalAsCovering
            innerContainerStyle={styles.pv0}
            onClose={() => setIsOpenAppFailureModalOpen(false)}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <View style={bottomSafeAreaPaddingStyle}>
                <Header
                    title={translate('openAppFailureModal.title')}
                    textStyles={[styles.mb2]}
                />
                <Text style={[styles.mb6]}>
                    {`${translate('openAppFailureModal.subtitle')} `}
                    <TextLink
                        href={`mailto:${CONST.EMAIL.CONCIERGE}`}
                        style={[styles.link]}
                    >
                        {CONST.EMAIL.CONCIERGE}
                    </TextLink>
                </Text>
                <Button
                    size={CONST.BUTTON_SIZE.LARGE}
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    style={[styles.mb3]}
                    onPress={onRefreshAndTryAgainButtonPress}
                >
                    <Button.Text>{translate('openAppFailureModal.refreshAndTryAgain')}</Button.Text>
                </Button>
                <Button
                    size={CONST.BUTTON_SIZE.LARGE}
                    onPress={() => setIsOpenAppFailureModalOpen(false)}
                >
                    <Button.Text>{translate('common.close')}</Button.Text>
                </Button>
            </View>
        </Modal>
    );
}

export default BaseOpenAppFailureModal;
