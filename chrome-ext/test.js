// Basic validation tests for SummaTube Chrome Extension
// Run with: node test.js

const fs = require('fs');
const path = require('path');

function runTests() {
  console.log('🧪 Running SummaTube Chrome Extension Tests...\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Manifest file exists and is valid JSON
  try {
    const manifestPath = path.join(__dirname, 'manifest.json');
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    // Required manifest fields
    const requiredFields = ['manifest_version', 'name', 'version', 'description'];
    requiredFields.forEach(field => {
      if (!manifest[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    });

    // Check manifest version
    if (manifest.manifest_version !== 3) {
      throw new Error('Manifest version must be 3');
    }

    // Check icons
    if (!manifest.icons || !manifest.icons['16'] || !manifest.icons['48'] || !manifest.icons['128']) {
      throw new Error('Missing required icon sizes (16, 48, 128)');
    }

    console.log('✅ Manifest validation passed');
    passed++;
  } catch (error) {
    console.log('❌ Manifest validation failed:', error.message);
    failed++;
  }

  // Test 2: Required files exist
  const requiredFiles = [
    'manifest.json',
    'content.js',
    'styles.css',
    'icons/icon16.png',
    'icons/icon48.png',
    'icons/icon128.png'
  ];

  requiredFiles.forEach(file => {
    try {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file} exists`);
        passed++;
      } else {
        console.log(`❌ ${file} missing`);
        failed++;
      }
    } catch (error) {
      console.log(`❌ Error checking ${file}:`, error.message);
      failed++;
    }
  });

  // Test 3: Content script syntax validation
  try {
    const contentScript = fs.readFileSync(path.join(__dirname, 'content.js'), 'utf8');

    // Basic syntax check by attempting to create a new Function
    new Function(contentScript);

    // Check for required functions
    const requiredFunctions = ['getVideoId', 'fetchTranscript', 'createPanel', 'run'];
    requiredFunctions.forEach(func => {
      if (!contentScript.includes(`function ${func}`) && !contentScript.includes(`${func} =`)) {
        throw new Error(`Missing required function: ${func}`);
      }
    });

    console.log('✅ Content script validation passed');
    passed++;
  } catch (error) {
    console.log('❌ Content script validation failed:', error.message);
    failed++;
  }

  // Test 4: CSS file exists and has content
  try {
    const cssContent = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
    if (cssContent.length < 100) {
      throw new Error('CSS file seems too small');
    }
    console.log('✅ Styles validation passed');
    passed++;
  } catch (error) {
    console.log('❌ Styles validation failed:', error.message);
    failed++;
  }

  // Test 5: Check for console.log statements (should be minimal in production)
  try {
    const contentScript = fs.readFileSync(path.join(__dirname, 'content.js'), 'utf8');
    const consoleLogCount = (contentScript.match(/console\./g) || []).length;

    if (consoleLogCount > 2) { // Allow some debugging logs
      console.log(`⚠️  Found ${consoleLogCount} console statements (should be minimal in production)`);
    } else {
      console.log('✅ Console statement check passed');
      passed++;
    }
  } catch (error) {
    console.log('❌ Console check failed:', error.message);
    failed++;
  }

  // Summary
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

  if (failed === 0) {
    console.log('🎉 All tests passed! Extension is ready for review.');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Please fix the issues before submitting for review.');
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
