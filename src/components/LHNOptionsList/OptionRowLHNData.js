import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import _ from 'underscore';
import PropTypes from 'prop-types';
import {withReportCommentDrafts} from '../OnyxProvider';
import SidebarUtils from '../../libs/SidebarUtils';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import withCurrentReportID, {withCurrentReportIDPropTypes, withCurrentReportIDDefaultProps} from '../withCurrentReportID';
import OptionRowLHN, {propTypes as basePropTypes, defaultProps as baseDefaultProps} from './OptionRowLHN';

const propTypes = {
    shouldDisableFocusOptions: PropTypes.bool,
    ...withCurrentReportIDPropTypes,
    ...basePropTypes,
};

const defaultProps = {
    shouldDisableFocusOptions: false,
    ...withCurrentReportIDDefaultProps,
    ...baseDefaultProps,
};

/*
 * This component gets the data from onyx for the actual
 * OptionRowLHN component.
 * The OptionRowLHN component is memoized, so it will only
 * re-render if the data really changed.
 */
function OptionRowLHNData(props) {
    // We only want to pass a boolean to the memoized
    // component, thats why we have this intermediate component.
    // (We don't want to fully re-render all items, just because the active report changed).
    const isFocused = !props.shouldDisableFocusOptions && props.currentReportId === props.reportID;

    return (
        <OptionRowLHN
            // eslint-disable-next-line react/jsx-props-no-spreading
            {..._.omit(props, 'currentReportID')}
            isFocused={isFocused}
        />
    );
}

OptionRowLHNData.propTypes = propTypes;
OptionRowLHNData.defaultProps = defaultProps;
OptionRowLHNData.displayName = 'OptionRowLHNData';

export default compose(
    withCurrentReportID,
    withReportCommentDrafts({
        propName: 'comment',
        transformValue: (drafts, props) => {
            const draftKey = `${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${props.reportID}`;
            return lodashGet(drafts, draftKey, '');
        },
    }),
    withOnyx({
        optionItem: {
            key: (props) => ONYXKEYS.COLLECTION.REPORT + props.reportID,
            selector: SidebarUtils.getOptionData,
        },
    }),
)(OptionRowLHNData);
