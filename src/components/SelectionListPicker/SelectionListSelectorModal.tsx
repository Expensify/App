import React, {useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import SelectionList from '@components/SelectionList';
import type {ListItem} from '@components/SelectionList/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {SelectionListSelectorModalProps} from './types';

function SelectionListSelectorModal<TItem extends ListItem>({value, description = '', onValueSelected, isVisible, onClose, ...rest}: SelectionListSelectorModalProps<TItem>) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [currentValue, setValue] = useState(value);

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
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={SelectionListSelectorModal.displayName}
                shouldEnableMaxHeight
                style={[styles.pb0]}
            >
                <HeaderWithBackButton
                    title={description}
                    onBackButtonPress={onClose}
                />
                <ScrollView contentContainerStyle={[styles.flexGrow1, styles.mb5]}>
                    <View style={styles.flex1}>
                        <SelectionList<TItem>
                            // eslint-disable-next-line react/jsx-props-no-spreading
                            {...rest}
                            // value={currentValue}
                            onSelectRow={setValue}
                        />
                        <Button
                            success
                            large
                            pressOnEnter
                            text={translate('common.save')}
                            onPress={() => onValueSelected?.(currentValue)}
                            style={styles.mh5}
                        />
                    </View>
                </ScrollView>
            </ScreenWrapper>
        </Modal>
    );
}

SelectionListSelectorModal.displayName = 'SelectionListSelectorModal';

export default SelectionListSelectorModal;
