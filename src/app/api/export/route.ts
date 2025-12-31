import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import prisma from '@/lib/prisma';

/**
 * GET /api/export
 * 
 * Exports email contacts to a CSV file with optional filtering.
 * 
 * Query parameters:
 * - startDate: Filter contacts created after this date
 * - endDate: Filter contacts created before this date
 * - journalId: Filter by specific journal
 * - brandId: Filter by specific brand
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const journalId = searchParams.get('journalId');
    const brandId = searchParams.get('brandId');

    // Build where clause
    const where: {
      createdAt?: { gte?: Date; lte?: Date };
      journalId?: string;
      journal?: { brandId: string };
    } = {};

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        // Start of the day (00:00:00.000)
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        // End of the day (23:59:59.999) to include all records created on that day
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        where.createdAt.lte = endOfDay;
      }
    }

    if (journalId) {
      where.journalId = journalId;
    }

    if (brandId) {
      where.journal = { brandId };
    }

    // Fetch contacts with journal data
    const contacts = await prisma.emailContact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        name: true,
        email: true,
        phone: true,
        articleTitle: true,
        year: true,
      },
    });

    console.log(`Export: Found ${contacts.length} contacts for export`);

    // Check if no contacts found
    if (contacts.length === 0) {
      console.log('Export: No contacts found with filters:', { startDate, endDate, journalId, brandId });
      // Return empty CSV with headers
      const csv = Papa.unparse([], {
        header: true,
        columns: ['name', 'email', 'phone', 'article_title', 'year'],
      });
      
      const filename = `email-contacts-${new Date().toISOString().split('T')[0]}.csv`;
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Transform data for CSV
    const csvData = contacts.map((contact) => ({
      name: contact.name,
      email: contact.email,
      phone: contact.phone || '',
      article_title: contact.articleTitle || '',
      year: contact.year || '',
    }));

    // Generate CSV
    const csv = Papa.unparse(csvData, {
      header: true,
    });

    // Create response with CSV file
    const filename = `email-contacts-${new Date().toISOString().split('T')[0]}.csv`;

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export contacts' },
      { status: 500 },
    );
  }
}
