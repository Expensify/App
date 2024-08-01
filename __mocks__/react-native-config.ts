import dotenv from 'dotenv';
import path from 'path';

type ReactNativeConfigMock = dotenv.DotenvParseOutput | undefined;

const reactNativeConfigMock: ReactNativeConfigMock = dotenv.config({path: path.resolve('./.env.example')}).parsed;

export default reactNativeConfigMock;
