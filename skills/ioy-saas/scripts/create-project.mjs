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
  const manifestPath=path.join(template,'release-manifest.json');
  if(!fs.existsSync(manifestPath)) throw Error('Template capability manifest missing. Download template 1.3.0 or newer from ioy.ai.');
  const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
  const version=(v)=>v.split('.').map(Number);
  const [major,minor]=version(manifest.version||'0.0.0');
  if(major<1 || major===1&&minor<3 || !manifest.capabilities) throw Error('This Skill requires template 1.3.0 or newer.');
  const minimum=version(manifest.minimumNode||'24.0.0'),current=version(process.versions.node);
  if(current[0]<minimum[0] || current[0]===minimum[0]&&current[1]<minimum[1]) throw Error('Use Node '+manifest.minimumNode+' or newer for this template.');
  const schemaPath=path.join(template,manifest.capabilities.requirementsSchema||'schemas/requirements.schema.json');
  if(!fs.existsSync(schemaPath)) throw Error('Template requirements schema missing; refresh the authorized template.');
  if (options.check) {
    if (options['--config'] || options['--out']) throw new Error('--check cannot be combined with --config or --out.');
    console.log(JSON.stringify({template:manifest.version,capabilities:manifest.capabilities,projectGenerated:false,licenseEntitlementChecked:false},null,2));
    return;
  }
  if (!options['--config'] || !options['--out']) throw new Error(usage);
  const config = path.resolve(options['--config']);
  const requirements=JSON.parse(fs.readFileSync(config,'utf8'));
  assertSafeRequirements(requirements);
  const schema=JSON.parse(fs.readFileSync(schemaPath,'utf8'));
  for(const key of Object.keys(requirements)) if(!Object.hasOwn(schema.properties,key)) throw Error('Unsupported requirement field: '+key+'. Credentials belong in Secrets; optional services use launch-config.json.');
  const cap=manifest.capabilities;
  for(const [field,supported,fallback] of [['layout','layouts','standard'],['emailProvider','emailProviders','cloudflare'],['billingProvider','paymentProviders','waffo']]) if(!cap[supported]?.includes(requirements[field]||fallback)) throw Error('Template does not support '+field+': '+requirements[field]);
  if(requirements.features?.some(feature=>!cap.features?.includes(feature))) throw Error('Template does not support the requested AI workflow.');
  if(requirements.apiEnabled && !cap.api) throw Error('Template does not support external API access.');
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
