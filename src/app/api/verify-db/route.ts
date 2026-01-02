import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/verify-db
 * 
 * Verifies database connection and table structure
 */
export async function GET() {
  const results: Record<string, any> = {
    connection: false,
    tables: {},
    errors: [],
  };

  try {
    // Test connection
    await prisma.$connect();
    results.connection = true;

    // Check brands table
    try {
      const brandCount = await prisma.brand.count();
      const brands = await prisma.brand.findMany({ take: 3 });
      results.tables.brands = {
        exists: true,
        count: brandCount,
        sample: brands,
      };
    } catch (error) {
      results.tables.brands = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.errors.push(`Brands table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check journals table
    try {
      const journalCount = await prisma.journal.count();
      const journals = await prisma.journal.findMany({ take: 3 });
      results.tables.journals = {
        exists: true,
        count: journalCount,
        sample: journals,
      };
    } catch (error) {
      results.tables.journals = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.errors.push(`Journals table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check email_contacts table
    try {
      const contactCount = await prisma.emailContact.count();
      const contacts = await prisma.emailContact.findMany({ take: 3 });
      results.tables.email_contacts = {
        exists: true,
        count: contactCount,
        sample: contacts,
      };
    } catch (error) {
      results.tables.email_contacts = {
        exists: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      results.errors.push(`Email contacts table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    await prisma.$disconnect();

    const allTablesExist = results.tables.brands?.exists && 
                          results.tables.journals?.exists && 
                          results.tables.email_contacts?.exists;

    return NextResponse.json({
      success: allTablesExist,
      message: allTablesExist 
        ? 'All tables exist and are accessible' 
        : 'Some tables are missing or inaccessible',
      ...results,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({
      success: false,
      message: 'Database verification failed',
      connection: false,
      error: errorMessage,
      hint: 'Make sure MySQL is running and the database exists. Import setup-mysql.sql via phpMyAdmin.',
    }, { status: 500 });
  }
}
