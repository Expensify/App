import '../assets/styles/font-style.css';
import {addons} from '@storybook/addons';
import ExpensifyTheme from './ExpensifyTheme';

addons.setConfig({
    theme: ExpensifyTheme,
});
