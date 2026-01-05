-- Create project_files table
create table public.project_files (
  id uuid not null default extensions.uuid_generate_v4(),
  project_id uuid not null,
  name text not null,
  file_path text not null,
  file_type text null,
  file_size bigint null,
  category text null, -- Requirements, Design, Technical, Meetings, etc.
  folder text null,
  uploaded_by uuid null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint project_files_pkey primary key (id),
  constraint project_files_project_id_fkey foreign key (project_id) references projects(id) on delete cascade,
  constraint project_files_uploaded_by_fkey foreign key (uploaded_by) references auth.users(id) on delete set null
) tablespace pg_default;

-- Create index for faster queries
create index if not exists idx_project_files_project_id on public.project_files using btree (project_id) tablespace pg_default;
create index if not exists idx_project_files_uploaded_by on public.project_files using btree (uploaded_by) tablespace pg_default;
create index if not exists idx_project_files_category on public.project_files using btree (category) tablespace pg_default;

-- Enable RLS
alter table project_files enable row level security;

-- RLS Policies
create policy "Users can view project files they have access to"
  on project_files for select
  using (auth.uid() is not null);

create policy "Users can upload files to projects"
  on project_files for insert
  with check (auth.uid() is not null and uploaded_by = auth.uid());

create policy "Users can update their own uploaded files"
  on project_files for update
  using (auth.uid() = uploaded_by);

create policy "Users can delete their own uploaded files"
  on project_files for delete
  using (auth.uid() = uploaded_by);

-- Add trigger for updated_at
create trigger update_project_files_updated_at
  before update on project_files
  for each row
  execute function update_updated_at_column();

-- Add storage bucket for project files (if not exists)
insert into storage.buckets (id, name, public)
values ('project-files', 'project-files', false)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can view project files"
  on storage.objects for select
  using (bucket_id = 'project-files' and auth.uid() is not null);

create policy "Users can upload project files"
  on storage.objects for insert
  with check (bucket_id = 'project-files' and auth.uid() is not null);

create policy "Users can update their own files"
  on storage.objects for update
  using (bucket_id = 'project-files' and auth.uid() = owner);

create policy "Users can delete their own files"
  on storage.objects for delete
  using (bucket_id = 'project-files' and auth.uid() = owner);
