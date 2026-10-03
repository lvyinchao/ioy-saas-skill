import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const bridge = fileURLToPath(new URL('../skills/ioy-saas/scripts/create-project.mjs', import.meta.url));
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ioy-skill-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const template = path.join(root, 'template');
  fs.mkdirSync(path.join(template, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(template, 'docs'));
  fs.writeFileSync(path.join(template, 'README.md'), 'fixture');
  fs.writeFileSync(path.join(template, 'docs/launch.md'), 'fixture');
  fs.writeFileSync(path.join(template, 'scripts/create-saas.mjs'), `import fs from 'node:fs'; import path from 'node:path'; const args=process.argv.slice(2); const out=args[args.indexOf('--out')+1]; const config=args[args.indexOf('--config')+1]; fs.mkdirSync(out,{recursive:true}); fs.writeFileSync(path.join(out,'generated.json'),fs.readFileSync(config));`);
  const config = path.join(root, 'requirements.json');
  fs.writeFileSync(config, JSON.stringify({ id: 'test-product', apiEnabled: true }));
  const output = path.join(root, 'product');
  const run = (...args) => spawnSync(process.execPath, [bridge, '--template', template, ...args], { encoding: 'utf8' });
  return { root, template, config, output, run };
}
test('delegates JSON requirements and output to the local generator', t => {
  const f = fixture(t); const r = f.run('--config', f.config, '--out', f.output);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(f.output, 'generated.json'))), { id: 'test-product', apiEnabled: true });
});
test('check is read-only and missing templates fail without generating', t => {
  const f = fixture(t); assert.equal(f.run('--check').status, 0); assert.equal(fs.existsSync(f.output), false);
  fs.unlinkSync(path.join(f.template, 'README.md'));
  assert.notEqual(f.run('--config', f.config, '--out', f.output).status, 0); assert.equal(fs.existsSync(f.output), false);
});
test('nonempty output is preserved', t => {
  const f = fixture(t); fs.mkdirSync(f.output); fs.writeFileSync(path.join(f.output, 'keep.txt'), 'existing');
  assert.notEqual(f.run('--config', f.config, '--out', f.output).status, 0);
  assert.deepEqual(fs.readdirSync(f.output), ['keep.txt']); assert.equal(fs.readFileSync(path.join(f.output, 'keep.txt'), 'utf8'), 'existing');
});
test('secret fields and private key values fail before generating', t => {
  const f = fixture(t);
  const privateKeyFixture = ['-----BEGIN', 'PRIVATE KEY-----', 'fixture'].join(' ');
  for (const config of [{ model: { apiKey: 'fixture' } }, { description: privateKeyFixture }]) {
    fs.writeFileSync(f.config, JSON.stringify(config)); assert.notEqual(f.run('--config', f.config, '--out', f.output).status, 0); assert.equal(fs.existsSync(f.output), false);
  }
});
test('direct and symlinked outputs inside the template are rejected', t => {
  const f = fixture(t); const link = path.join(f.root, 'alias'); fs.symlinkSync(f.template, link, 'dir');
  for (const output of [path.join(f.template, 'nested'), path.join(link, 'nested')]) {
    assert.notEqual(f.run('--config', f.config, '--out', output).status, 0); assert.equal(fs.existsSync(output), false);
  }
});
test('failed generator is reported without a success message', t => {
  const f = fixture(t); fs.writeFileSync(path.join(f.template, 'scripts/create-saas.mjs'), 'process.exit(7)');
  const r = f.run('--config', f.config, '--out', f.output); assert.notEqual(r.status, 0); assert.doesNotMatch(r.stdout, /Project generated/);
});
