import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export async function POST(request: Request) {
  let connection;
  
  try {
    const body = await request.json();
    const { host, port, username, password, database } = body;
    
    // Validate required fields
    if (!host || !username || !database) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: host, username, and database are required',
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }
    
    const timestamp = new Date().toISOString();
    
    // Create MySQL connection
    connection = await mysql.createConnection({
      host,
      port: port || 3306,
      user: username,
      password: password || '',
      database,
      connectTimeout: 10000, // 10 seconds timeout
    });
    
    // Test connection with version query
    const [versionRows] = await connection.query('SELECT VERSION() as version');
    const serverVersion = (versionRows as any)[0]?.version || 'Unknown';
    
    // Get current database
    const [dbRows] = await connection.query('SELECT DATABASE() as db');
    const currentDatabase = (dbRows as any)[0]?.db || 'Unknown';
    
    // Get connection info
    const [connRows] = await connection.query('SELECT CONNECTION_ID() as conn_id');
    const connectionId = (connRows as any)[0]?.conn_id;
    
    await connection.end();
    
    return NextResponse.json({
      success: true,
      serverVersion,
      database: currentDatabase,
      connectionId,
      timestamp,
    });
  } catch (error) {
    const timestamp = new Date().toISOString();
    let errorMessage = 'Unknown error occurred';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Provide more helpful error messages for common issues
      if (errorMessage.includes('ENOTFOUND')) {
        errorMessage = `Cannot resolve host: ${errorMessage}. Please check the hostname.`;
      } else if (errorMessage.includes('ETIMEDOUT') || errorMessage.includes('ECONNREFUSED')) {
        errorMessage = `Connection timeout or refused: ${errorMessage}. Please check host, port, and firewall settings.`;
      } else if (errorMessage.includes('Access denied')) {
        errorMessage = `Access denied: ${errorMessage}. Please check username and password.`;
      } else if (errorMessage.includes('Unknown database')) {
        errorMessage = `Unknown database: ${errorMessage}. Please check the database name.`;
      }
    }
    
    // Close connection if it was opened
    if (connection) {
      try {
        await connection.end();
      } catch (closeError) {
        // Ignore close errors
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      timestamp,
    }, { status: 500 });
  }
}
