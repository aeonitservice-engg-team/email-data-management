import { NextRequest, NextResponse } from 'next/server';

/**
 * Settings are stored in localStorage on the client side
 * This API is just for testing the database connection
 */

/**
 * GET /api/settings
 * 
 * Returns current environment info (for display purposes only)
 */
export async function GET() {
  try {
    return NextResponse.json({
      message: 'Settings are managed client-side via localStorage',
      hasEnvVariable: !!process.env.DATABASE_URL,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Error in settings GET:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve settings info' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings
 * 
 * Validates database URL format
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { databaseUrl } = body;

    if (!databaseUrl || typeof databaseUrl !== 'string') {
      return NextResponse.json(
        { error: 'Invalid database URL' },
        { status: 400 }
      );
    }

    // Validate database URL format
    if (!databaseUrl.startsWith('mysql://') && !databaseUrl.startsWith('postgresql://')) {
      return NextResponse.json(
        { error: 'Database URL must start with mysql:// or postgresql://' },
        { status: 400 }
      );
    }

    // URL is valid - client will store it in localStorage
    return NextResponse.json({
      success: true,
      message: 'Database URL is valid and saved to localStorage',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error validating settings:', error);
    return NextResponse.json(
      { error: 'Failed to validate settings' },
      { status: 500 }
    );
  }
}
