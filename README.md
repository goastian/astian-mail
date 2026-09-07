# Astian Mail

This project builds Astian Mail from the Thunderbird/Gecko source base.
`thunderbird` remains the source-product identifier in `amelia.json`; it does
not determine the compiled application name. The compiled executable is
`astian-mail`.

Install the Node.js dependencies once, then use the npm scripts to run Amelia.
The repository's `.npmrc` opts into the Git dependency required by Amelia 2.0;
this is necessary with npm 12, which blocks Git dependencies by default.
It also explicitly approves the `sharp@0.32.6` install script that Amelia uses
internally to process branding assets during `npm run import`; no other
dependency install scripts are approved. This project setting overrides a
user-level `ignore-scripts=true` setting only for the approved dependency.

```sh
npm install
npm run init        # downloads, imports, prepares branding, and bootstraps the engine
npm run build       # builds for the host platform
npm run start       # starts the completed development build
npm run package     # creates distributable output in dist/
```

Target-specific builds and packages are available for `linux-x64`,
`linux-arm64`, `mac-x64`, `mac-arm64`, `win-x64`, and `win-arm64`; for example,
run `npm run build:linux-x64` or `npm run package:win-x64`. Use
`npm run help` to pass through to Amelia's command reference.

Brand assets in `configs/branding/<brand>/` are copied to the Thunderbird
branding directory that is selected during the build. This is necessary because
Thunderbird does not consume Firefox/Midori's `browser/branding` path.

Keep product code and source patches in `src/`, build configuration in
`configs/`, and automation in `scripts/`.
