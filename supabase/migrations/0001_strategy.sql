create function touch_updated_at() returns trigger language plpgsql as $$ begin NEW.updated_at=now(); return NEW; end $$;
create table plans (id uuid primary key default gen_random_uuid(), code text not null unique check(length(trim(code))>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), name text not null, owner text not null, start_on date not null, due_on date not null, check(due_on>=start_on));
create unique index plans_code_ci on plans(lower(code));
create trigger plans_updated before update on plans for each row execute function touch_updated_at();
alter table plans enable row level security;
revoke all on plans from public;
create table objectives (id uuid primary key default gen_random_uuid(), code text not null unique check(length(trim(code))>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), title text not null, plan_id uuid not null references plans(id), owner text not null, due_on date not null, status text not null default 'active' check(status in ('active','completed','paused')));
create unique index objectives_code_ci on objectives(lower(code));
create trigger objectives_updated before update on objectives for each row execute function touch_updated_at();
alter table objectives enable row level security;
revoke all on objectives from public;
create table measures (id uuid primary key default gen_random_uuid(), code text not null unique check(length(trim(code))>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), name text not null, objective_id uuid not null references objectives(id), owner text not null, unit text not null, baseline numeric not null, target numeric not null, start_on date not null, due_on date not null, cadence_days integer not null default 7 check(cadence_days>0), check(target<>baseline), check(due_on>start_on));
create unique index measures_code_ci on measures(lower(code));
create trigger measures_updated before update on measures for each row execute function touch_updated_at();
alter table measures enable row level security;
revoke all on measures from public;
create table observations (id uuid primary key default gen_random_uuid(), code text not null unique check(length(trim(code))>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), measure_id uuid not null references measures(id), observed_on date not null check(observed_on<=current_date), value numeric not null, evidence text not null check(length(trim(evidence))>0), recorded_by text not null check(length(trim(recorded_by))>0), unique(measure_id,observed_on));
create unique index observations_code_ci on observations(lower(code));
create trigger observations_updated before update on observations for each row execute function touch_updated_at();
alter table observations enable row level security;
revoke all on observations from public;
create table initiatives (id uuid primary key default gen_random_uuid(), code text not null unique check(length(trim(code))>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), title text not null, objective_id uuid references objectives(id), owner text not null, due_on date not null, status text not null default 'planned' check(status in ('planned','active','blocked','completed','cancelled')), budget numeric not null default 0 check(budget>=0), spent numeric not null default 0 check(spent>=0), currency text not null default 'NZD' check(currency in ('NZD','AUD','USD','GBP','EUR')), evidence text not null default '', check(status<>'completed' or length(trim(evidence))>0));
create unique index initiatives_code_ci on initiatives(lower(code));
create trigger initiatives_updated before update on initiatives for each row execute function touch_updated_at();
alter table initiatives enable row level security;
revoke all on initiatives from public;
create table dependencies (id uuid primary key default gen_random_uuid(), code text not null unique check(length(trim(code))>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), initiative_id uuid not null references initiatives(id), requires_id uuid not null references initiatives(id), check(initiative_id<>requires_id), unique(initiative_id,requires_id));
create unique index dependencies_code_ci on dependencies(lower(code));
create trigger dependencies_updated before update on dependencies for each row execute function touch_updated_at();
alter table dependencies enable row level security;
revoke all on dependencies from public;
create table decisions (id uuid primary key default gen_random_uuid(), code text not null unique check(length(trim(code))>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), title text not null, objective_id uuid not null references objectives(id), owner text not null, due_on date not null, status text not null default 'proposed' check(status in ('proposed','approved','rejected')), rationale text not null default '', evidence text not null default '', personal_data boolean not null default false, retention_due date, check(status='proposed' or (length(trim(rationale))>0 and length(trim(evidence))>0)));
create unique index decisions_code_ci on decisions(lower(code));
create trigger decisions_updated before update on decisions for each row execute function touch_updated_at();
alter table decisions enable row level security;
revoke all on decisions from public;
create table actions (id uuid primary key default gen_random_uuid(), code text not null unique check(length(trim(code))>0), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), title text not null, decision_id uuid not null references decisions(id), owner text not null, due_on date not null, status text not null default 'open' check(status in ('open','completed')), completed_on date check(completed_on<=current_date), evidence text not null default '', check((status='completed' and completed_on is not null and length(trim(evidence))>0) or (status='open' and completed_on is null)));
create unique index actions_code_ci on actions(lower(code));
create trigger actions_updated before update on actions for each row execute function touch_updated_at();
alter table actions enable row level security;
revoke all on actions from public;

