import React from 'react';
import PropTypes from 'prop-types';
import CONST from '../CONST';
import Banner from './Banner';
import withLocalize, {withLocalizePropTypes} from './withLocalize';

const propTypes = {
    /** The reason this report was archived. */
    archiveReason: PropTypes.string,

    ...withLocalizePropTypes,
};

const defaultProps = {
    archiveReason: CONST.REPORT.ARCHIVE_REASON.DEFAULT,
};

// TODO: pass displayName, policyName, and other parameters to translate()
const ArchivedReportFooter = props => (
    <Banner
        text={props.translate(`reportArchiveReasons.${props.archiveReason}`)}
        shouldRenderHTML={props.archiveReason === CONST.REPORT.ARCHIVE_REASON.DEFAULT}
    />
);

ArchivedReportFooter.propTypes = propTypes;
ArchivedReportFooter.defaultProps = defaultProps;
ArchivedReportFooter.displayName = 'ArchivedReportFooter';

export default withLocalize(ArchivedReportFooter);
