module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./dist/popup.html",
        "./src/**/*.html",
    ],
    theme: {
        extend: {},
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    },
    important: "#summary-modal-root",
};
