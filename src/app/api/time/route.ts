import { NextResponse } from 'next/server';

export async function GET() {
  const currentYear = new Date().getFullYear();
  return NextResponse.json({ year: currentYear });
}
