const centerContent = {
    alignItems: 'center',
    justifyContent: 'center',
} as const;

const buttonContainerBase = {
    ...centerContent,
    borderRadius: 20,
    paddingHorizontal: 14,
} as const;

const boldTextBase = {
    fontWeight: 'bold',
} as const;

const boldText11 = {
    ...boldTextBase,
    fontSize: 11,
} as const;

const boldTextWhite = {
    ...boldTextBase,
    color: 'white',
} as const;

const columnFullWidth = {
    flexDirection: 'column',
    width: '100%',
} as const;

const bottomSheetBase = {
    ...columnFullWidth,
    gap: 10,
    position: 'absolute',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    bottom: 0,
    padding: 30,
    backgroundColor: '#FCFBF9',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
} as const;

const styles = {
    container: {
        display: 'flex',
        ...centerContent,
        width: '90%',
        gap: 5,
        backgroundColor: '#F8F4F0',
        borderRadius: 5,
    },
    callbackContainer: {
        ...bottomSheetBase,
        height: 200,
    },
    inputContainer: {
        ...bottomSheetBase,
        height: 250,
    },
    gap15: {
        gap: 15,
    },
    textInput: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E6E1DA',
        width: 250,
        borderRadius: 10,
        textAlign: 'center',
        letterSpacing: 5,
        alignSelf: 'center',
        fontSize: 20,
        marginBottom: 5,
    },
    innerInputContainer: {
        ...columnFullWidth,
        gap: 10,
        justifyContent: 'flex-end',
    },
    layoutContainerWithModal: {
        backgroundColor: '#EBE6DF',
        filter: 'blur(3px)',
    },
    layoutContainer: {
        flex: 1,
        ...centerContent,
        backgroundColor: '#FCFBF9',
        gap: 40,
    },
    content: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    button: {
        ...buttonContainerBase,
        backgroundColor: '#E6E1DA',
        paddingVertical: 9,
    },
    buttonText: {
        ...boldText11,
    },
    greenButtonText: {
        ...boldTextWhite,
        fontSize: 15,
    },
    greenButton: {
        ...buttonContainerBase,
        paddingVertical: 10,
        width: '100%',
        backgroundColor: '#03D47C',
    },
    buttonNegative: {
        ...buttonContainerBase,
        paddingVertical: 10,
        width: '100%',
        backgroundColor: '#F25730',
    },
    buttonNegativeSmall: {
        ...buttonContainerBase,
        paddingVertical: 10,
        width: 80,
        backgroundColor: '#F25730',
    },
    buttonTextNegative: {
        ...boldText11,
        color: '#fff',
    },
    title: {
        fontSize: 15,
    },
    hugeText: {
        fontSize: 17,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 5,
    },
} as const;

export default styles;
