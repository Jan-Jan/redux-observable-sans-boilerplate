'use strict'

module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    extends: 'standard',
    parserOptions: {
        ecmaFeatures: {
          experimentalObjectRestSpread: true
        }
      },
    rules: {
        'brace-style': [1, 'stroustrup', { allowSingleLine: true }],
        'comma-dangle': ['error', 'always-multiline'],
        'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
        'operator-linebreak': ['error', 'before'],
        'standard/no-callback-literal': 0,
    },
    overrides: [
        {
            files: [
                'src/**/*-spec.js'
            ],
            env: {
                jest: true // now **/*.test.js files' env has both es6 *and* jest
            },
            // Can't extend in overrides: https://github.com/eslint/eslint/issues/8813
            // 'extends': ['plugin:jest/recommended']
            plugins: ['jest'],
            rules: {
                'jest/no-disabled-tests': 'warn',
                'jest/no-focused-tests': 'error',
                'jest/no-identical-title': 'error',
                'jest/prefer-to-have-length': 'warn',
                'jest/valid-expect': 'error'
            }
        }
    ],
}
