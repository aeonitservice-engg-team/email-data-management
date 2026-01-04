import { NextRequest, NextResponse } from 'next/server';
import { testDatabaseConnection } from '@/lib/prisma-dynamic';

// GET /api/settings/database - Get current database configuration
export async function GET(request: NextRequest) {
  try {
    // Get database URL from localStorage (sent via header)
    const databaseUrl = request.headers.get('x-database-url') || process.env.DATABASE_URL;
    
    // Return masked database URL for security
    const maskedUrl = databaseUrl 
      ? databaseUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@')
      : null;

    return NextResponse.json({
      databaseUrl: maskedUrl,
      isConfigured: !!databaseUrl,
      isDefault: !request.headers.get('x-database-url'),
    });
  } catch (error) {
    console.error('Error fetching database settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch database settings' },
      { status: 500 }
    );
  }
}

// POST /api/settings/database - Test and validate database connection
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { databaseUrl, action } = body;

    if (!databaseUrl) {
      return NextResponse.json(
        { error: 'Database URL is required' },
        { status: 400 }
      );
    }

    if (action === 'test') {
      // Test the database connection
      const isValid = await testDatabaseConnection(databaseUrl);

      return NextResponse.json({
        success: isValid,
        message: isValid 
          ? 'Database connection successful' 
          : 'Database connection failed. Please check your credentials.',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error testing database connection:', error);
    return NextResponse.json(
      { error: 'Failed to test database connection', details: String(error) },
      { status: 500 }
    );
  }
}
