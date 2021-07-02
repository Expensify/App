import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import React from 'react';
import compose from '../../libs/compose';
import AccordionView from '../../components/Collapsible';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {

};

class TermsPage extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <>
                <AccordionView/>
            </>
        );
    }
}

TermsPage.propTypes = propTypes;
TermsPage.defaultProps = defaultProps;
export default compose(
    withLocalize,
)(TermsPage);
