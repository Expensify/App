import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import CONST from '../../CONST';
import useLocalize from '../../hooks/useLocalize';
import HeaderWithBackButton from '../HeaderWithBackButton';
import SelectionList from '../SelectionList';
import Modal from '../Modal';
import ScreenWrapper from '../ScreenWrapper';
import styles from '../../styles/styles';
import _ from 'lodash';

const propTypes = {
    /** Whether the modal is visible */
    isVisible: PropTypes.bool.isRequired,

    /** Country value selected  */
    currentCountry: PropTypes.string,

    /** Items to pick from */
    items: PropTypes.arrayOf(PropTypes.shape({value: PropTypes.string, label: PropTypes.string})),

    /** Function to call when the user selects a Country */
    onCountrySelected: PropTypes.func,

    /** Function to call when the user closes the Country modal */
    onClose: PropTypes.func,
};

const defaultProps = {
    currentCountry: '',
    items: [],
    onClose: () => {},
    onCountrySelected: () => {},
};

function ValueSelectorModal({currentCountry, items, isVisible, onClose, onCountrySelected}) {
    const [sectionsData, setSectionsData] = useState([]);

    
    useEffect(() => {
        const itemsData = _.map(items, (item) => ({value: item.value, keyForList: item.value, text: item.label, isSelected: true}));
        setSectionsData(itemsData);
    }, [items]);

    const {translate} = useLocalize();

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
            >
                <HeaderWithBackButton
                    title={translate('common.country')}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    sections={[{data: sectionsData, indexOffset: 0}]}
                    onSelectRow={onCountrySelected}
                    initiallyFocusedOptionKey={currentCountry}
                />
            </ScreenWrapper>
        </Modal>
    );
}

ValueSelectorModal.propTypes = propTypes;
ValueSelectorModal.defaultProps = defaultProps;
ValueSelectorModal.displayName = 'ValueSelectorModal';

export default ValueSelectorModal;
