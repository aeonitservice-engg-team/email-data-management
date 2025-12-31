import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Status } from '@prisma/client';

/**
 * GET /api/journals/[id]
 * 
 * Returns a single journal by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const journal = await prisma.journal.findUnique({
      where: { id },
      include: {
        brand: true,
        _count: {
          select: { contacts: true },
        },
      },
    });

    if (!journal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ...journal,
      contactCount: journal._count.contacts,
      _count: undefined,
    });
  } catch (error) {
    console.error('Get journal error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch journal' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/journals/[id]
 * 
 * Updates an existing journal.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    // Check if journal exists
    const existingJournal = await prisma.journal.findUnique({
      where: { id },
    });

    if (!existingJournal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 },
      );
    }

    const journal = await prisma.journal.update({
      where: { id },
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

    return NextResponse.json(journal);
  } catch (error) {
    console.error('Update journal error:', error);
    return NextResponse.json(
      { error: 'Failed to update journal' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/journals/[id]
 * 
 * Deletes a journal and all associated contacts.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if journal exists
    const existingJournal = await prisma.journal.findUnique({
      where: { id },
    });

    if (!existingJournal) {
      return NextResponse.json(
        { error: 'Journal not found' },
        { status: 404 },
      );
    }

    // Delete journal (contacts will be cascade deleted)
    await prisma.journal.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete journal error:', error);
    return NextResponse.json(
      { error: 'Failed to delete journal' },
      { status: 500 },
    );
  }
}
