import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import * as Illustrations from '@components/Icon/Illustrations';
import Text from '@components/Text';
import useThemeStyles from '@styles/useThemeStyles';

const propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
};

function DangerCardSection({title, description}) {
    const styles = useThemeStyles();
    return (
        <View style={[styles.pageWrapper, styles.walletDangerSection]}>
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.w100]}>
                <View style={[styles.flexShrink1]}>
                    <Text style={[styles.walletDangerSectionTitle, styles.mb1]}>{title}</Text>
                    <Text styles={[styles.walletDangerSectionText]}>{description}</Text>
                </View>
                <View>
                    <Illustrations.SmartScan />
                </View>
            </View>
        </View>
    );
}

DangerCardSection.propTypes = propTypes;
DangerCardSection.displayName = 'DangerCardSection';

export default DangerCardSection;
