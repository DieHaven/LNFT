module.exports = {
  reactStrictMode: true,
  basePath: "192.168.43.131:3000",
  serverRuntimeConfig: {
    domain: "lnft-project.uk",
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback.fs = false;
    }
    return config;
  }
};
