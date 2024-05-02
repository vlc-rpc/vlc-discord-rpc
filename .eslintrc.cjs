module.exports = {
  env: {
    es2021: true,
    node: true
  },
  extends: ['eslint:recommended', "plugin:jsdoc/recommended-error"],
  parser: '@babel/eslint-parser',
  plugins: [
    '@stylistic/js',
    'jsdoc'
  ],
  overrides: [
    {
      env: {
        node: true
      },
      files: ['.eslintrc.{js,cjs}'],
      parserOptions: {
        sourceType: 'script'
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    requireConfigFile: false
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
    complexity: ['error', { max: 21 }],
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
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 1, maxBOF: 0 }]
  }
};