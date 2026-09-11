create index if not exists privacy_suppressions_source_request_id_idx
on public.privacy_suppressions (source_request_id)
where source_request_id is not null;
