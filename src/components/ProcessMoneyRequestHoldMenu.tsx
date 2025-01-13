import {useNavigation} from '@react-navigation/native';
import React, {useCallback, useEffect, useRef} from 'react';
import {Keyboard, View} from 'react-native';
import type {EmitterSubscription} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type AnchorAlignment from '@src/types/utils/AnchorAlignment';
import Button from './Button';
import HoldMenuSectionList from './HoldMenuSectionList';
import type {PopoverAnchorPosition} from './Modal/types';
import Popover from './Popover';
import Text from './Text';
import TextPill from './TextPill';

let keyboardDidShowListener: EmitterSubscription | null = null;
type ProcessMoneyRequestHoldMenuProps = {
    /** Whether the content is visible */
    isVisible: boolean;

    /** Method to trigger when pressing outside of the popover menu to close it */
    onClose: () => void;

    /** Method to trigger when pressing confirm button */
    onConfirm: () => void;

    /** The anchor position of the popover menu */
    anchorPosition?: PopoverAnchorPosition;

    /** The anchor alignment of the popover menu */
    anchorAlignment?: AnchorAlignment;
};

function ProcessMoneyRequestHoldMenu({isVisible, onClose, onConfirm, anchorPosition, anchorAlignment}: ProcessMoneyRequestHoldMenuProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const popoverRef = useRef(null);
    const navigation = useNavigation();

    useEffect(() => {
        const unsub = navigation.addListener('beforeRemove', () => {
            onClose();
        });
        return unsub;
    }, [navigation, onClose]);

    const addKeyboardListener = useCallback(() => {
        keyboardDidShowListener = Keyboard.addListener('keyboardWillShow', () => {
            Keyboard.dismiss();
        });
    }, []);

    const removeKeyboardListener = useCallback(() => {
        keyboardDidShowListener?.remove();
    }, []);

    return (
        <Popover
            isVisible={isVisible}
            onClose={onClose}
            anchorPosition={anchorPosition}
            anchorRef={popoverRef}
            anchorAlignment={anchorAlignment}
            disableAnimation={false}
            withoutOverlay={false}
            shouldCloseWhenBrowserNavigationChanged={false}
            onModalShow={addKeyboardListener}
            onModalHide={removeKeyboardListener}
        >
            <View style={[styles.mh5, styles.mv5]}>
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mb5]}>
                    <Text style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text>
                    <TextPill textStyles={styles.holdRequestInline}>{translate('violations.hold')}</TextPill>
                </View>
                <HoldMenuSectionList />
                <Button
                    success
                    style={[styles.mt5]}
                    text={translate('common.buttonConfirm')}
                    onPress={onConfirm}
                    large
                />
            </View>
        </Popover>
    );
}

ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';

export default ProcessMoneyRequestHoldMenu;
