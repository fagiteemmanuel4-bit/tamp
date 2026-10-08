-- TAMP course privacy hardening
-- Public users may discover course metadata, but paid/enrolled users only may read course delivery content.
-- This migration is intentionally additive and uses RESTRICTIVE policies so existing permissive
-- policies cannot accidentally make private course material public.

revoke select on public.course_levels from anon;
revoke select on public.course_readings from anon;
revoke select on public.course_reading_versions from anon;
revoke select on public.assignments from anon;
revoke select on public.quizzes from anon;
revoke select on public.quiz_questions from anon;

alter table public.course_levels enable row level security;
alter table public.course_readings enable row level security;
alter table public.course_reading_versions enable row level security;
alter table public.assignments enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;

drop policy if exists course_levels_enrolled_guard on public.course_levels;
create policy course_levels_enrolled_guard on public.course_levels
as restrictive for select to authenticated
using (
  exists (
    select 1 from public.enrollments e
    where e.user_id=(select auth.uid())
      and e.course_id=course_levels.course_id
      and e.status in ('active','completed')
  )
  or public.tamp_is_course_instructor(course_levels.course_id)
);

drop policy if exists course_readings_enrolled_guard on public.course_readings;
create policy course_readings_enrolled_guard on public.course_readings
as restrictive for select to authenticated
using (
  exists (
    select 1 from public.enrollments e
    where e.user_id=(select auth.uid())
      and e.course_id=course_readings.course_id
      and e.status in ('active','completed')
  )
  or public.tamp_is_course_instructor(course_readings.course_id)
);

drop policy if exists course_reading_versions_enrolled_guard on public.course_reading_versions;
create policy course_reading_versions_enrolled_guard on public.course_reading_versions
as restrictive for select to authenticated
using (
  exists (
    select 1
    from public.course_readings cr
    where cr.id=course_reading_versions.reading_id
      and (
        exists (
          select 1 from public.enrollments e
          where e.user_id=(select auth.uid())
            and e.course_id=cr.course_id
            and e.status in ('active','completed')
        )
        or public.tamp_is_course_instructor(cr.course_id)
      )
  )
);

drop policy if exists assignments_enrolled_guard on public.assignments;
create policy assignments_enrolled_guard on public.assignments
as restrictive for select to authenticated
using (
  exists (
    select 1 from public.enrollments e
    where e.user_id=(select auth.uid())
      and e.course_id=assignments.course_id
      and e.status in ('active','completed')
  )
  or public.tamp_is_course_instructor(assignments.course_id)
  or (select public.tamp_is_admin())
);

drop policy if exists quizzes_enrolled_guard on public.quizzes;
create policy quizzes_enrolled_guard on public.quizzes
as restrictive for select to authenticated
using (
  exists (
    select 1 from public.enrollments e
    where e.user_id=(select auth.uid())
      and e.course_id=quizzes.course_id
      and e.status in ('active','completed')
  )
  or public.tamp_is_course_instructor(quizzes.course_id)
);

drop policy if exists quiz_questions_enrolled_guard on public.quiz_questions;
create policy quiz_questions_enrolled_guard on public.quiz_questions
as restrictive for select to authenticated
using (
  exists (
    select 1
    from public.quizzes q
    where q.id=quiz_questions.quiz_id
      and (
        exists (
          select 1 from public.enrollments e
          where e.user_id=(select auth.uid())
            and e.course_id=q.course_id
            and e.status in ('active','completed')
        )
        or public.tamp_is_course_instructor(q.course_id)
      )
  )
);

-- The public catalogue continues to use public.courses and public.site_settings.

-- Public student voices must not call the admin-only helper from an anon request.
drop policy if exists student_feedback_public_select on public.student_feedback;
create policy student_feedback_public_select on public.student_feedback
for select to anon,authenticated using (approved=true or student_id=(select auth.uid()));
