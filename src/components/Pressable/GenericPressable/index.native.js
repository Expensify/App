import GenericPressable from './GenericPressable';

const WebGenericPressable = (props) => {
    const accessibilityMappedProps = props;
    // eslint-disable-next-line react/jsx-props-no-spreading
    return <GenericPressable {...accessibilityMappedProps} />;
};

export default WebGenericPressable;
