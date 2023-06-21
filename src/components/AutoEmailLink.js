import React from 'react';
import PropTypes from 'prop-types';
import _ from 'underscore';
import {CONST} from 'expensify-common/lib/CONST';
import Text from './Text';
import TextLink from './TextLink';
import styles from '../styles/styles';

const propTypes = {
    text: PropTypes.string.isRequired,
    style: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.object), PropTypes.object]),
};

const defaultProps = {
    style: [],
};

/*
 * This is a "utility component", that does this:
 *     - Checks if a text contains any email. If it does, render it as a mailto: link
 *     - Else just render it inside `Text` component
 */

function AutoEmailLink(props) {
    return (
        <Text style={props.style}>
            {_.map(props.text.split(CONST.REG_EXP.EXTRACT_EMAIL), (str, index) => {
                if (CONST.REG_EXP.EMAIL.test(str)) {
                    return (
                        <TextLink
                            key={`${index}-${str}`}
                            href={`mailto:${str}`}
                            style={styles.link}
                        >
                            {str}
                        </TextLink>
                    );
                }

                return (
                    <Text
                        style={props.style}
                        key={`${index}-${str}`}
                    >
                        {str}
                    </Text>
                );
            })}
        </Text>
    );
}

AutoEmailLink.displayName = 'AutoEmailLink';
AutoEmailLink.propTypes = propTypes;
AutoEmailLink.defaultProps = defaultProps;
export default AutoEmailLink;
