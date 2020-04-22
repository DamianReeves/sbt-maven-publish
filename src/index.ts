import { exportVariable, getInput, setFailed } from "@actions/core";
import { mkdirP } from "@actions/io";
import { exec } from "@actions/exec";
import { appendFile, writeFile } from "fs";
import { join as joinPath, resolve as resolvePath } from "path";
import { env } from "process";
import { promisify } from "util";

const appendFileAsync = promisify(appendFile);
const writeFileAsync = promisify(writeFile);
const userHome = env["HOME"] || "/home/runner";

main().catch((error) => setFailed(error.message));

async function main() {
  try {
    const username = getInput("sonatype-username", { required: true });
    const password = getInput("sonatype-password", { required: true });
    const privateKey = getInput("pgp-secret", { required: true });
    const passphrase = getInput("pgp-passphrase", { required: true });
    const publicKey = getInput("pgp-public-key", { required: true });
    const sbtArgs = getInput("sbt-args");
    const passphraseVariable = getInput("pgp-passphrase-variable-name");

    exportPassphrase(passphrase, passphraseVariable);

    const credentialsPath = await writeCredentialsFile(username, password);
    console.log(`Wrote sonatype credentials to ${credentialsPath}`);

    const sonatypeSbtPath = await writeSonatypeDotSbtFile();
    console.log(`Wrote sonatype sbt file to: ${sonatypeSbtPath}`);

    const globalSbtPath = await writeGlobalDotSbtFile();
    console.log(`Wrote global sbt file to: ${globalSbtPath}`);

    const pluginsSbtPath = await writePluginsDotSbtFile();
    console.log(`Wrote plugins sbt file to: ${pluginsSbtPath}`);

    const privateKeyPath = await writePrivateKey(privateKey);
    console.log(`Wrote secret to: ${privateKeyPath}`);

    const publicKeyPath = await writePublicKey(publicKey);
    console.log(`Wrote public key to: ${publicKeyPath}`);

    await execSbt(sbtArgs);
  } catch (error) {
    setFailed(error.message);
  }
}

function exportPassphrase(passphrase: string, variableName: string) {
  if (!variableName) {
    variableName = "PGP_PASSPHRASE";
  }

  console.log(`Making PGP_PASSPHRASE available as: ${variableName}`);
  exportVariable(variableName, passphrase);
}

async function writeCredentialsFile(username: string, password: string) {
  const targetDir = resolvePath(userHome, ".sbt");
  const targetPath = resolvePath(targetDir, "sonatype_credentials");
  await mkdirP(targetDir);
  const fileContents = `realm=Sonatype Nexus Repository Manager
host=oss.sonatype.org
user=${username}
password=${password}
  `;
  await writeFileAsync(targetPath, fileContents, "utf8");
  return targetPath;
}

async function writeSonatypeDotSbtFile() {
  const targetDir = resolvePath(userHome, ".sbt/1.0");
  const targetPath = resolvePath(targetDir, "sonatype.sbt");
  const fileContents = `credentials += Credentials(Path.userHome / ".sbt" / "sonatype_credentials")`;

  await mkdirP(targetDir);
  await appendFileAsync(targetPath, fileContents, "utf8");
  return targetPath;
}

async function writeGlobalDotSbtFile() {
  const targetDir = resolvePath(userHome, ".sbt/1.0");
  const targetPath = resolvePath(targetDir, "global.sbt");
  const fileContents = `credentials += Credentials(Path.userHome / ".sbt" / "sonatype_credentials")`;

  await mkdirP(targetDir);
  await appendFileAsync(targetPath, fileContents, "utf8");
  return targetPath;
}

async function writePluginsDotSbtFile() {
  const targetDir = resolvePath(userHome, ".sbt/1.0/plugins");
  const targetPath = resolvePath(targetDir, "plugins.sbt");
  const fileContents = `addSbtPlugin("org.xerial.sbt" % "sbt-sonatype" % "3.9.2")`;

  await mkdirP(targetDir);
  await appendFileAsync(targetPath, fileContents, "utf8");
  return targetPath;
}

async function writePrivateKey(contents: string) {
  const targetDir = resolvePath(userHome, "tmp");
  const targetPath = resolvePath(targetDir, "secret.asc");
  await writeFileAsync(targetPath, contents, "utf8");
  return targetPath;
}

async function writePublicKey(contents: string) {
  const targetDir = resolvePath(userHome, "tmp");
  const targetPath = resolvePath(targetDir, "public.asc");
  await writeFileAsync(targetPath, contents, "utf8");
  return targetPath;
}

async function execSbt(args: string) {
  if (!args) {
    args = "+ publishSigned; sonatypeBundleRelease";
  }
  await exec("sbt", [args]);
}
