import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/analytics
 * 
 * Returns analytics data for the dashboard including:
 * - Total emails count
 * - Emails by brand
 * - Emails by month
 * - Top journals by email count
 * - All brands and journals for caching
 */
export async function GET() {
  try {
    // Get total contacts count
    const totalContacts = await prisma.emailContact.count();

    // Get total journals count
    const totalJournals = await prisma.journal.count();

    // Get active journals count
    const activeJournals = await prisma.journal.count({
      where: { status: 'ACTIVE' },
    });

    // Get all brands with journal count
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        status: true,
        createdAt: true,
        _count: {
          select: {
            journals: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Get all journals with full details
    const journals = await prisma.journal.findMany({
      select: {
        id: true,
        name: true,
        brandId: true,
        issn: true,
        subject: true,
        frequency: true,
        status: true,
        createdAt: true,
        brand: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            contacts: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Aggregate by brand
    const brandData = journals.reduce(
      (acc, journal) => {
        const brandName = journal.brand.name;
        if (!acc[brandName]) {
          acc[brandName] = 0;
        }
        acc[brandName] += journal._count.contacts;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get emails by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const emailsByMonth = await prisma.emailContact.groupBy({
      by: ['createdAt'],
      _count: {
        id: true,
      },
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Group by month
    const monthlyData = emailsByMonth.reduce(
      (acc, item) => {
        const month = new Date(item.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          year: '2-digit',
        });
        if (!acc[month]) {
          acc[month] = 0;
        }
        acc[month] += item._count.id;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Get top 5 journals by contact count
    const topJournals = journals
      .sort((a, b) => b._count.contacts - a._count.contacts)
      .slice(0, 5)
      .map((j) => ({
        name: j.name,
        emails: j._count.contacts,
        brand: j.brand.name,
      }));

    // Calculate this week's additions
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeekCount = await prisma.emailContact.count({
      where: {
        createdAt: {
          gte: weekAgo,
        },
      },
    });

    // Calculate last month's additions
    const lastMonthStart = new Date();
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    lastMonthStart.setDate(1);
    const lastMonthEnd = new Date();
    lastMonthEnd.setDate(0);
    
    const lastMonthCount = await prisma.emailContact.count({
      where: {
        createdAt: {
          gte: lastMonthStart,
          lte: lastMonthEnd,
        },
      },
    });

    // Current month count
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0, 0, 0, 0);
    
    const currentMonthCount = await prisma.emailContact.count({
      where: {
        createdAt: {
          gte: currentMonthStart,
        },
      },
    });

    // Calculate percentage change
    const percentChange = lastMonthCount > 0
      ? Math.round(((currentMonthCount - lastMonthCount) / lastMonthCount) * 100)
      : 0;

    return NextResponse.json({
      stats: {
        totalContacts,
        totalJournals,
        activeJournals,
        thisWeekCount,
        percentChange,
      },
      brandData: Object.entries(brandData).map(([name, value]) => ({
        name,
        value,
      })),
      monthlyData: Object.entries(monthlyData).map(([name, emails]) => ({
        name,
        emails,
      })),
      topJournals,
      brands,
      journals: journals.map(j => ({
        id: j.id,
        name: j.name,
        brandId: j.brandId,
        issn: j.issn,
        subject: j.subject,
        frequency: j.frequency,
        status: j.status,
        createdAt: j.createdAt,
        brand: j.brand,
        contactCount: j._count.contacts,
      })),
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 },
    );
  }
}
