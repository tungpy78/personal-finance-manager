export default {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1', // 🔥 quan trọng
  },
  transform: {
    '^.+\\\.ts$': ['ts-jest', {
      useESM: true,
      // 🔥 quan trọng: Tắt type stripping để Jest hiểu type trong TS
      diagnostics: { ignoreCodes: [1344, 18002] },
      isolatedModules: true,
    }],
  },
};