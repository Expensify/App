import HeaderTitleComponent from './HeaderTitle';

function HeaderTitleBase(props: React.ComponentProps<typeof HeaderTitleComponent>) {
    return <HeaderTitleComponent {...props} />;
}

const HeaderTitleComposed = Object.assign(HeaderTitleBase, {});

export default HeaderTitleComposed;
