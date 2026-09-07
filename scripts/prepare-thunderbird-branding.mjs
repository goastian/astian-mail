import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import asyncIcns from "async-icns";

const root = resolve(import.meta.dirname, "..");
const engine = join(root, "engine");
const config = JSON.parse(readFileSync(join(root, "amelia.json"), "utf8"));
const sourceRoot = join(engine, "comm", "mail", "branding", "nightly");
const destinationRoot = join(engine, "comm", "mail", "branding");
const brandingRoot = join(root, "configs", "branding");

if (config.version?.product !== "thunderbird") {
  throw new Error("Thunderbird branding preparation requires a Thunderbird source project.");
}

if (!existsSync(sourceRoot)) {
  throw new Error("Thunderbird source is missing. Run npm run download before preparing branding.");
}

const copy = (source, destination) => {
  if (!existsSync(source)) {
    return;
  }
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });
};

const brandNames = Object.keys(config.brands ?? {});

for (const brandName of brandNames) {
  const source = join(brandingRoot, brandName);
  const destination = join(destinationRoot, brandName);

  if (!existsSync(source)) {
    throw new Error(`Missing branding assets for '${brandName}'.`);
  }

  rmSync(destination, { recursive: true, force: true });
  cpSync(sourceRoot, destination, { recursive: true });
  cpSync(source, destination, { recursive: true, force: true });

  for (const size of [16, 22, 24, 32, 48, 64, 128, 256]) {
    copy(join(source, `logo${size}.png`), join(destination, `default${size}.png`));
  }

  copy(join(source, "content", "about-logo.png"), join(destination, "content", "about.png"));

  const ico = existsSync(join(source, "installer.ico"))
    ? join(source, "installer.ico")
    : join(source, "firefox.ico");
  for (const name of ["addressbook.ico", "messengerWindow.ico", "newmail.ico", "writeMessage.ico"]) {
    copy(ico, join(destination, name));
  }

  const displayName = config.brands[brandName]?.brandFullName ?? config.name;
  writeFileSync(
    join(destination, "configure.sh"),
    `MOZ_APP_DISPLAYNAME=${JSON.stringify(displayName)}\n`,
  );

  const macIcon = join(source, "logo-mac.png");
  if (process.platform === "darwin" && existsSync(macIcon)) {
    await asyncIcns.convert({
      input: macIcon,
      output: join(destination, "thunderbird.icns"),
      sizes: [16, 32, 64, 128, 256, 512],
      tmpDirectory: join(root, ".amelia", "tmp", `${brandName}.iconset`),
    });
  }
}

console.log(`Prepared Thunderbird branding: ${brandNames.join(", ")}`);
