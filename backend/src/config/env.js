const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const getRequiredEnv = (name) => {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
};

module.exports = {
    PORT: process.env.PORT || 3000,
    JWT_SECRET: getRequiredEnv('JWT_SECRET')
};
