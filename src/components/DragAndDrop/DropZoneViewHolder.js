import React from 'react';
import {PortalHost} from '@gorhom/portal';
import PropTypes from 'prop-types';

const propTypes = {
    /** Name which will be used to associate view holder with its dropzone */
    name: PropTypes.string.isRequired,
};

const DropZoneViewHolder = props => (
    <PortalHost name={props.name} />
);

DropZoneViewHolder.displayName = 'DropZoneViewHolder';
DropZoneViewHolder.propTypes = propTypes;

export default DropZoneViewHolder;
