import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextSelectorModal from '@components/TextPicker/TextSelectorModal';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';

type ListValuesSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Label to display on field */
    label: string;

    /** Subtitle to display on field */
    subtitle: string;

    /** Function to call when the user closes the list values selector modal */
    onClose: () => void;

    onValueAdded: (value: string) => void;
};

function ListValuesSelectorModal({isVisible, label, subtitle, onClose, onValueAdded}: ListValuesSelectorModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const onValueSelected = (value: string) => {
        hidePickerModal();
        onValueAdded(value);
    };

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={ListValuesSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                >
                    <View style={[styles.w100, styles.flexRow, styles.gap2, isSmallScreenWidth && styles.mb3]}>
                        <Button
                            style={[isSmallScreenWidth && styles.flex1]}
                            medium
                            success
                            icon={Expensicons.Plus}
                            text={translate('common.addValue')}
                            onPress={showPickerModal}
                        />
                    </View>
                </HeaderWithBackButton>
                <View style={[styles.ph5, styles.pb4]}>
                    <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText])}>{subtitle}</Text>
                </View>
                <TextSelectorModal
                    isVisible={isPickerVisible}
                    value=""
                    shouldClearOnClose
                    description={translate('common.addValue')}
                    onClose={hidePickerModal}
                    onValueSelected={onValueSelected}
                />
            </ScreenWrapper>
        </Modal>
    );
}

ListValuesSelectorModal.displayName = 'ListValuesSelectorModal';

export default ListValuesSelectorModal;
