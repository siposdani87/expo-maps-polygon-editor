module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    transform: {
        '^.+\\.tsx?$': [
            'ts-jest',
            {
                tsconfig: {
                    jsx: 'react-jsx',
                    noUnusedLocals: false,
                    noUnusedParameters: false,
                },
            },
        ],
    },
};
