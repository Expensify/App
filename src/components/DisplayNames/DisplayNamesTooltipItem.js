import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import styles from '../../styles/styles';
import Text from '../Text';
import UserDetailsTooltip from '../UserDetailsTooltip';

const propTypes = {
    index: PropTypes.number,

    /** The full title of the DisplayNames component (not split up) */
    getTooltipShiftX: PropTypes.func,

    /** The Account ID for the tooltip */
    accountID: PropTypes.number,

    /** The name to display in bold */
    displayName: PropTypes.string,

    /** The login for the tooltip fallback */
    login: PropTypes.string,

    /** The avatar for the tooltip fallback */
    avatar: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /** Arbitrary styles of the displayName text */
    // eslint-disable-next-line react/forbid-prop-types
    textStyles: PropTypes.arrayOf(PropTypes.object),

    /** Refs to all the names which will be used to correct the horizontal position of the tooltip */
    childRefs: PropTypes.shape({
        // eslint-disable-next-line react/forbid-prop-types
        current: PropTypes.arrayOf(PropTypes.object),
    }),
};

const defaultProps = {
    index: 0,
    getTooltipShiftX: () => {},
    accountID: 0,
    displayName: '',
    login: '',
    avatar: '',
    textStyles: [],
    childRefs: {current: []},
};

function DisplayNamesTooltipItem({index, getTooltipShiftX, accountID, avatar, login, displayName, textStyles, childRefs}) {
    const tooltipIndexBridge = useCallback(() => getTooltipShiftX(index), [getTooltipShiftX, index]);

    return (
        <UserDetailsTooltip
            key={index}
            accountID={accountID}
            fallbackUserDetails={{
                avatar,
                login,
                displayName,
            }}
            shiftHorizontal={tooltipIndexBridge}
        >
            {/* We need to get the refs to all the names which will be used to correct the horizontal position of the tooltip */}
            <Text
                eslint-disable-next-line
                no-param-reassign
                // eslint-disable-next-line no-param-reassign
                ref={(el) => (childRefs.current[index] = el)}
                style={[...textStyles, styles.pre]}
            >
                {displayName}
            </Text>
        </UserDetailsTooltip>
    );
}

DisplayNamesTooltipItem.propTypes = propTypes;
DisplayNamesTooltipItem.defaultProps = defaultProps;
DisplayNamesTooltipItem.displayName = 'DisplayNamesTooltipItem';

export default DisplayNamesTooltipItem;
