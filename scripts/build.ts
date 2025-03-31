import { mkdir, copyFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

async function copyPublicFiles() {
  const sourceDir = join(process.cwd(), 'src', 'public');
  const targetDir = join(process.cwd(), 'dist', 'public');
  
  // Create the target directory if it doesn't exist
  if (!existsSync(targetDir)) {
    await mkdir(targetDir, { recursive: true });
  }
  
  // Copy CSS file
  await copyFile(
    join(sourceDir, 'styles.css'),
    join(targetDir, 'styles.css')
  );
  
  // Copy JS file
  await copyFile(
    join(sourceDir, 'script.js'),
    join(targetDir, 'script.js')
  );
  
  console.log('✅ Public files copied successfully');
}

// Run the build process
async function build() {
  try {
    await copyPublicFiles();
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

build(); 