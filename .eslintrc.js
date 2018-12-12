module.exports = {
	root: true,
	globals: { wx: true, getCurrentPages: false },
	parser: 'babel-eslint',
	parserOptions: {
		sourceType: 'module'
	},
	env: {
		browser: true
	},
	// https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
	extends: 'standard',
	// required to lint *.wpy files
	plugins: [
		'html'
	],
	settings: {
		'html/html-extensions': ['.html', '.wpy']
	},
	// add your custom rules here
	'rules': {
		"indent": ["error", "tab"],
		"no-tabs": 0,
		'indent': 'off',
		// allow paren-less arrow functions
		'arrow-parens': 0,
		// allow async-await
		'generator-star-spacing': 0,
		// allow debugger during development
		'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
		'space-before-function-paren': 0,
		'comma-dangle': 0,
		'eqeqeq': 0,
		'no-useless-return': 0,
		'no-unreachable': 0,
		"no-unused-expressions": "off"
	}
}
