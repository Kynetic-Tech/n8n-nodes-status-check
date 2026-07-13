module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint', 'n8n-nodes-base'],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:n8n-nodes-base/nodes',
	],
	rules: {
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-unused-vars': 'error',
		'n8n-nodes-base/node-param-display-name-miscased': 'error',
		'n8n-nodes-base/node-param-default-missing': 'error',
		'n8n-nodes-base/node-param-description-miscased': 'error',
		'n8n-nodes-base/node-param-description-missing-final-period': 'error',
		'n8n-nodes-base/node-class-description-credentials-name-unsuffixed': 'error',
	},
	ignorePatterns: ['dist/', 'node_modules/', '*.js'],
};
