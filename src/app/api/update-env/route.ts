import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, readFileSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { databaseUrl } = body;

    if (!databaseUrl) {
      return NextResponse.json(
        { success: false, error: 'databaseUrl is required' },
        { status: 400 }
      );
    }

    // Get the project root
    const projectRoot = process.cwd();
    const envLocalPath = join(projectRoot, '.env.local');

    // Read existing .env.local if it exists
    let envContent = '';
    try {
      envContent = readFileSync(envLocalPath, 'utf-8');
    } catch {
      // File doesn't exist yet, that's okay
    }

    // Update or create DATABASE_URL
    const lines = envContent.split('\n');
    const updatedLines = lines.filter(line => !line.startsWith('DATABASE_URL='));
    updatedLines.push(`DATABASE_URL="${databaseUrl}"`);

    const newContent = updatedLines.filter(line => line.trim()).join('\n');

    // Write the file
    writeFileSync(envLocalPath, newContent, 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Environment file updated successfully',
      hint: 'Please restart your dev server for changes to take effect',
    });

  } catch (error) {
    console.error('Error updating .env.local:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update environment file',
      },
      { status: 500 }
    );
  }
}
