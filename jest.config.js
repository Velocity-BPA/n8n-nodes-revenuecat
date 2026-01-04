module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/test'],
	testMatch: ['**/*.test.ts'],
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	collectCoverageFrom: [
		'credentials/**/*.ts',
		'nodes/**/*.ts',
		'!**/*.d.ts',
		'!**/node_modules/**',
	],
	coverageDirectory: 'coverage',
	coverageReporters: ['text', 'lcov', 'clover'],
	coverageThreshold: {
		global: {
			branches: 0,
			functions: 30,
			lines: 30,
			statements: 30,
		},
	},
	transform: {
		'^.+\\.ts$': ['ts-jest', {
			tsconfig: {
				module: 'commonjs',
				target: 'ES2021',
				esModuleInterop: true,
				strict: true,
			},
		}],
	},
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1',
	},
	setupFilesAfterEnv: [],
	verbose: true,
};
