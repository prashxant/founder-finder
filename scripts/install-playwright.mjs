import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  // Keep browser binaries in the project so deployments can resolve them at runtime.
  PLAYWRIGHT_BROWSERS_PATH: "0",
};

function runPlaywrightInstall(withDeps) {
  const args = ["playwright", "install", "chromium"];
  if (withDeps) {
    args.push("--with-deps");
  }

  const result = spawnSync("npx", args, {
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });

  return result.status === 0;
}

function hasAptGet() {
  if (process.platform !== "linux") {
    return false;
  }

  const result = spawnSync(
    "sh",
    ["-lc", "command -v apt-get >/dev/null 2>&1"],
    {
      stdio: "ignore",
    },
  );

  return result.status === 0;
}

const aptGetAvailable = hasAptGet();

if (aptGetAvailable) {
  console.log(
    "[postinstall] apt-get detected. Installing Chromium with --with-deps.",
  );

  if (runPlaywrightInstall(true)) {
    process.exit(0);
  }

  console.warn(
    "[postinstall] Chromium install with --with-deps failed. Retrying without --with-deps.",
  );
} else {
  console.log(
    "[postinstall] apt-get not available. Installing Chromium without --with-deps.",
  );
}

if (!runPlaywrightInstall(false)) {
  console.error("[postinstall] Failed to install Playwright Chromium.");
  process.exit(1);
}
