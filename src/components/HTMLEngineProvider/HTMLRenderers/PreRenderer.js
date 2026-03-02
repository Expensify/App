import React from 'react';
import {ScrollView} from 'react-native';
import {Text} from 'react-native';
import htmlRendererPropTypes from './htmlRendererPropTypes';
import Text from '../../Text';
import styles from '../../../styles/styles';
            showsHorizontalScrollIndicator={false}
            style={[styles.w100, styles.taskDescriptionScrollView]}
        >
            <Text style={[styles.textSupporting, styles.pre]} selectable>{props.tnode.data}</Text>
        </ScrollView>
    );
};