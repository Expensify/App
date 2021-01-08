const path = require('path');
const dotenv = require('dotenv');

const env = dotenv.config({path: path.resolve('./.env.example')}).parsed;

export default env;
