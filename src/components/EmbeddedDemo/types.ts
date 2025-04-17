import type {DetailedHTMLProps, IframeHTMLAttributes} from 'react';
import type {WebViewProps} from 'react-native-webview';

type EmbeddedDemoProps = {
    url: string;
    iframeTitle?: string;
    iframeProps?: DetailedHTMLProps<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement> & Record<string, unknown>;
    webViewProps?: WebViewProps;
};

export default EmbeddedDemoProps;
