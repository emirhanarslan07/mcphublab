import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, company } = await req.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('leads')
      .insert([
        { 
          email, 
          company_name: company || null,
          how_heard: 'Enterprise Page' 
        }
      ]);

    if (error) {
      console.error('Supabase error saving lead:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in leads API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
