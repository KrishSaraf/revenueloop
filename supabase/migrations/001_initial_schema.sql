create extension if not exists "pgcrypto";

create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  category text not null,
  location text not null,
  address text,
  phone text,
  rating numeric(2, 1),
  review_count integer default 0,
  website_status text not null check (website_status in ('no_website', 'weak_website', 'healthy_website')),
  social_presence text[] default '{}',
  opportunity_score integer default 0,
  estimated_deal_value integer default 0,
  status text not null,
  agent_state text not null,
  summary text,
  why_good_prospect text,
  online_booking_value text,
  public_info text[] default '{}',
  inferred_info text[] default '{}',
  approved_for_call boolean default false,
  do_not_contact boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists business_research (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete cascade,
  public_summary text,
  digital_presence_analysis text,
  recommended_sections text[] default '{}',
  evidence text[] default '{}',
  inferred text[] default '{}',
  confidence numeric(3, 2),
  created_at timestamptz default now()
);

create table if not exists opportunity_scores (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete cascade,
  score integer not null,
  factors jsonb not null default '[]',
  explanation text,
  created_at timestamptz default now()
);

create table if not exists generated_websites (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete cascade,
  slug text unique not null,
  seo_title text,
  seo_description text,
  theme jsonb not null default '{}',
  sections jsonb not null default '[]',
  missing_info text[] default '{}',
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists sales_strategies (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete cascade,
  personalized_opening text,
  identified_problem text,
  value_proposition text,
  package_name text,
  proposed_price integer,
  monthly_price integer,
  objection_responses text[] default '{}',
  negotiation_limits text,
  call_objective text,
  conversion_probability numeric(4, 3),
  approval_required boolean default true,
  created_at timestamptz default now()
);

create table if not exists calls (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete cascade,
  status text not null,
  duration_seconds integer default 0,
  sentiment text,
  detected_objections text[] default '{}',
  price_discussed integer,
  next_action text,
  recording_url text,
  outcome text,
  simulation boolean default true,
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists call_transcript_entries (
  id uuid primary key default gen_random_uuid(),
  call_id uuid references calls(id) on delete cascade,
  speaker text not null,
  text text not null,
  sentiment text,
  created_at timestamptz default now()
);

create table if not exists offers (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete cascade,
  package_name text,
  setup_amount integer,
  monthly_amount integer,
  status text not null,
  created_at timestamptz default now()
);

create table if not exists payments (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete cascade,
  offer_id uuid references offers(id) on delete set null,
  amount integer not null,
  currency text not null default 'SGD',
  checkout_url text,
  status text not null,
  provider text not null,
  created_at timestamptz default now(),
  paid_at timestamptz
);

create table if not exists agent_runs (
  id uuid primary key default gen_random_uuid(),
  status text not null,
  current_state text not null,
  mode text not null,
  started_at timestamptz default now(),
  completed_at timestamptz
);

create table if not exists agent_events (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete set null,
  title text not null,
  status text not null,
  previous_state text,
  new_state text not null,
  input_summary text,
  output_summary text,
  estimated_cost numeric(10, 4) default 0,
  error text,
  retry_status text default 'not_needed',
  created_at timestamptz default now()
);

create table if not exists operating_costs (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete set null,
  provider text not null,
  action text not null,
  amount numeric(10, 4) not null,
  created_at timestamptz default now()
);

create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  mode text not null default 'mock',
  calling_start text not null default '10:00',
  calling_end text not null default '18:00',
  timezone text not null default 'Asia/Singapore',
  data_retention_days integer not null default 30,
  require_human_approval boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists do_not_contact_entries (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid references prospects(id) on delete cascade,
  reason text not null,
  created_at timestamptz default now()
);

create index if not exists prospects_status_idx on prospects(status);
create index if not exists agent_events_prospect_id_idx on agent_events(prospect_id);
create index if not exists payments_status_idx on payments(status);
