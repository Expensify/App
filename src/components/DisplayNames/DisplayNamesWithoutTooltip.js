import PropTypes from 'prop-types';
import React, {useRef} from 'react';
import {get} from 'lodash';
import styles from '../../styles/styles';
import Text from '../Text';
import RenderHTML from '../RenderHTML';
import * as ReportUtils from '../../libs/ReportUtils';
import reportPropTypes from '../../pages/reportPropTypes';

const propTypes = {
    /** The full title of the DisplayNames component (not split up) */
    fullTitle: PropTypes.string,

    /** The report currently being looked at */
    report: reportPropTypes,

    /** Arbitrary styles of the displayName text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Number of lines before wrapping */
    numberOfLines: PropTypes.number,
};

const defaultProps = {
    fullTitle: '',
    textStyles: [],
    report: {},
    numberOfLines: 1,
};

function DisplayNamesWithoutTooltip({textStyles, numberOfLines, fullTitle, report}) {
    const ref = useRef();
    let fullTitleHtml = ReportUtils.getReportName(report, undefined, true, get(ref.current, 'offsetWidth'));
    fullTitleHtml = ReportUtils.containsHtml(fullTitleHtml) ? fullTitleHtml : '';

    const title = fullTitleHtml ? <RenderHTML html={fullTitleHtml} /> : fullTitle;

    return (
        <Text
            style={[...textStyles, numberOfLines === 1 ? styles.pre : styles.preWrap]}
            numberOfLines={numberOfLines}
            ref={ref}
        >
            {title}
        </Text>
    );
}

DisplayNamesWithoutTooltip.propTypes = propTypes;
DisplayNamesWithoutTooltip.defaultProps = defaultProps;
DisplayNamesWithoutTooltip.displayName = 'DisplayNamesWithoutTooltip';

export default DisplayNamesWithoutTooltip;
