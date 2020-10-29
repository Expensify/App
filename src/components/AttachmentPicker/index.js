import React, {createRef} from 'react';
import PropTypes from 'prop-types';

const propTypes = {
    children: PropTypes.func.isRequired,
};

/**
 * This component renders a function as a child and
 * returns a "show attachment picker" method that takes
 * a callback. This is the web/mWeb/desktop version since
 * on iOS Safari we must append a hidden input to the DOM
 * and listen to onChange event.
 *
 * e.g.
 *
 * <AttachmentPicker>
 *     {({show}) => (
 *         <Button onPress={() => show(someCallback)} />
 *     )}
 * </AttachmentPicker>
 */
class AttachmentPicker extends React.Component {
    constructor(props) {
        super(props);
        this.onChangeCallback = createRef();
    }

    render() {
        return (
            <>
                <input
                    hidden
                    type="file"
                    ref={el => this.fileInput = el}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        file.uri = URL.createObjectURL(file);
                        this.onChangeCallback.current(file);
                    }}
                />
                {this.props.children({
                    show: (callback) => {
                        this.onChangeCallback.current = callback;
                        this.fileInput.click();
                    },
                })}
            </>
        );
    }
}

AttachmentPicker.propTypes = propTypes;
export default AttachmentPicker;
