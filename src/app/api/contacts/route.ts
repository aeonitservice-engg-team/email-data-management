import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/contacts
 * 
 * Returns a paginated list of email contacts with optional filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const search = searchParams.get('search') || '';
    const journalId = searchParams.get('journalId') || null;
    const brandId = searchParams.get('brandId') || searchParams.get('brand') || null;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { articleTitle: { contains: search } },
      ];
    }
    if (journalId) {
      where.journalId = journalId;
    }
    if (brandId) {
      where.journal = { brandId };
    }

    // Get contacts with journal and brand info
    const [contacts, total] = await Promise.all([
      prisma.emailContact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          journal: {
            select: {
              id: true,
              name: true,
              brand: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
        },
      }),
      prisma.emailContact.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contacts' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/contacts
 * 
 * Creates a new email contact.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, articleTitle, journalId } = body;

    // Validate required fields
    if (!name || !email || !journalId) {
      return NextResponse.json(
        { error: 'Name, email, and journalId are required' },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 },
      );
    }

    // Check if journal exists
    const journal = await prisma.journal.findUnique({
      where: { id: journalId },
    });

    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 },
      );
    }

    // Create contact (will fail if duplicate email globally)
    const contact = await prisma.emailContact.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone: phone || null,
        articleTitle: articleTitle || null,
        journalId,
      },
      include: {
        journal: {
          select: {
            id: true,
            name: true,
            brand: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error: unknown) {
    console.error('Create contact error:', error);
    
    // Handle unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This email already exists in the database' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to create contact' },
      { status: 500 },
    );
  }
}
