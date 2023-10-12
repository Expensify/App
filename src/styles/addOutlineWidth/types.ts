import {CSSProperties} from 'react';
import {TextStyle} from 'react-native';

type AddOutlineWidth = (obj: TextStyle | CSSProperties, val?: number, error?: boolean) => TextStyle | CSSProperties;

export default AddOutlineWidth;
