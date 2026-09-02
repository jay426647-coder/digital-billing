import { createClient } from '@supabase/supabase-js';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const secretFromUrl = searchParams.get('secret');
  const authHeader = request.headers.get('authorization');
  const isValid =
    authHeader === `Bearer ${process.env.CRON_SECRET}` ||
    secretFromUrl === process.env.CRON_SECRET;

  if (!isValid) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    'https://yifeyrosuuhwubrgzdaz.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const financialYear = month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;

  const { data: consumers, error: consumersError } = await supabase
    .from('consumers')
    .select('id, panchayat_id');

  if (consumersError) {
    return Response.json({ error: consumersError.message }, { status: 500 });
  }

  let created = 0;

  for (const consumer of consumers) {
    const { data: existing } = await supabase
      .from('bills')
      .select('id')
      .eq('consumer_id', consumer.id)
      .eq('financial_year', financialYear)
      .eq('month', month)
      .maybeSingle();

    if (!existing) {
      const { error: insertError } = await supabase.from('bills').insert([
        {
          consumer_id: consumer.id,
          panchayat_id: consumer.panchayat_id,
          financial_year: financialYear,
          month,
          amount: 100,
          status: 'PENDING',
          payment_mode: 'NONE',
        },
      ]);
      if (!insertError) created++;
    }
  }

  const { data: pendingBills } = await supabase
    .from('bills')
    .select('id, month, financial_year')
    .eq('status', 'PENDING');

  const overdueIds = (pendingBills || [])
    .filter((b) => !(b.month === month && b.financial_year === financialYear))
    .map((b) => b.id);

  let markedOverdue = 0;
  if (overdueIds.length > 0) {
    const { error: overdueError } = await supabase
      .from('bills')
      .update({ status: 'OVERDUE', updated_at: new Date().toISOString() })
      .in('id', overdueIds);
    if (!overdueError) markedOverdue = overdueIds.length;
  }

  return Response.json({ success: true, created, markedOverdue, month, financialYear });
}
