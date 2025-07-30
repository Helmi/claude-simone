import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  prettier,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        // TypeScript types
        HandlebarsTemplateDelegate: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs['recommended'].rules,
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
        },
      ],
      // Allow any in specific cases (YAML parsing, external libraries)
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-assignment': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'warn',
      '@typescript-eslint/no-unsafe-call': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      // Allow template expressions with unknown
      '@typescript-eslint/restrict-template-expressions': 'off',
      // Allow promises in specific cases (logging)
      '@typescript-eslint/no-floating-promises': ['error', { ignoreVoid: true }],
      // Relax function return type requirement
      '@typescript-eslint/explicit-function-return-type': 'off',
      // Allow redundant type constituents for better IDE support
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      // Allow empty interfaces (useful for future extension)
      '@typescript-eslint/no-empty-object-type': 'off',
      // Allow async functions without await in specific cases
      '@typescript-eslint/require-await': 'warn',
    },
  },
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },
];