-- Add the sequence-step reference consumed by sales-orchestrator.
-- The orchestrator reads and writes this column when tracking sequence progress.
alter table public.sales_activities
  add column if not exists sequence_step integer;

update public.sales_activities a
set sequence_step = e.current_step
from public.sales_enrollments e
where a.enrollment_id = e.id
  and a.sequence_step is null;

create index if not exists sales_activities_enrollment_step_idx
  on public.sales_activities (enrollment_id, sequence_step, created_at desc)
  where enrollment_id is not null;
