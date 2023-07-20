import _ from 'underscore';
import React from 'react';
import {View} from 'react-native';
import PropTypes from 'prop-types';
import menuItemPropTypes from './menuItemPropTypes';
import MenuItem from './MenuItem';
import styles from '../styles/styles';
import useLocalize from '../hooks/useLocalize';
import Text from './Text';

const propTypes = {
    /** A list of menuItems representing the feature list. */
    menuItems: PropTypes.arrayOf(PropTypes.shape({...menuItemPropTypes, translationKey: PropTypes.string})).isRequired,

    /** A headline translation key to show above the feature list. */
    headline: PropTypes.string.isRequired,

    /** A description translation key to show below the headline and above the feature list. */
    description: PropTypes.string.isRequired,
};

function FeatureList({menuItems, headline, description}) {
    const {translate} = useLocalize();
    return (
        <>
            <View style={[styles.w100, styles.ph5, styles.pb5]}>
                <Text
                    style={[styles.textHeadline, styles.preWrap, styles.mb2]}
                    numberOfLines={2}
                >
                    {translate(headline)}
                </Text>
                <Text style={styles.baseFontStyle}>{translate(description)}</Text>
            </View>
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
