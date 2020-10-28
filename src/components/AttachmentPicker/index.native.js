import React, {createRef} from 'react';
import PropTypes from 'prop-types';
import AttachmentPickerNative from '../../libs/AttachmentPickerNative';

const propTypes = {
    children: PropTypes.func.isRequired,
};

class AttachmentPicker extends React.Component {
    constructor(props) {
        super(props);
        this.onChangeCallback = createRef();
    }

    render() {
        return this.props.children({
            show: (callback) => {
                AttachmentPickerNative.show((response) => {
                    callback(AttachmentPickerNative.getDataForUpload(response));
                });
            },
        });
    }
}

AttachmentPicker.propTypes = propTypes;
export default AttachmentPicker;
