import React, {Fragment} from 'react';
import _ from 'underscore';
import {propTypes, defaultProps} from './displayNamesPropTypes';
import Text from '../Text';
import styles from '../../styles/styles';

function DisplayNames(props) {
    return (
        <Text
            accessibilityLabel={props.accessibilityLabel}
            style={props.textStyles}
            numberOfLines={props.numberOfLines}
        >
            {props.shouldUseFullTitle
                ? props.fullTitle
                : _.map(props.displayNamesWithTooltips, ({displayName}, index) => (
                      <Fragment key={index}>
                          <Text style={[...props.textStyles, styles.pre]}>{displayName}</Text>
                          {index < props.displayNamesWithTooltips.length - 1 && <Text style={props.textStyles}>,&nbsp;</Text>}
                      </Fragment>
                  ))}
        </Text>
    );
}

DisplayNames.propTypes = propTypes;
DisplayNames.defaultProps = defaultProps;
DisplayNames.displayName = 'DisplayNames';

export default DisplayNames;
