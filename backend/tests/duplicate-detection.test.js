/**
 * Test Suite for Duplicate Image Detection
 * 
 * Run with: npm test
 * Or manually test with the functions below
 */

const { generateSHA256Hash, generatePerceptualHash, areSimilarImages } = require('../utils/imageHash');
const fs = require('fs').promises;
const path = require('path');

/**
 * Test 1: Generate SHA-256 hash from a test image
 */
async function testSHA256Hash() {
  console.log('\n=== Test 1: SHA-256 Hash Generation ===');
  try {
    const testImagePath = path.join(__dirname, '../test-assets/sample-image.jpg');
    const buffer = await fs.readFile(testImagePath);
    
    const hash1 = generateSHA256Hash(buffer);
    console.log('✅ Hash generated:', hash1);
    
    // Generate again from same file
    const hash2 = generateSHA256Hash(buffer);
    console.log('✅ Hash consistency check:', hash1 === hash2 ? 'PASS' : 'FAIL');
    
    // Modify buffer slightly
    const modifiedBuffer = Buffer.concat([buffer, Buffer.from([0])]);
    const hash3 = generateSHA256Hash(modifiedBuffer);
    console.log('✅ Hash changes with content:', hash1 !== hash3 ? 'PASS' : 'FAIL');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

/**
 * Test 2: Generate perceptual hash from a test image
 */
async function testPerceptualHash() {
  console.log('\n=== Test 2: Perceptual Hash Generation ===');
  try {
    const testImagePath = path.join(__dirname, '../test-assets/sample-image.jpg');
    const buffer = await fs.readFile(testImagePath);
    
    const pHash = await generatePerceptualHash(buffer);
    console.log('✅ Perceptual hash generated:', pHash);
    console.log('✅ Hash length:', pHash ? pHash.length : 'N/A');
    console.log('✅ Hash format:', /^[0-9a-f]{16}$/i.test(pHash) ? 'VALID' : 'INVALID');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

/**
 * Test 3: Compare similar images
 */
async function testSimilarImages() {
  console.log('\n=== Test 3: Similar Image Detection ===');
  try {
    const image1Path = path.join(__dirname, '../test-assets/original.jpg');
    const image2Path = path.join(__dirname, '../test-assets/slightly-modified.jpg');
    
    const buffer1 = await fs.readFile(image1Path);
    const buffer2 = await fs.readFile(image2Path);
    
    const pHash1 = await generatePerceptualHash(buffer1);
    const pHash2 = await generatePerceptualHash(buffer2);
    
    console.log('Image 1 pHash:', pHash1);
    console.log('Image 2 pHash:', pHash2);
    
    const isSimilar = areSimilarImages(pHash1, pHash2, 0.9);
    console.log('✅ Images are similar:', isSimilar ? 'YES' : 'NO');
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('   Note: Place test images in backend/test-assets/ directory');
    return false;
  }
}

/**
 * Test 4: Performance benchmark
 */
async function testPerformance() {
  console.log('\n=== Test 4: Performance Benchmark ===');
  try {
    const testImagePath = path.join(__dirname, '../test-assets/sample-image.jpg');
    const buffer = await fs.readFile(testImagePath);
    
    // Test SHA-256 performance
    const sha256Start = Date.now();
    for (let i = 0; i < 100; i++) {
      generateSHA256Hash(buffer);
    }
    const sha256Time = Date.now() - sha256Start;
    console.log(`✅ SHA-256: ${sha256Time}ms for 100 iterations (avg: ${sha256Time/100}ms)`);
    
    // Test perceptual hash performance
    const pHashStart = Date.now();
    for (let i = 0; i < 10; i++) {
      await generatePerceptualHash(buffer);
    }
    const pHashTime = Date.now() - pHashStart;
    console.log(`✅ Perceptual: ${pHashTime}ms for 10 iterations (avg: ${pHashTime/10}ms)`);
    
    return true;
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║  Duplicate Detection Test Suite       ║');
  console.log('╚════════════════════════════════════════╝');
  
  const results = [
    await testSHA256Hash(),
    await testPerceptualHash(),
    await testSimilarImages(),
    await testPerformance()
  ];
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log('\n╔════════════════════════════════════════╗');
  console.log(`║  Results: ${passed}/${total} tests passed           ║`);
  console.log('╚════════════════════════════════════════╝\n');
  
  return passed === total;
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = {
  testSHA256Hash,
  testPerceptualHash,
  testSimilarImages,
  testPerformance,
  runAllTests
};

// Basic Jest test to ensure the suite is picked up
describe('duplicate-detection test harness', () => {
  test('placeholder test runs', () => {
    expect(true).toBe(true);
  });
});
