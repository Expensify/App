# JavaScript Coding Standards

For almost all of our code style rules, refer to the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

When writing ES6 or React code, please also refer to the [Airbnb React/JSX Style Guide](https://github.com/airbnb/javascript/tree/master/react).

There are a few things that we have customized for our tastes which will take precedence over Airbnb's guide.

## Functions
  - Always wrap the function expression for immediately-invoked function expressions (IIFE) in parens:

    ```javascript
    // Bad
    (function () {
        console.log('Welcome to the Internet. Please follow me.');
    }());

    // Good
    (function () {
        console.log('Welcome to the Internet. Please follow me.');
    })();
    ```

## Whitespace
  - Use soft tabs set to 4 spaces.

    ```javascript
    // Bad
    function () {
    ∙∙const name;
    }

    // Bad
    function () {
    ∙const name;
    }

    // Good
    function () {
    ∙∙∙∙const name;
    }
    ```

  - Place 1 space before the function keyword and the opening parent for anonymous functions. This does not count for named functions.

    ```javascript
    // Bad
    function() {
        ...
    }

    // Bad
    function getValue (element) {
        ...
    }

    // Good
    function∙() {
        ...
    }

    // Good
    function getValue(element) {
        ...
    }
    ```

  - Do not add spaces inside curly braces.

    ```javascript
    // Bad
    const foo = { clark: 'kent' };

    // Good
    const foo = {clark: 'kent'};
    ```
  - Aligning tokens should be avoided as it rarely aids in readability and often
  produces inconsistencies and larger diffs when updating the code.

    ```javascript
    // Good
    const foo = {
        foo: 'bar',
        foobar: 'foobar',
        foobarbaz: 'foobarbaz',
    };

    // Bad
    const foo = {
        foo      : 'bar',
        foobar   : 'foobar',
        foobarbaz: 'foobarbaz',
    };
    ```

## Naming Conventions

### Event Handlers
  - When you have an event handler, do not prefix it with "on" or "handle". The method should be named for what it does, not what it handles. This promotes code reuse by minimizing assumptions that a method must be called in a certain fashion (eg. only as an event handler).
  - One exception for allowing the prefix of "on" is when it is used for callback `props` of a React component. Using it in this way helps to distinguish callbacks from public component methods.

    ```javascript
    // Bad
    const onSubmitClick = () => {
        // Validate form items and submit form
    };

    // Good
    const validateAndSubmit = () => {
        // Validate form items and submit form
    };
    ```

### Boolean variables and props

- Boolean props or variables must be prefixed with `should` or `is` to make it clear that they are `Boolean`. Use `should` when we are enabling or disabling some features and `is` in most other cases.

```javascript
// Bad
<SomeComponent showIcon />

// Good
<SomeComponent shouldShowIcon />

// Bad
const valid = props.something && props.somethingElse;

// Good
const isValid = props.something && props.somethingElse;
```

## Functions

Any function declared in a library module should use the `function myFunction` keyword rather than `const myFunction`.

```javascript
// Bad
const myFunction = () => {...};

export {
    myFunction,
}

// Good
function myFunction() {
    ...
}

export {
    myFunction,
}
```

Using arrow functions is the preferred way to write an anonymous function such as a callback method.

```javascript
// Bad
_.map(someArray, function (item) {...});

// Good
_.map(someArray, (item) => {...});
```

Empty functions (noop) should be declare as arrow functions with no whitespace inside. Avoid _.noop()

```javascript
// Bad
const callback = _.noop;
const callback = () => { };

// Good
const callback = () => {};
```

## `var`, `const` and `let`

- Never use `var`
- Use `const` when you are not reassigning a variable
- Try to write your code in a way where the variable reassignment isn't necessary
- Use `let` only if there are no other options

```javascript
// Bad
let array = [];

if (someCondition) {
    array = ['addValue1'];
}

// Good
const array = [];

if (someCondition) {
    array.push('addValue1');
}
```

## Object / Array Methods

We have standardized on using [underscore.js](https://underscorejs.org/) methods for objects and collections instead of the native [Array instance methods](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#instance_methods). This is mostly to maintain consistency, but there are some type safety features and conveniences that underscore methods provide us e.g. the ability to iterate over an object and the lack of a `TypeError` thrown if a variable is `undefined`.

```javascript
// Bad
myArray.forEach(item => doSomething(item));
// Good
_.each(myArray, item => doSomething(item));

// Bad
const myArray = Object.keys(someObject).map(key => doSomething(someObject[key]));
// Good
const myArray = _.map(someObject, (value, key) => doSomething(value));

// Bad
myCollection.includes('item');
// Good
_.contains(myCollection, 'item');

// Bad
const modifiedArray = someArray.filter(filterFunc).map(mapFunc);
// Good
const modifiedArray = _.chain(someArray)
    .filter(filterFunc)
    .map(mapFunc)
    .value();
```

## Accessing Object Properties and Default Values

Use `lodashGet()` to safely access object properties and `||` to short circuit null or undefined values that are not guaranteed to exist in a consistent way throughout the codebase. In the rare case that you want to consider a falsy value as usable and the `||` operator prevents this then be explicit about this in your code and check for the type using an underscore method e.g. `_.isBoolean(value)` or `_.isEqual(0)`.

```javascript
// Bad
const value = somePossiblyNullThing ?? 'default';
// Good
const value = somePossiblyNullThing || 'default';
// Bad
const value = someObject.possiblyUndefinedProperty?.nestedProperty || 'default';
// Bad
const value = (someObject && someObject.possiblyUndefinedProperty && someObject.possiblyUndefinedProperty.nestedProperty) || 'default';
// Good
const value = lodashGet(someObject, 'possiblyUndefinedProperty.nestedProperty', 'default');
```

## JSDocs

- Always document parameters and return values.
- Optional parameters should be enclosed by `[]` e.g. `@param {String} [optionalText]`.
- Document object parameters with separate lines e.g. `@param {Object} parameters` followed by `@param {String} parameters.field`.
- If a parameter accepts more than one type use `*` to denote there is no single type.
- Use uppercase when referring to JS primitive values (e.g. `Boolean` not `bool`, `Number` not `int`, etc).
- When specifying a return value use `@returns` instead of `@return`. If there is no return value do not include one in the doc.

- Avoid descriptions that don't add any additional information. Method descriptions should only be added when it's behavior is unclear.
- Do not use block tags other than `@param` and `@returns` (e.g. `@memberof`, `@constructor`, etc).
- Do not document default parameters. They are already documented by adding them to a declared function's arguments.
- Do not use record types e.g. `{Object.<string, number>}`.
- Do not create `@typedef` to use in JSDocs.
- Do not use type unions e.g. `{(number|boolean)}`.

```javascript
// Bad
/**
 * Populates the shortcut modal
 * @param {bool} shouldShowAdvancedShortcuts whether to show advanced shortcuts
 * @return {*}
 */
function populateShortcutModal(shouldShowAdvancedShortcuts) {
}

// Good
/**
 * @param {Boolean} shouldShowAdvancedShortcuts
 * @returns {Boolean}
 */
function populateShortcutModal(shouldShowAdvancedShortcuts) {
}
```

## Destructuring
JavaScript destructuring is convenient and fun, but we should avoid using it in situations where it reduces code clarity. Here are some general guidelines on destructuring.

**General Guidelines**

- Avoid object destructuring for a single variable that you only use *once*. It's clearer to use dot notation for accessing a single variable.

```javascript
// Bad
const {data} = event.data;

// Good
const {name, accountID, email} = data;
```

**React Components**

Don't destructure props or state. It makes the source of a given variable unclear. This guideline helps us quickly know which variables are from props, state, or from some other scope.

```javascript
// Bad
const {userData} = props;
const {firstName, lastName} = state;
...

// Bad
const UserInfo = ({name, email}) => (
	<View>
		<Text>Name: {name}</Text>
		<Text>Email: {email}</Text>
	</View>
);

// Good
const UserInfo = props => (
    <View>
        <Text>Name: {props.name}</Text>
        <Text>Email: {props.email}</Text>
    </View>
);
```

## Named vs Default Exports in ES6 - When to use what?

ES6 provides two ways to export a module from a file: `named export` and `default export`. Which variation to use depends on how the module will be used.

- If a file exports a single JS object (e.g. a React component, or an IIFE), then use `export default`
- Files with multiple exports should always use named exports
- Files with a single method or variable export are OK to use named exports
- Mixing default and named exports in a single file is OK (e.g. in a self contained module), but should rarely be used
- All exports (both default and named) should happen at the bottom of the file
- Do **not** export individual features inline.

```javascript
// Bad
export const something = 'nope';
export const somethingElse = 'stop';

// Good
const something = 'yep';
const somethingElse = 'go';

export {
    something,
    somethingElse,
};
```

## Classes and constructors

#### Class syntax
Using the `class` syntax is preferred wherever appropriate. Airbnb has clear [guidelines](https://github.com/airbnb/javascript#classes--constructors) in their JS style guide which promotes using the _class_ syntax. Don't manipulate the `prototype` directly. The `class` syntax is generally considered more concise and easier to understand.

#### Constructor
Classes have a default constructor if one is not specified. No need to write a constructor function that is empty or just delegates to a parent class.

```js
// Bad
class Jedi {
    constructor() {}

    getName() {
        return this.name;
    }
}

// Bad
class Rey extends Jedi {
    constructor(...args) {
        super(...args);
    }
}

// Good
class Rey extends Jedi {
    constructor(...args) {
        super(...args);
        this.name = 'Rey';
    }
}
```

## ESNext: Are we allowed to use [insert new language feature]? Why or why not?

JavaScript is always changing. We are excited whenever it does! However, we tend to take our time considering whether to adopt the latest and greatest language features. The main reason for this is **consistency**. We have a style guide so that we don't have to have endless conversations about how our code looks and can focus on how it runs.

So, if a new language feature isn't something we have agreed to support it's off the table. Sticking to just one way to do things reduces cognitive load in reviews and also makes sure our knowledge of language features progresses at the same pace. If a new language feature will cause considerable effort for everyone to adapt to or we're just not quite sold on the value of it yet we won't support it.

Here are a couple of things we would ask that you *avoid* to help maintain consistency in our codebase:

- **Async/Await** - Use the native `Promise` instead
- **Optional Chaining** - Use `lodashGet()` to fetch a nested value instead
- **Null Coalescing Operator** - Use `lodashGet()` or `||` to set a default value for a possibly `undefined` or `null` variable

# React Coding Standards

# React specific styles

## Method Naming and Code Documentation
* Prop callbacks should be named for what has happened, not for what is going to happen. Components should never assume anything about how they will be used (that's the job of whatever is implementing it).

```javascript
// Bad
const propTypes = {
    /** A callback to call when we want to save the form */
    onSaveForm: PropTypes.func.isRequired,
};

// Good
const propTypes = {
    /** A callback to call when the form has been submitted */
    onFormSubmitted: PropTypes.func.isRequired,
};
```

* Do not use underscores when naming private methods.
* Add descriptions to all `propTypes` using a block comment above the definition. No need to document the types (that's what `propTypes` is doing already), but add some context for each property so that other developers understand the intended use.

```javascript
// Bad
const propTypes = {
    currency: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    isIgnored: PropTypes.bool.isRequired
};

// Bad
const propTypes = {
    // The currency that the reward is in
    currency: React.PropTypes.string.isRequired,

    // The amount of reward
    amount: React.PropTypes.number.isRequired,

    // If the reward has been ignored or not
    isIgnored: React.PropTypes.bool.isRequired
}

// Good
const propTypes = {
    /** The currency that the reward is in */
    currency: React.PropTypes.string.isRequired,

    /** The amount of the reward */
    amount: React.PropTypes.number.isRequired,

    /** If the reward has not been ignored yet */
    isIgnored: React.PropTypes.bool.isRequired
}
```

All `propTypes` and `defaultProps` *must* be defined at the **top** of the file in variables called `propTypes` and `defaultProps`.
These variables should then be assigned to the component at the bottom of the file.

```js
MyComponent.propTypes = propTypes;
MyComponent.defaultProps = defaultProps;
export default MyComponent;
```

Any nested `propTypes` e.g. that may appear in a `PropTypes.shape({})` should also be documented.

```javascript
// Bad
const propTypes = {
    /** Session data */
    session: PropTypes.shape({
        authToken: PropTypes.string,
        login: PropTypes.string,
    }),
}

// Good
const propTypes = {
    /** Session data */
    session: PropTypes.shape({

        /** Token used to authenticate the user */
        authToken: PropTypes.string,

        /** User email or phone number */
        login: PropTypes.string,
    }),
}
```

## Inline Ternaries
* Use inline ternary statements when rendering optional pieces of templates. Notice the white space and formatting of the ternary.

```javascript
// Bad
{
    const optionalTitle = props.title ? <div className="title">{props.title}</div> : null;
    return (
        <div>
            {optionalTitle}
            <div className="body">This is the body</div>
        </div>
    );
}
```

```javascript
// Good
{
    return (
        <div>
            {props.title
                ? <div className="title">{props.title}</div>
                : null}
            <div className="body">This is the body</div>
        </div>
    );
}
```

```javascript
// Good
{
    return (
        <div>
            {props.title
                ? <div className="title">{props.title}</div>
                : <div className="title">Default Title</div>
            }
            <div className="body">This is the body</body>
        </div>
    );
}
```

### Important Note:

In React Native, one **must not** attempt to falsey-check a string for an inline ternary. Even if it's in curly braces, React Native will try to render it as a `<Text>` node and most likely throw an error about trying to render text outside of a `<Text>` component. Use `_.isEmpty()` instead.

```javascript
// Bad! This will cause a breaking an error on native platforms
{
    return (
        <View>
            {props.title
                ? <View style={styles.title}>{props.title}</View>
                : null}
            <View style={styles.body}>This is the body</View>
        </View>
    );
}

// Good
{
    return (
        <View>
            {!_.isEmpty(props.title)
                ? <View style={styles.title}>{props.title}</View>
                : null}
            <View style={styles.body}>This is the body</View>
        </View>
    );
}
```

## Function component style

When writing a function component you must ALWAYS add a `displayName` property and give it the same value as the name of the component (this is so it appears properly in the React dev tools)

```javascript

    const Avatar = (props) => {...};

    Avatar.propTypes = propTypes;
    Avatar.defaultProps = defaultProps;
    Avatar.displayName = 'Avatar';

    export default Avatar;
```

## Stateless components vs Pure Components vs Class based components vs Render Props - When to use what?

Class components are DEPRECATED. Use function components and React hooks.

[https://react.dev/reference/react/Component#migrating-a-component-with-lifecycle-methods-from-a-class-to-a-function](https://react.dev/reference/react/Component#migrating-a-component-with-lifecycle-methods-from-a-class-to-a-function)

## Composition vs Inheritance

From React's documentation -
>Props and composition give you all the flexibility you need to customize a component’s look and behavior in an explicit and safe way. Remember that components may accept arbitrary props, including primitive values, React elements, or functions.
>If you want to reuse non-UI functionality between components, we suggest extracting it into a separate JavaScript module. The components may import it and use that function, object, or a class, without extending it.

Use an HOC a.k.a. *[Higher order component](https://reactjs.org/docs/higher-order-components.html)* if you find a use case where you need inheritance.

If several HOC need to be combined there is a `compose()` utility. But we should not use this utility when there is only one HOC.

```javascript
// Bad
export default compose(
    withLocalize,
)(MyComponent);

// Good
export default compose(
    withLocalize,
    withWindowDimensions,
)(MyComponent);

// Good
export default withLocalize(MyComponent)
```

**Note:** If you find that none of these approaches work for you, please ask an Expensify engineer for guidance via Slack or GitHub.

## Use Refs Appropriately

React's documentation explains refs in [detail](https://reactjs.org/docs/refs-and-the-dom.html). It's important to understand when to use them and how to use them to avoid bugs and hard to maintain code.

A common mistake with refs is using them to pass data back to a parent component higher up the chain. In most cases, you can try [lifting state up](https://reactjs.org/docs/lifting-state-up.html) to solve this.

There are several ways to use and declare refs and we prefer the [callback method](https://reactjs.org/docs/refs-and-the-dom.html#callback-refs).

## Are we allowed to use [insert brand new React feature]? Why or why not?

We love React and learning about all the new features that are regularly being added to the API. However, we try to keep our organization's usage of React limited to the most stable set of features that React offers. We do this mainly for **consistency** and so our engineers don't have to spend extra time trying to figure out how everything is working. That said, if you aren't sure if we have adopted something please ask us first.

# Onyx Best Practices

[Onyx Documentation](https://github.com/expensify/react-native-onyx)

## Collection Keys

Our potentially larger collections of data (reports, policies, etc) are typically stored under collection keys. Collection keys let us group together individual keys vs. storing arrays with multiple objects. In general, **do not add a new collection key if it can be avoided**. There is most likely a more logical place to put the state. And failing to associate a state property with it's logical owner is something we consider to be an anti-pattern (unnecessary data structure adds complexity for no value).

For example, if you are storing a boolean value that could be associated with a `report` object under a new collection key it is better to associate this information with the report itself and not create a new collection key.

**Exception:** There are some [gotchas](https://github.com/expensify/react-native-onyx#merging-data) when working with complex nested array values in Onyx. So, this could be another valid reason to break a property off of it's parent object (e.g. `reportActions` are easier to work with as a separate collection).

If you're not sure whether something should have a collection key reach out in [`#expensify-open-source`](https://expensify.slack.com/archives/C01GTK53T8Q) for additional feedback.
