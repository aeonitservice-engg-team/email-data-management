import { NextRequest, NextResponse } from 'next/server';
import { withDatabase } from '@/lib/api-utils';

/**
 * GET /api/test-db
 * 
 * Test database connection using URL from X-Database-URL header
 */
export async function GET(request: NextRequest) {
  // Debug: Check what header we received
  const dbUrlHeader = request.headers.get('x-database-url');
  console.log('Test DB - Received header:', dbUrlHeader ? 'YES (length: ' + dbUrlHeader.length + ')' : 'NO');
  
  if (!dbUrlHeader) {
    return NextResponse.json({
      success: false,
      error: 'No database URL provided. Please configure it in Settings page and ensure it is saved to localStorage.',
      timestamp: new Date().toISOString(),
    }, { status: 400 });
  }

  return withDatabase(request, async (prisma) => {
    try {
      // Test connection by running a simple query
      const result = await prisma.$queryRaw`SELECT VERSION() as version, DATABASE() as db, CONNECTION_ID() as conn_id`;
      const info = result as any[];
      
      return NextResponse.json({
        success: true,
        serverVersion: info[0]?.version || 'Unknown',
        database: info[0]?.db || 'Unknown',
        connectionId: info[0]?.conn_id ? String(info[0].conn_id) : null, // Convert BigInt to string
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      let errorMessage = 'Unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Provide helpful error messages
        if (errorMessage.includes('ENOTFOUND')) {
          errorMessage = `Cannot resolve host. Please check the hostname.`;
        } else if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNREFUSED')) {
          errorMessage = `Connection timeout or refused. Please check host, port, and firewall settings.`;
        } else if (errorMessage.includes('Access denied')) {
          errorMessage = `Access denied. Please check username and password.`;
        } else if (errorMessage.includes('Unknown database')) {
          errorMessage = `Unknown database. Please check the database name.`;
        } else if (errorMessage.includes('No database URL configured')) {
          errorMessage = `No database URL configured. Please configure it in the Settings page.`;
        }
      }
      
      return NextResponse.json({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }
  });
}
