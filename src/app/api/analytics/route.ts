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
 * 
 * OPTIMIZED: Uses parallel queries and aggregations for better performance
 */
export async function GET() {
  try {
    // Calculate date ranges once
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

    // Execute all independent queries in parallel for better performance
    const [
      totalContacts,
      totalJournals,
      activeJournals,
      thisWeekCount,
      currentMonthCount,
      lastMonthCount,
      brands,
      journals,
      emailsByMonth,
    ] = await Promise.all([
      // Basic counts
      prisma.emailContact.count(),
      prisma.journal.count(),
      prisma.journal.count({ where: { status: 'ACTIVE' } }),
      
      // Time-based counts
      prisma.emailContact.count({
        where: { createdAt: { gte: weekAgo } },
      }),
      prisma.emailContact.count({
        where: { createdAt: { gte: currentMonthStart } },
      }),
      prisma.emailContact.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lte: lastMonthEnd,
          },
        },
      }),
      
      // Brands with journal count
      prisma.brand.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          status: true,
          createdAt: true,
          _count: {
            select: { journals: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      
      // Journals with brand and contact count
      prisma.journal.findMany({
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
            select: { contacts: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      
      // Monthly data for charts
      prisma.emailContact.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: {
          createdAt: { gte: sixMonthsAgo },
        },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    // Process aggregated data
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

    // Group emails by month
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

    // Get top 5 journals by contact count (already sorted by name, now sort by count)
    const topJournals = journals
      .sort((a, b) => b._count.contacts - a._count.contacts)
      .slice(0, 5)
      .map((j) => ({
        name: j.name,
        emails: j._count.contacts,
        brand: j.brand.name,
      }));

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
