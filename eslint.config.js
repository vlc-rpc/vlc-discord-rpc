import babelParser from '@babel/eslint-parser';
import jsdoc from 'eslint-plugin-jsdoc';
import stylisticJs from '@stylistic/eslint-plugin-js';

export default [
  {
    languageOptions: {
      parser: babelParser,
      sourceType: 'module'
    },
    plugins: {
      jsdoc: jsdoc,
      '@stylistic/js': stylisticJs
    },
    rules: {
      'no-undefined': 'error',
      'no-inline-comments': 'error',
      semi: ['error', 'always'],
      'max-len': [
        'error',
        {
          code: 150,
          tabWidth: 4,
          ignoreComments: false,
          ignoreTrailingComments: false,
          ignoreUrls: true,
          ignoreStrings: false,
          ignoreTemplateLiterals: false,
          ignoreRegExpLiterals: true
        }
      ],
      eqeqeq: ['error', 'always'],
      curly: 'error',
      'no-unused-expressions': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-implied-eval': 'error',
      'array-callback-return': 'error',
      complexity: ['error', { max: 22 }],
      'no-constant-binary-expression': 'error',
      'no-duplicate-imports': 'error',
      'no-self-compare': 'error',
      'no-template-curly-in-string': 'error',
      'no-unreachable-loop': 'error',
      'no-use-before-define': 'error',
      'arrow-body-style': ['error', 'always'],
      'default-case': 'error',
      'init-declarations': 'error',
      'no-shadow': 'error',
      'no-useless-return': 'error',
      'no-useless-rename': 'error',
      'operator-assignment': 'error',
      'prefer-destructuring': 'error',
      'sort-imports': ['error', {
        'ignoreCase': true,
        'ignoreDeclarationSort': false,
        'ignoreMemberSort': false,
        'memberSyntaxSortOrder': ['none', 'all', 'multiple', 'single'],
        'allowSeparatedGroups': false
      }],    
      '@stylistic/js/indent': ['error', 2],
      '@stylistic/js/comma-dangle': 'error',
      '@stylistic/js/array-bracket-spacing': 'error',
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }],
      'quotes': ['error', 'single'],
      'space-before-blocks': ['error', 'always'],
      'object-curly-spacing': ['error', 'always'],
      'keyword-spacing': ['error', { 'before': true, 'after': true }],
      'prefer-template': 'error'
    }
  }
];