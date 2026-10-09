
insert into plans(code,name,owner,start_on,due_on) values('P-2026','Kauri Services growth plan','Mara Chen',current_date-90,current_date+90) on conflict(code) do nothing;
insert into objectives(code,title,plan_id,owner,due_on) values
('O-RET','Retain service clients',(select id from plans where code='P-2026'),'Mara Chen',current_date+90),
('O-OPS','Reduce delivery delays',(select id from plans where code='P-2026'),'Noah Patel',current_date+90),
('O-NEW','Improve referral handover',(select id from plans where code='P-2026'),'',current_date+60) on conflict(code) do nothing;
insert into measures(code,name,objective_id,owner,unit,baseline,target,start_on,due_on) values
('M-RET','Client retention',(select id from objectives where code='O-RET'),'Mara Chen','percent',80,95,current_date-90,current_date+90),
('M-DAYS','Delivery lead time',(select id from objectives where code='O-OPS'),'Noah Patel','days',20,10,current_date-90,current_date+90),
('M-REF','Referral handovers',(select id from objectives where code='O-NEW'),'Aroha Williams','count',0,12,current_date-90,current_date+90) on conflict(code) do nothing;
insert into observations(code,measure_id,observed_on,value,evidence,recorded_by) values
('OBS-RET-1',(select id from measures where code='M-RET'),current_date-30,82,'demo://client-review/previous','Mara Chen'),
('OBS-RET-2',(select id from measures where code='M-RET'),current_date-14,84,'demo://client-review/current','Mara Chen'),
('OBS-DAYS-1',(select id from measures where code='M-DAYS'),current_date-10,18,'demo://delivery/previous','Noah Patel'),
('OBS-DAYS-2',(select id from measures where code='M-DAYS'),current_date-1,13,'demo://delivery/current','Noah Patel') on conflict(code) do nothing;
insert into initiatives(code,title,objective_id,owner,due_on,status,budget,spent,evidence) values
('I-CARE','Quarterly client reviews',(select id from objectives where code='O-RET'),'Mara Chen',current_date-4,'active',12000,14500,''),
('I-OPS','Delivery checklist',(select id from objectives where code='O-OPS'),'Noah Patel',current_date+21,'blocked',6000,2000,''),
('I-DATA','Clean service dates',(select id from objectives where code='O-OPS'),'Noah Patel',current_date-2,'active',2500,1200,''),
('I-IDEA','New event experiment',null,'Aroha Williams',current_date+30,'planned',3000,500,'') on conflict(code) do nothing;
insert into dependencies(code,initiative_id,requires_id) values('DEP-1',(select id from initiatives where code='I-OPS'),(select id from initiatives where code='I-DATA')) on conflict(code) do nothing;
insert into decisions(code,title,objective_id,owner,due_on,status,rationale,evidence,personal_data,retention_due) values
('D-CARE','Approve client review format',(select id from objectives where code='O-RET'),'Mara Chen',current_date-3,'proposed','','',false,null),
('D-STAFF','Review service feedback',(select id from objectives where code='O-OPS'),'Noah Patel',current_date-10,'approved','Use aggregated service feedback','demo://minutes/14',true,current_date-1) on conflict(code) do nothing;
insert into actions(code,title,decision_id,owner,due_on) values('A-1','Remove names from strategy summary',(select id from decisions where code='D-STAFF'),'Noah Patel',current_date-2) on conflict(code) do nothing;
