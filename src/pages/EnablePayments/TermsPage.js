import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import React from 'react';
import compose from '../../libs/compose';
import CollapsibleSection from '../../components/CollapsibleSection';

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
                <CollapsibleSection/>
                <CollapsibleSection/>
            </>
        );
    }
}

TermsPage.propTypes = propTypes;
TermsPage.defaultProps = defaultProps;
export default compose(
    withLocalize,
)(TermsPage);
