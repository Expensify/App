import HeaderWithBackButtonComponent from './HeaderWithBackButton';

function HeaderWithBackButtonBase(props: React.ComponentProps<typeof HeaderWithBackButtonComponent>) {
    return <HeaderWithBackButtonComponent {...props} />;
}

const HeaderWithBackButtonComposed = Object.assign(HeaderWithBackButtonBase, {});

export default HeaderWithBackButtonComposed;
