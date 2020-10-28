import React, {createRef} from 'react';
import AttachmentPickerNative from '../../libs/AttachmentPickerNative';

export default class AttachmentPicker extends React.Component {
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
        })
    }
}
