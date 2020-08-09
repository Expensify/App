import {StyleSheet} from 'react-native';

const styles = StyleSheet.create({
    // Utility classes
    mr1: {
        marginRight: 10,
    },
    p1: {
        padding: 10,
    },
    h100p: {
        height: '100%',
    },
    flex1: {
        flex: 1,
    },
    flexRow: {
        flexDirection: 'row',
    },
    flexColumn: {
        flexDirection: 'column',
    },
    flexGrow1: {
        flexGrow: 1,
    },
    flexGrow4: {
        flexGrow: 4,
    },
    nav: {
        backgroundColor: '#efefef',
        padding: 20,
    },
    brand: {
        fontSize: 25,
        fontWeight: 'bold',
    },
    navText: {
        padding: 8,
    },

    // @TODO I can't get this style to work in `SidebarLink.js`
    sidebarLink: {
        padding: 8,
        textDecorationLine: 'none',
    },
});

export default styles;
