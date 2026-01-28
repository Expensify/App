import type {ReactNode} from 'react';
import React from 'react';
import {View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import Header from './Header';
import Modal from './Modal';
import RenderHTML from './RenderHTML';

type DecisionModalProps = {
    /** Modal content */
    children: ReactNode;

    /** Is the window width narrow, like on a mobile device? */
    isSmallScreenWidth: boolean;

    /** Whether modal is visible */
    isVisible: boolean;

    /** Callback for closing modal */
    onClose: () => void;
};

type DecisionModalHeaderProps = {
    /** Title describing purpose of modal */
    title: string;
};

type DecisionModalContentProps = {
    /** HTML content to render */
    html: string;
};

type DecisionModalFooterProps = {
    /** Footer content */
    children: ReactNode;
};

function DecisionModal({children, isSmallScreenWidth, isVisible, onClose}: DecisionModalProps) {
    const styles = useThemeStyles();
    return (
        <Modal
            onClose={onClose}
            isVisible={isVisible}
            type={isSmallScreenWidth ? CONST.MODAL.MODAL_TYPE.BOTTOM_DOCKED : CONST.MODAL.MODAL_TYPE.CONFIRM}
            innerContainerStyle={styles.pv0}
        >
            <View style={styles.m5}>{children}</View>
        </Modal>
    );
}

function DecisionModalHeader({title}: DecisionModalHeaderProps) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.flexRow, styles.mb5]}>
            <Header
                title={title}
                containerStyles={styles.alignItemsCenter}
            />
        </View>
    );
}

function DecisionModalContent({html}: DecisionModalContentProps) {
    return <RenderHTML html={html} />;
}

function DecisionModalFooter({children}: DecisionModalFooterProps) {
    const styles = useThemeStyles();
    return <View style={styles.mt5}>{children}</View>;
}

DecisionModal.Header = DecisionModalHeader;
DecisionModal.Content = DecisionModalContent;
DecisionModal.Footer = DecisionModalFooter;

export default DecisionModal;
