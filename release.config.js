module.exports = {
    branches: ["main"],
    plugins: [
      [
        "@semantic-release/commit-analyzer",
        {
          preset: "conventionalcommits",
        },
      ],
      "@semantic-release/release-notes-generator",
      "@semantic-release/changelog",
      [
        "@semantic-release/npm",
        {
          npmPublish: false,
        },
      ],
      "@semantic-release/git",
      [
        "@semantic-release/exec",
        {
          prepareCmd:
            "zip -qq -r logseq-dynamic-lookup-${nextRelease.version}.zip dist README.md LICENSE package.json *.png",
        },
      ],
      [
        "@semantic-release/github",
        {
          assets: "logseq-dynamic-lookup-*.zip",
        },
      ],
    ],
  };
