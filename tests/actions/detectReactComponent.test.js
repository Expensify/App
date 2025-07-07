"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var newComponentCategory_1 = require("../../.github/actions/javascript/authorChecklist/categories/newComponentCategory");
describe('detectReactComponent test', function () {
    it('should return undefined if no code is provided', function () {
        var result = (0, newComponentCategory_1.detectReactComponent)('', 'filename.js');
        expect(result).toBeUndefined();
    });
    it('should detect if code is React component', function () {
        var code = "\n            function Component() {\n                return <div>Hello World</div>;\n            }\n        ";
        var result = (0, newComponentCategory_1.detectReactComponent)(code, 'filename.js');
        expect(result).toBe(true);
    });
    it('should detect if code is a Arrow function component', function () {
        var code = "\n            const Component = () => {\n                return <div>Hello World</div>;\n            }\n        ";
        var result = (0, newComponentCategory_1.detectReactComponent)(code, 'filename.js');
        expect(result).toBe(true);
    });
    it('should detect if code is in typescript', function () {
        var code = "\n            const Component = ({text}: {text: string}) => {\n                return <div>{text}</div>;\n            }\n        ";
        var result = (0, newComponentCategory_1.detectReactComponent)(code, 'filename.js');
        expect(result).toBe(true);
    });
    it('should detect if code is a Class component', function () {
        var code = "\n            class SomeComponent extends Component {\n                render() {\n                    return <div>Hello World</div>;\n                }\n            }\n        ";
        var result = (0, newComponentCategory_1.detectReactComponent)(code, 'filename.js');
        expect(result).toBe(true);
    });
    it('should detect if code is a Class component with React namespace', function () {
        var code = "\n            class Component extends React.Component {\n                render() {\n                    return <div>Hello World</div>;\n                }\n            }\n        ";
        var result = (0, newComponentCategory_1.detectReactComponent)(code, 'filename.js');
        expect(result).toBe(true);
    });
    it('should detect if code is a Class pure component', function () {
        var code = "\n            class Component extends PureComponent {\n                render() {\n                    return <div>Hello World</div>;\n                }\n            }\n        ";
        var result = (0, newComponentCategory_1.detectReactComponent)(code, 'filename.js');
        expect(result).toBe(true);
    });
    it('should detect if code is a Class pure component with React namespace', function () {
        var code = "\n            class Component extends React.PureComponent {\n                render() {\n                    return <div>Hello World</div>;\n                }\n            }\n        ";
        var result = (0, newComponentCategory_1.detectReactComponent)(code, 'filename.js');
        expect(result).toBe(true);
    });
    it('should not detect if code is not a React component', function () {
        var code = "\n            function NotAComponent() {\n                return \"Hello World\";\n            }\n        ";
        var result = (0, newComponentCategory_1.detectReactComponent)(code, 'filename.js');
        expect(result).toBe(false);
    });
});
