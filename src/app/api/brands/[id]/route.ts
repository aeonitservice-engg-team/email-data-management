import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/brands/[id] - Get a single brand by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { journals: true },
        },
        journals: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: { contacts: true },
            },
          },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    return NextResponse.json(
      { error: 'Failed to fetch brand' },
      { status: 500 }
    );
  }
}

// PUT /api/brands/[id] - Update a brand
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, code, status } = body;

    // Check if brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: { id },
    });

    if (!existingBrand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    // Check for conflicts with other brands
    if (name || code) {
      const conflictingBrand = await prisma.brand.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              OR: [
                ...(name
                  ? [{ name: { equals: name, mode: 'insensitive' as const } }]
                  : []),
                ...(code
                  ? [{ code: { equals: code, mode: 'insensitive' as const } }]
                  : []),
              ],
            },
          ],
        },
      });

      if (conflictingBrand) {
        return NextResponse.json(
          { error: 'Brand with this name or code already exists' },
          { status: 409 }
        );
      }
    }

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code: code.toUpperCase() }),
        ...(status && { status }),
      },
      include: {
        _count: {
          select: { journals: true },
        },
      },
    });

    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    );
  }
}

// DELETE /api/brands/[id] - Delete a brand
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Check if brand has journals
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: {
          select: { journals: true },
        },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: 'Brand not found' }, { status: 404 });
    }

    if (brand._count.journals > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete brand with ${brand._count.journals} associated journals. Delete or reassign journals first.`,
        },
        { status: 409 }
      );
    }

    await prisma.brand.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    );
  }
}
