import React from 'react';
import LongTermsForm from './LongTermsForm';
import withLocalize, {withLocalizePropTypes} from '../../../components/withLocalize';
import compose from '../../../libs/compose';
import ShortTermsForm from './ShortTermsForm';

const propTypes = {
    ...withLocalizePropTypes,
};

const defaultProps = {

};

class TermsPage extends React.Component {
    render() {
        return (
            <>
                {/*Short Form*/}
                <ShortTermsForm/>

                {/*Long Form*/}
                <LongTermsForm/>
            </>
        );
    }
}

TermsPage.propTypes = propTypes;
TermsPage.defaultProps = defaultProps;
export default compose(
    withLocalize,
)(TermsPage);
