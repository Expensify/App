import RNFastImage from '@pieter-pot/react-native-fast-image';

// eslint-disable-next-line
const Image = (props) => <RNFastImage {...props} />;

Image.displayName = 'FastImage';
Image.propTypes = RNFastImage.propTypes;
Image.resizeMode = RNFastImage.resizeMode;
export default Image;
