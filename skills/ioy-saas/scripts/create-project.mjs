import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const usage = `Usage: node create-project.mjs --template <authorized-template> --config <requirements.json> --out <empty-directory>
       node create-project.mjs --template <authorized-template> --check
SAAS_TEMPLATE may supply the template path. Secrets must not appear in requirements.`;

export function assertSafeRequirements(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Requirements must be a JSON object.');
  function visit(item) {
    if (typeof item === 'string' && (/-----BEGIN .*PRIVATE KEY-----/.test(item) || /\b(?:sk_(?:live|test)_|ghp_|github_pat_)[A-Za-z0-9_]{16,}/.test(item))) {
      throw new Error('Credential-like value found. Keep credentials in environment variables or Secrets.');
    }
    if (!item || typeof item !== 'object') return;
    for (const [key, child] of Object.entries(item)) {
      if (/(?:secret|password|private[_-]?key|access[_-]?token|api[_-]?key)/i.test(key)) throw new Error('Credential field found. Keep credentials outside requirements.');
      visit(child);
    }
  }
  visit(value);
}

function physicalPath(target) {
  let ancestor = target;
  const tail = [];
  while (!fs.existsSync(ancestor)) {
    tail.unshift(path.basename(ancestor));
    const parent = path.dirname(ancestor);
    if (parent === ancestor) throw new Error('Cannot resolve output directory.');
    ancestor = parent;
  }
  return path.join(fs.realpathSync(ancestor), ...tail);
}

export function main(args = process.argv.slice(2)) {
  const options = {};
  for (let i = 0; i < args.length; i++) {
    const option = args[i];
    if (option === '--help') { console.log(usage); return; }
    if (option === '--check') { options.check = true; continue; }
    if (!['--template', '--config', '--out'].includes(option) || options[option] !== undefined || !args[i + 1] || args[i + 1].startsWith('--')) throw new Error(usage);
    options[option] = args[++i];
  }
  const template = path.resolve(options['--template'] || process.env.SAAS_TEMPLATE || process.cwd());
  const generator = path.join(template, 'scripts/create-saas.mjs');
  for (const file of [generator, path.join(template, 'README.md'), path.join(template, 'docs/launch.md')]) {
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) throw new Error('Local ioy template missing. Supply an authorized copy with --template or SAAS_TEMPLATE. This public Skill does not grant private repository access.');
  }
  if (options.check) {
    if (options['--config'] || options['--out']) throw new Error('--check cannot be combined with --config or --out.');
    console.log('Local template files available. No project generated; license entitlement is not checked.');
    return;
  }
  if (!options['--config'] || !options['--out']) throw new Error(usage);
  const config = path.resolve(options['--config']);
  assertSafeRequirements(JSON.parse(fs.readFileSync(config, 'utf8')));
  const output = path.resolve(options['--out']);
  const resolvedOutput = physicalPath(output);
  const relative = path.relative(fs.realpathSync(template), resolvedOutput);
  if (!relative || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))) throw new Error('Output must be outside the template.');
  if (fs.existsSync(output) && (!fs.statSync(output).isDirectory() || fs.readdirSync(output).length)) throw new Error('Output must be an empty directory. Existing files are preserved.');
  const result = spawnSync(process.execPath, [generator, '--config', config, '--out', output], { cwd: template, stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Template generator failed (${result.signal || result.status}). Inspect its output before retrying.`);
  console.log('Project generated. Follow its README for local setup and independent provider configuration.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
