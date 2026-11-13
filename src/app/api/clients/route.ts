import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  sanitizePostureTags,
  validateAnthropometricMeasurements,
  AnthropometricMeasurements,
} from '@/types/crm';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    let tailorId = session?.user?.id;

    if (!tailorId) {
      // In development fallback to demo tailor if available
      const demoUser = await prisma.user.findFirst({
        where: { email: 'tailor@dooz.ir' },
      });
      if (demoUser) {
        tailorId = demoUser.id;
      } else {
        return NextResponse.json({ error: 'احراز هویت الزامی است' }, { status: 401 });
      }
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim();
    const tag = searchParams.get('tag')?.trim();

    const clients = await prisma.clientProfile.findMany({
      where: {
        tailorId,
        ...(q
          ? {
              OR: [
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q } },
              ],
            }
          : {}),
        ...(tag ? { postureTags: { has: tag } } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        savedDrafts: {
          select: { id: true, title: true, baseBlock: true, method: true, updatedAt: true },
          orderBy: { updatedAt: 'desc' },
          take: 3,
        },
      },
    });

    return NextResponse.json({ success: true, clients });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return NextResponse.json({ error: 'خطای سرور در دریافت فهرست مشتریان' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    let tailorId = session?.user?.id;

    if (!tailorId) {
      const demoUser = await prisma.user.findFirst({
        where: { email: 'tailor@dooz.ir' },
      });
      if (demoUser) {
        tailorId = demoUser.id;
      } else {
        return NextResponse.json({ error: 'احراز هویت الزامی است' }, { status: 401 });
      }
    }

    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, phone, gender, fitPreference, postureTags, notes, measurements } = body;

    // Validate names
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return NextResponse.json({ error: 'نام مشتری الزامی است' }, { status: 400 });
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      return NextResponse.json({ error: 'نام خانوادگی مشتری الزامی است' }, { status: 400 });
    }

    // Validate notes
    if (notes && typeof notes === 'string' && notes.length > 5000) {
      return NextResponse.json(
        { error: 'طول یادداشت‌ها نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد' },
        { status: 400 }
      );
    }

    // Validate measurements
    if (!measurements || typeof measurements !== 'object') {
      return NextResponse.json({ error: 'اطلاعات اندازه‌گیری الزامی است' }, { status: 400 });
    }

    const measurementValidation = validateAnthropometricMeasurements(measurements);
    if (!measurementValidation.valid) {
      return NextResponse.json({ error: measurementValidation.error }, { status: 400 });
    }

    // Sanitize posture tags (deduplicate and resolve mutual exclusions)
    const sanitizedTags = sanitizePostureTags(postureTags);

    const validFitPreferences = ['TIGHT', 'CLASSIC', 'LOOSE'] as const;
    const finalFitPreference = validFitPreferences.includes(fitPreference) ? fitPreference : 'CLASSIC';

    const newClient = await prisma.clientProfile.create({
      data: {
        tailorId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone ? String(phone).trim() : null,
        gender: gender === 'MALE' ? 'MALE' : 'FEMALE',
        fitPreference: finalFitPreference,
        postureTags: sanitizedTags,
        notes: notes ? String(notes).trim() : null,
        measurements: measurements as unknown as object,
      },
    });

    return NextResponse.json({ success: true, client: newClient }, { status: 201 });
  } catch (error) {
    console.error('Failed to create client:', error);
    return NextResponse.json({ error: 'خطای سرور در ایجاد پرونده مشتری' }, { status: 500 });
  }
}
