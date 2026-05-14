-- Keep only the latest record per event before adding the constraint
delete from pdf_exports
where id not in (
  select distinct on (event_id) id
  from pdf_exports
  order by event_id, generated_at desc
);

alter table pdf_exports
  add constraint pdf_exports_event_id_key unique (event_id);
