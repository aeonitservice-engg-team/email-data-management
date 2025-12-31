import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/brands - List all brands with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    // Get brands with journal count
    const [brands, total] = await Promise.all([
      prisma.brand.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { journals: true },
          },
        },
      }),
      prisma.brand.count({ where }),
    ]);

    return NextResponse.json({
      brands,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}

// POST /api/brands - Create a new brand
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, code, status } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if brand with same name or code already exists
    const existingBrand = await prisma.brand.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { code: { equals: code, mode: 'insensitive' } },
        ],
      },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: 'Brand with this name or code already exists' },
        { status: 409 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        code: code.toUpperCase(),
        status: status || 'ACTIVE',
      },
      include: {
        _count: {
          select: { journals: true },
        },
      },
    });

    return NextResponse.json(brand, { status: 201 });
  } catch (error) {
    console.error('Error creating brand:', error);
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}
