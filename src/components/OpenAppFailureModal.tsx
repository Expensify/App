import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Modal from '@components/Modal';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOpenAppReset from '@hooks/useOpenAppReset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {setIsOpenAppFailureModalOpen} from '@libs/actions/isOpenAppFailureModalOpen';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Header from './Header';

function OpenAppFailureModal() {
    const [isOpenAppFailureModalOpen = false] = useOnyx(ONYXKEYS.IS_OPEN_APP_FAILURE_MODAL_OPEN, {canBeMissing: true});
    const styles = useThemeStyles();
    const resetOpenApp = useOpenAppReset();
    const {translate} = useLocalize();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to be consistent with BaseModal component
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    return (
        <Modal
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            isVisible={isOpenAppFailureModalOpen}
            innerContainerStyle={styles.pv0}
            onClose={() => setIsOpenAppFailureModalOpen(false)}
        >
            <View style={[styles.p6]}>
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
                    large
                    success
                    style={[styles.mb3]}
                    text={translate('openAppFailureModal.refreshAndTryAgain')}
                    onPress={() => {
                        setIsOpenAppFailureModalOpen(false);
                        resetOpenApp();
                    }}
                />
                <Button
                    large
                    text={translate('common.close')}
                    onPress={() => setIsOpenAppFailureModalOpen(false)}
                />
            </View>
        </Modal>
    );
}

OpenAppFailureModal.displayName = 'OpenAppFailureModal';

export default OpenAppFailureModal;
