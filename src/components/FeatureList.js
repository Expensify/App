import _ from 'underscore';
import React from 'react';
import PropTypes from 'prop-types';
import menuItemPropTypes from './menuItemPropTypes';
import MenuItem from './MenuItem';
import styles from '../styles/styles';
import useLocalize from '../hooks/useLocalize';

const propTypes = {
    /** A list of menuItems representing the feature list. */
    menuItems: PropTypes.arrayOf(PropTypes.shape(menuItemPropTypes)).isRequired,
};

function FeatureList({menuItems}) {
    const {translate} = useLocalize();
    return (
        <>
            {_.map(menuItems, ({translationKey, icon}) => (
                <MenuItem
                    key={translationKey}
                    title={translate(translationKey)}
                    icon={icon}
                    iconWidth={60}
                    iconHeight={60}
                    iconStyles={[styles.mr3, styles.ml3]}
                    interactive={false}
                />
            ))}
        </>
    );
}

FeatureList.propTypes = propTypes;
FeatureList.displayName = 'FeatureList';

export default FeatureList;
