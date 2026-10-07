import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
const root='skills/ioy-saas';
test('published workflow has a matching manifest and resolvable branch references',async()=>{
 const pkg=JSON.parse(await fs.readFile('package.json','utf8'));
 const manifest=JSON.parse(await fs.readFile(root+'/references/release-manifest.json','utf8'));
 assert.equal(pkg.version,manifest.version);
 assert.equal(manifest.capabilities.launchWorkflowVersion,1);
 assert.ok(manifest.capabilities.launchHelpers.includes('ga4'));
 assert.ok(manifest.capabilities.launchHelpers.includes('cloudflareDeployAndBind'));
 for(const relative of ['SKILL.md','references/orchestration.md','references/cloudflare.md','references/google.md','references/payments.md','references/payment-waffo.md','references/payment-creem.md','references/payment-stripe.md']){
  const file=path.join(root,relative), text=await fs.readFile(file,'utf8');
  for(const match of text.matchAll(/\[[^\]]+\]\(([^)]+\.md)\)/g)){
   if(match[1].startsWith('https://'))continue;
   assert.ok((await fs.stat(path.resolve(path.dirname(file),match[1]))).isFile(),match[1]);
  }
  assert.doesNotMatch(text,/(?:ghp_|github_pat_|sk_live_)[a-zA-Z0-9_]{16,}|GOCSPX-[a-zA-Z0-9_-]{16,}/);
 }
});
