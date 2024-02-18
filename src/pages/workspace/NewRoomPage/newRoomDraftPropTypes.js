import _ from 'lodash';
import PropTypes from 'prop-types';
import CONST from '@src/CONST';

const newRoomDraftPropTypes = PropTypes.shape({
    workspace: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
    }),
    visibility: PropTypes.shape({
        value: PropTypes.oneOf(_.values(CONST.REPORT.VISIBILITY)),
        label: PropTypes.string,
        description: PropTypes.string,
    }),
    writeCapability: PropTypes.shape({
        value: PropTypes.oneOf(_.values(CONST.REPORT.WRITE_CAPABILITIES)),
        label: PropTypes.string,
    }),
});

export default newRoomDraftPropTypes;
