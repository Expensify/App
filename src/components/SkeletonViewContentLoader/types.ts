import type {IContentLoaderProps} from 'react-content-loader';
import type {IContentLoaderProps as NativeIContentLoaderProps} from 'react-content-loader/native';

type SkeletonViewContentLoaderProps = Omit<IContentLoaderProps, 'style'> & NativeIContentLoaderProps;

export default SkeletonViewContentLoaderProps;
