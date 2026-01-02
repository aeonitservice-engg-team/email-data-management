import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Status } from '@prisma/client';

/**
 * GET /api/journals
 * 
 * Returns a paginated list of journals with optional filtering.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    const brandId = searchParams.get('brandId') || searchParams.get('brand') || '';
    const status = searchParams.get('status') as Status | null;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.name = { contains: search };
    }
    if (brandId) {
      where.brandId = brandId;
    }
    if (status) {
      where.status = status;
    }

    // Get journals with contact count and brand info
    const [journals, total] = await Promise.all([
      prisma.journal.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          _count: {
            select: { contacts: true },
          },
        },
      }),
      prisma.journal.count({ where }),
    ]);

    return NextResponse.json({
      journals: journals.map((j) => ({
        ...j,
        contactCount: j._count.contacts,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get journals error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journals' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/journals
 * 
 * Creates a new journal.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, issn, brandId, subject, frequency, status } = body;

    // Validate required fields
    if (!name || !brandId) {
      return NextResponse.json(
        { error: 'Name and brand are required' },
        { status: 400 },
      );
    }

    // Validate brand exists
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
    });

    if (!brand) {
      return NextResponse.json(
        { error: 'Invalid brand' },
        { status: 400 },
      );
    }

    const journal = await prisma.journal.create({
      data: {
        name,
        issn: issn || null,
        brandId,
        subject: subject || null,
        frequency: frequency || null,
        status: status || 'ACTIVE',
      },
      include: {
        brand: true,
        _count: {
          select: { contacts: true },
        },
      },
    });

    return NextResponse.json(journal, { status: 201 });
  } catch (error) {
    console.error('Create journal error:', error);
    return NextResponse.json(
      { error: 'Failed to create journal' },
      { status: 500 },
    );
  }
}
