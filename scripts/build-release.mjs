import { existsSync, lstatSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname } from 'node:path';

const archive = 'calendar-alarm.zip';
const files = [
  'manifest.json',
  'alert-core.js',
  'calendar-tabs.js',
  'snooze.js',
  'background.js',
  'content.js',
  'page-bridge.js',
  'popup.js',
  'options.js',
  'interrupt.js',
  'rain.js',
  'popup.html',
  'options.html',
  'interrupt.html',
  'privacy.html',
  'terminal.css',
  'icons/icon-16.png',
  'icons/icon-32.png',
  'icons/icon-48.png',
  'icons/icon-128.png'
];

const manifest = JSON.parse(readFileSync('manifest.json', 'utf8'));
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

if (manifest.manifest_version !== 3) throw new Error('Chrome Web Store releases must use Manifest V3');
if (manifest.version !== pkg.version) throw new Error(`Version mismatch: manifest ${manifest.version}, package ${pkg.version}`);
if (!manifest.description || manifest.description.length > 132) throw new Error('Manifest description must be 1–132 characters');
for (const file of files) {
  if (!existsSync(file)) throw new Error(`Missing release file: ${file}`);
  const stat = lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`Release entries must be regular files: ${file}`);
  for (let parent = dirname(file); parent !== '.'; parent = dirname(parent)) {
    const parentStat = lstatSync(parent);
    if (parentStat.isSymbolicLink() || !parentStat.isDirectory()) throw new Error(`Release parent directories must be real directories: ${parent}`);
  }
}

rmSync(archive, { force: true });
const zip = spawnSync('zip', ['-X', '-q', archive, ...files], { stdio: 'inherit' });
if (zip.status !== 0) throw new Error(`zip failed with status ${zip.status}`);

const integrity = spawnSync('unzip', ['-t', archive], { encoding: 'utf8' });
if (integrity.status !== 0) throw new Error(integrity.stdout || integrity.stderr || 'ZIP integrity check failed');

const listing = spawnSync('unzip', ['-Z1', archive], { encoding: 'utf8' });
if (listing.status !== 0) throw new Error(listing.stderr || 'Could not inspect ZIP entries');
const actual = listing.stdout.trim().split('\n').filter(Boolean).sort();
const expected = [...files].sort();
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`Unexpected ZIP contents:\n${actual.join('\n')}`);
}

console.log(`Built ${archive} for Calendar Alarm ${manifest.version}`);
console.log(`Verified ${actual.length} allowlisted runtime files; no store assets, tests, or source artwork included.`);
