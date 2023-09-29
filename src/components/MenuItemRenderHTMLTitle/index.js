import React from 'react';
import {View} from 'react-native';
import styles from '../../styles/styles';
import RenderHTML from '../RenderHTML';
import menuItemRenderHTMLTitlePropTypes from './propTypes';

const propTypes = menuItemRenderHTMLTitlePropTypes;

const defaultProps = {};

function MenuItemRenderHTMLTitle(props) {
    return (
        <View style={styles.renderHTMLTitle}>
            <RenderHTML html={props.title} />
        </View>
    );
}

MenuItemRenderHTMLTitle.propTypes = propTypes;
MenuItemRenderHTMLTitle.defaultProps = defaultProps;
MenuItemRenderHTMLTitle.displayName = 'MenuItemRenderHTMLTitle';

export default MenuItemRenderHTMLTitle;
