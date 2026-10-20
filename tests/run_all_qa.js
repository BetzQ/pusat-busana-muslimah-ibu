import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const tests = [
  'qa_stage1_data.test.js',
  'qa_stage2_mobile_ui.test.js',
  'qa_stage3_canvas_draw.test.js',
  'qa_stage4_calculator_wa.test.js'
];

console.log('\n╔══════════════════════════════════════════════════════════╗');
console.log('║   QA TESTING GATE - PUSAT BUSANA MUSLIMAH IBU            ║');
console.log('╚══════════════════════════════════════════════════════════╝\n');

let passed = 0;
let failed = 0;

async function runTest(testFile) {
  return new Promise((resolve) => {
    console.log(`\n▶ Running: ${testFile}...`);
    const child = spawn('node', ['--test', path.join(__dirname, testFile)], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        console.log(`✅ ${testFile} - PASSED`);
        passed++;
      } else {
        console.log(`❌ ${testFile} - FAILED (exit code ${code})`);
        failed++;
      }
      resolve();
    });
  });
}

async function runAll() {
  for (const t of tests) {
    await runTest(t);
  }
  
  console.log('\n╔══════════════════════════════════════════════════════════╗');
  console.log('║                    LAPORAN HASIL QA                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`\n✅ PASSED: ${passed}/${tests.length}`);
  console.log(`❌ FAILED: ${failed}/${tests.length}`);
  console.log(`\nStatus: ${failed === 0 ? '🎉 SEMUA TEST LULUS - SIAP DEPLOY!' : '⚠️ ADA TEST GAGAL - PERLU PERBAIKAN'}`);
  console.log('\n');
  
  process.exit(failed === 0 ? 0 : 1);
}

runAll();
