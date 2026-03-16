import nextConfig from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...nextConfig,
  ...nextTs,
  {
    ignores: ['.next/**', 'node_modules/**']
  }
];

export default config;
