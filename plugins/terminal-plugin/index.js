/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
// plugins/terminal-plugin/index.js
const path = require("path");
const express = require("express");
const next = require("next");

module.exports = {
  init: async function (router, sequelize) {
    console.log("Initializing Terminal Plugin (Next.js)");

    // 1) Create a Next.js instance for dev or prod
    const dev = process.env.NODE_ENV !== "production";
    const nextApp = next({
      dev,
      // point Next.js to the "next-app" folder
      dir: path.join(__dirname, "next-app"),
      // Optionally pass the conf directly:
      // conf: {
      //   basePath: '/plugins/terminal-plugin',
      //   assetPrefix: '/plugins/terminal-plugin',
      // },
    });


    // 2) Prepare the Next.js app
    await nextApp.prepare();

    // 3) Create a custom request handler
    const handle = nextApp.getRequestHandler();

    // 4) Example: Serve any custom API routes you need in Express (optional)
    // router.use("/api", someApiRoutes);

    // 5) Catch-all to let Next.js handle every request
    //    so Next can render pages, static files, etc.
    router.get("*", (req, res) => {
      return handle(req, res);
    });
  },
};
