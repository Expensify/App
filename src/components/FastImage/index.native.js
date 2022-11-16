import RNFastImage from '@pieter-pot/react-native-fast-image';

// eslint-disable-next-line
const FastImage = (props) => <RNFastImage {...props} />;

FastImage.displayName = 'FastImage';
FastImage.propTypes = RNFastImage.propTypes;
FastImage.resizeMode = RNFastImage.resizeMode;
export default FastImage;
