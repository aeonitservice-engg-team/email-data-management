import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/contacts/[id]
 * 
 * Returns a single contact by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const contact = await prisma.emailContact.findUnique({
      where: { id },
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

    if (!contact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(contact);
  } catch (error) {
    console.error('Get contact error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contact' },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/contacts/[id]
 * 
 * Updates an existing contact.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    // Check if contact exists
    const existingContact = await prisma.emailContact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 },
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

    const contact = await prisma.emailContact.update({
      where: { id },
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

    return NextResponse.json(contact);
  } catch (error: unknown) {
    console.error('Update contact error:', error);

    // Handle unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json(
        { error: 'This email already exists in the database' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'Failed to update contact' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/contacts/[id]
 * 
 * Deletes a contact.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if contact exists
    const existingContact = await prisma.emailContact.findUnique({
      where: { id },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: 'Contact not found' },
        { status: 404 },
      );
    }

    await prisma.emailContact.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json(
      { error: 'Failed to delete contact' },
      { status: 500 },
    );
  }
}
