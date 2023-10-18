import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import CONST from '../../CONST';
import HeaderWithBackButton from '../HeaderWithBackButton';
import SelectionList from '../SelectionList';
import Modal from '../Modal';
import ScreenWrapper from '../ScreenWrapper';
import styles from '../../styles/styles';

const propTypes = {
    /** Whether the modal is visible */
    isVisible: PropTypes.bool.isRequired,

    /** Current value selected  */
    currentValue: PropTypes.string,

    /** Items to pick from */
    items: PropTypes.arrayOf(PropTypes.shape({value: PropTypes.string, label: PropTypes.string})),

    /** The selected item */
    selectedItem: PropTypes.shape({value: PropTypes.string, label: PropTypes.string}),

    /** Label for values */
    label: PropTypes.string,

    /** Function to call when the user selects a item */
    onItemSelected: PropTypes.func,

    /** Function to call when the user closes the modal */
    onClose: PropTypes.func,
};

const defaultProps = {
    currentValue: '',
    items: [],
    selectedItem: {},
    label: '',
    onClose: () => {},
    onItemSelected: () => {},
};

function ValueSelectorModal({currentValue, items, selectedItem, label, isVisible, onClose, onItemSelected}) {
    const [sectionsData, setSectionsData] = useState([]);

    useEffect(() => {
        const itemsData = _.map(items, (item) => ({value: item.value, keyForList: item.value, text: item.label, isSelected: item === selectedItem}));
        setSectionsData(itemsData);
    }, [items, selectedItem]);

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
                testID="ValueSelectorModal"
            >
                <HeaderWithBackButton
                    title={label}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    sections={[{data: sectionsData}]}
                    onSelectRow={onItemSelected}
                    initiallyFocusedOptionKey={currentValue}
                />
            </ScreenWrapper>
        </Modal>
    );
}

ValueSelectorModal.propTypes = propTypes;
ValueSelectorModal.defaultProps = defaultProps;
ValueSelectorModal.displayName = 'ValueSelectorModal';

export default ValueSelectorModal;
