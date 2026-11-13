// Packs the app into one self-contained HTML body for publishing as a claude.ai
// Artifact: builds with the in-memory router, then inlines the JS and CSS
// (the Artifact page may only load scripts from a few CDNs, so the bundle has
// to ship inside the page). Output: dist-artifact/flight-points-optimizer.html
import { execSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const out = 'dist-artifact'
execSync(`npx vite build --outDir ${out}/build --emptyOutDir --base ./`, {
  stdio: 'inherit',
  env: { ...process.env, VITE_ROUTER: 'memory' },
})

const assets = join(out, 'build', 'assets')
const files = readdirSync(assets)
const read = (ext) =>
  files
    .filter((f) => f.endsWith(ext))
    .map((f) => readFileSync(join(assets, f), 'utf8'))
    .join('\n')

// A literal "</script" inside the bundle would end the inline tag early.
const js = read('.js').replace(/<\/script/gi, '<\\/script')
const css = read('.css')

const page = `<title>Flight Points Optimizer</title>
<style>
${css}
</style>
<div id="root"></div>
<script type="module">
${js}
</script>
`
mkdirSync(out, { recursive: true })
writeFileSync(join(out, 'flight-points-optimizer.html'), page)
console.log(`Wrote ${out}/flight-points-optimizer.html (${(page.length / 1024).toFixed(0)} KB)`)
