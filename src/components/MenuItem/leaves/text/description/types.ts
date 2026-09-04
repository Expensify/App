/** Props shared by every description leaf of a `MenuItem.Content` */
type MenuItemDescriptionProps = {
    /** Text to render as the description */
    children: string | number;

    /** Maximum number of lines to render before the text is truncated */
    numberOfLines?: number;
};

export default MenuItemDescriptionProps;
