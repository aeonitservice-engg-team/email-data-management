import { NextRequest, NextResponse } from 'next/server';
import Papa from 'papaparse';
import prisma from '@/lib/prisma';
import { isValidEmail } from '@/lib/utils';

/**
 * POST /api/import
 * 
 * Imports email contacts from a CSV file.
 * 
 * Required form data:
 * - file: CSV file
 * - journalId: Target journal ID (required - no auto-detection)
 * 
 * Expected CSV headers:
 * - name (required)
 * - email (required)
 * - phone (optional)
 * - article_title (optional) - title of the article/publication
 * - year (optional) - year of data collection
 * 
 * NOTE: Email must be globally unique across all journals
 */

interface CSVRow {
  name: string;
  email: string;
  phone?: string;
  article_title?: string;
  year?: string;
}

const CHUNK_SIZE = 500;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const journalId = formData.get('journalId') as string | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 },
      );
    }

    if (!journalId) {
      return NextResponse.json(
        { error: 'Journal ID is required. Please select a journal before uploading.' },
        { status: 400 },
      );
    }

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 },
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 },
      );
    }

    // Verify journal exists
    const journal = await prisma.journal.findUnique({
      where: { id: journalId },
      include: {
        brand: true,
      },
    });

    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 },
      );
    }

    // Read file content
    const text = await file.text();

    // Parse CSV
    const parseResult = Papa.parse<CSVRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
    });

    if (parseResult.errors.length > 0) {
      return NextResponse.json(
        { 
          error: 'CSV parsing errors', 
          details: parseResult.errors.slice(0, 5).map((e) => e.message),
        },
        { status: 400 },
      );
    }

    const rows = parseResult.data;

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'CSV file is empty or has no valid data rows' },
        { status: 400 },
      );
    }

    // Validate required headers
    const requiredHeaders = ['name', 'email'];
    const headers = parseResult.meta.fields || [];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 },
      );
    }

    // Process rows in chunks
    let imported = 0;
    let duplicates = 0;
    let errors = 0;
    const errorDetails: string[] = [];

    for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
      const chunk = rows.slice(i, i + CHUNK_SIZE);
      
      for (const row of chunk) {
        try {
          const name = row.name?.trim();
          const email = row.email?.trim().toLowerCase();
          const phone = row.phone?.trim() || null;
          const articleTitle = row.article_title?.trim() || null;
          const yearStr = row.year?.trim();
          const year = yearStr ? parseInt(yearStr, 10) : null;
          
          // Validate required fields
          if (!name || !email) {
            errors++;
            errorDetails.push(`Missing name or email in row`);
            continue;
          }

          // Validate email format
          if (!isValidEmail(email)) {
            errors++;
            errorDetails.push(`Invalid email format: ${email}`);
            continue;
          }

          // Validate year if provided
          if (yearStr && (isNaN(year!) || year! < 1900 || year! > 2100)) {
            errors++;
            errorDetails.push(`Invalid year: ${yearStr}`);
            continue;
          }

          // Check if email already exists globally
          const existingContact = await prisma.emailContact.findUnique({
            where: { email },
          });

          if (existingContact) {
            duplicates++;
            continue; // Skip duplicate email
          }

          // Create new contact
          await prisma.emailContact.create({
            data: {
              name,
              email,
              phone,
              articleTitle,
              year,
              journalId,
            },
          });

          imported++;
        } catch (err: unknown) {
          // Handle unique constraint violation (race condition)
          if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
            duplicates++;
          } else {
            errors++;
            if (errorDetails.length < 10) {
              errorDetails.push(`Error processing row: ${err instanceof Error ? err.message : 'Unknown error'}`);
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      journal: {
        id: journal.id,
        name: journal.name,
        brand: journal.brand.name,
      },
      summary: {
        total: rows.length,
        imported,
        duplicates,
        errors,
        errorDetails: errorDetails.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Failed to process CSV import' },
      { status: 500 },
    );
  }
}
