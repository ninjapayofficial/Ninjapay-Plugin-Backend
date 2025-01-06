// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;



// plugins/terminal-plugin/next-app/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  // If your plugin is served at "/plugins/terminal-plugin",
  // set basePath accordingly:
  basePath: '/plugins/terminal-plugin',

  // Also set the assetPrefix so the static files use the same prefix:
  assetPrefix: '/plugins/terminal-plugin/',
  
  // optional: if you're embedding in a custom server
  // output: 'standalone',
};

export default nextConfig;
  