create table activity(id uuid primary key default gen_random_uuid(),kind text not null,record_id uuid not null,actor text not null check(length(trim(actor))>0),action text not null,details jsonb not null,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
alter table activity enable row level security; revoke all on activity from public;
create trigger activity_updated before update on activity for each row execute function touch_updated_at();
create function prevent_dependency_cycle() returns trigger language plpgsql as $$
begin
 if exists(with recursive chain(id) as (
 select NEW.requires_id union select d.requires_id from dependencies d join chain c on d.initiative_id=c.id where d.id<>NEW.id
 ) select 1 from chain where id=NEW.initiative_id) then raise exception 'Dependency cycle rejected'; end if;
 return NEW;
end $$;
create trigger dependencies_cycle before insert or update on dependencies for each row execute function prevent_dependency_cycle();
create view strategy_scorecard as
select m.code,m.name,o.code as objective,m.owner,m.unit,m.baseline,m.target,x.value as actual,x.observed_on,m.due_on,m.cadence_days,
 round(100*(x.value-m.baseline)/(m.target-m.baseline),1) as progress_pct,
 round(100*greatest(0,least(1,(current_date-m.start_on)::numeric/(m.due_on-m.start_on))),1) as expected_pct,
 case when x.id is null then 'missing' when x.observed_on<current_date-m.cadence_days then 'stale' when (x.value-m.baseline)/(m.target-m.baseline)>=1 then 'achieved' when (x.value-m.baseline)/(m.target-m.baseline)<greatest(0,least(1,(current_date-m.start_on)::numeric/(m.due_on-m.start_on))) then 'behind' else 'on track' end as health
from measures m join objectives o on o.id=m.objective_id
left join lateral(select * from observations x where x.measure_id=m.id order by x.observed_on desc limit 1)x on true;
create view strategy_dependencies as
select d.code,i.code as initiative,i.title,i.owner,r.code as requires,r.title as waiting_for,r.status as prerequisite_status,r.due_on as prerequisite_due
from dependencies d join initiatives i on i.id=d.initiative_id join initiatives r on r.id=d.requires_id
where i.status not in ('completed','cancelled') and r.status<>'completed';
create view strategy_portfolio as
select i.code,i.title,coalesce(o.code,'UNALIGNED') as objective,i.owner,i.status,i.due_on,i.currency,i.budget,i.spent,i.spent-i.budget as variance,
(select count(*) from strategy_dependencies d where d.initiative=i.code) as blockers
from initiatives i left join objectives o on o.id=i.objective_id;
create view strategy_findings as
select 'MEASURE-STALE'::text as rule,code,owner,due_on,'Measure is '||health as finding from strategy_scorecard where health in ('missing','stale')
union all select 'INITIATIVE-DUE',code,owner,due_on,'Initiative is overdue' from initiatives where due_on<current_date and status not in ('completed','cancelled')
union all select 'INITIATIVE-ALIGNMENT',code,owner,due_on,'No objective assigned' from initiatives where objective_id is null and status not in ('completed','cancelled')
union all select 'INITIATIVE-BUDGET',code,owner,due_on,'Recorded spend exceeds approved budget' from initiatives where spent>budget and status<>'cancelled'
union all select 'DECISION-DUE',code,owner,due_on,'Decision awaits approval or rejection' from decisions where status='proposed' and due_on<current_date
union all select 'ACTION-DUE',code,owner,due_on,'Decision action is overdue' from actions where status='open' and due_on<current_date
union all select 'PRIVACY-REVIEW',code,owner,retention_due,'Personal information needs a retention-purpose review' from decisions where personal_data and (retention_due is null or retention_due<current_date)
union all select 'DEPENDENCY-BLOCKED',code,owner,prerequisite_due,'Waiting for '||requires from strategy_dependencies
union all select 'OWNER-MISSING',code,owner,due_on,'Assign an accountable owner' from objectives where length(trim(owner))=0;
revoke all on strategy_scorecard,strategy_dependencies,strategy_portfolio,strategy_findings from public;
