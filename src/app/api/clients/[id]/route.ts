import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  sanitizePostureTags,
  validateAnthropometricMeasurements,
} from '@/types/crm';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || id.trim().length === 0) {
      return NextResponse.json({ error: 'شناسه مشتری ارائه نشده است' }, { status: 400 });
    }

    const client = await prisma.clientProfile.findUnique({
      where: { id },
      include: {
        savedDrafts: {
          orderBy: { updatedAt: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json({ error: 'مشتری مورد نظر یافت نشد' }, { status: 404 });
    }

    return NextResponse.json({ success: true, client });
  } catch (error) {
    console.error('Failed to get client:', error);
    return NextResponse.json({ error: 'خطای سرور در بازیابی پرونده مشتری' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || id.trim().length === 0) {
      return NextResponse.json({ error: 'شناسه مشتری ارائه نشده است' }, { status: 400 });
    }

    const existing = await prisma.clientProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'مشتری مورد نظر یافت نشد' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { firstName, lastName, phone, gender, fitPreference, postureTags, notes, measurements } = body;

    if (firstName !== undefined) {
      if (typeof firstName !== 'string' || firstName.trim().length === 0) {
        return NextResponse.json({ error: 'نام مشتری الزامی است' }, { status: 400 });
      }
    }
    if (lastName !== undefined) {
      if (typeof lastName !== 'string' || lastName.trim().length === 0) {
        return NextResponse.json({ error: 'نام خانوادگی مشتری الزامی است' }, { status: 400 });
      }
    }
    if (notes && typeof notes === 'string' && notes.length > 5000) {
      return NextResponse.json(
        { error: 'طول یادداشت‌ها نمی‌تواند بیشتر از ۵۰۰۰ کاراکتر باشد' },
        { status: 400 }
      );
    }

    if (measurements !== undefined) {
      const measurementValidation = validateAnthropometricMeasurements(measurements);
      if (!measurementValidation.valid) {
        return NextResponse.json({ error: measurementValidation.error }, { status: 400 });
      }
    }

    const sanitizedTags = postureTags !== undefined ? sanitizePostureTags(postureTags) : existing.postureTags;

    const updated = await prisma.clientProfile.update({
      where: { id },
      data: {
        ...(firstName ? { firstName: firstName.trim() } : {}),
        ...(lastName ? { lastName: lastName.trim() } : {}),
        ...(phone !== undefined ? { phone: phone ? String(phone).trim() : null } : {}),
        ...(gender ? { gender: gender === 'MALE' ? 'MALE' : 'FEMALE' } : {}),
        ...(fitPreference ? { fitPreference } : {}),
        postureTags: sanitizedTags,
        ...(notes !== undefined ? { notes: notes ? String(notes).trim() : null } : {}),
        ...(measurements ? { measurements: measurements as unknown as object } : {}),
      },
    });

    return NextResponse.json({ success: true, client: updated });
  } catch (error) {
    console.error('Failed to update client:', error);
    return NextResponse.json({ error: 'خطای سرور در ویرایش پرونده مشتری' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || id.trim().length === 0) {
      return NextResponse.json({ error: 'شناسه مشتری ارائه نشده است' }, { status: 400 });
    }

    const existing = await prisma.clientProfile.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'مشتری مورد نظر یافت نشد' }, { status: 404 });
    }

    await prisma.clientProfile.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'پرونده مشتری با موفقیت حذف شد' });
  } catch (error) {
    console.error('Failed to delete client:', error);
    return NextResponse.json({ error: 'خطای سرور در حذف پرونده مشتری' }, { status: 500 });
  }
}
