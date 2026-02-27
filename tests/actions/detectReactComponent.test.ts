import {detectReactComponent} from '../../.github/actions/javascript/authorChecklist/categories/newComponentCategory';

describe('detectReactComponent test', () => {
    it('should return undefined if no code is provided', () => {
        const result = detectReactComponent('', 'filename.js');

        expect(result).toBeUndefined();
    });

    it('should detect if code is React component', () => {
        const code = `
            function Component() {
                return <div>Hello World</div>;
            }
        `;
        const result = detectReactComponent(code, 'filename.js');

        expect(result).toBe(true);
    });

    it('should detect if code is a Arrow function component', () => {
        const code = `
            const Component = () => {
                return <div>Hello World</div>;
            }
        `;
        const result = detectReactComponent(code, 'filename.js');

        expect(result).toBe(true);
    });

    it('should detect if code is in typescript', () => {
        const code = `
            const Component = ({text}: {text: string}) => {
                return <div>{text}</div>;
            }
        `;
        const result = detectReactComponent(code, 'filename.js');

        expect(result).toBe(true);
    });

    it('should detect if code is a Class component', () => {
        const code = `
            class SomeComponent extends Component {
                render() {
                    return <div>Hello World</div>;
                }
            }
        `;
        const result = detectReactComponent(code, 'filename.js');

        expect(result).toBe(true);
    });

    it('should detect if code is a Class component with React namespace', () => {
        const code = `
            class Component extends React.Component {
                render() {
                    return <div>Hello World</div>;
                }
            }
        `;
        const result = detectReactComponent(code, 'filename.js');

        expect(result).toBe(true);
    });

    it('should detect if code is a Class pure component', () => {
        const code = `
            class Component extends PureComponent {
                render() {
                    return <div>Hello World</div>;
                }
            }
        `;
        const result = detectReactComponent(code, 'filename.js');

        expect(result).toBe(true);
    });

    it('should detect if code is a Class pure component with React namespace', () => {
        const code = `
            class Component extends React.PureComponent {
                render() {
                    return <div>Hello World</div>;
                }
            }
        `;
        const result = detectReactComponent(code, 'filename.js');

        expect(result).toBe(true);
    });

    it('should not detect if code is not a React component', () => {
        const code = `
            function NotAComponent() {
                return "Hello World";
            }
        `;
        const result = detectReactComponent(code, 'filename.js');

        expect(result).toBe(false);
    });
});
