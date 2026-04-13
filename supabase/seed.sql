-- CSA Efficiency Dashboard — seed data
-- 14 use cases from AI Automation Backlog + tasks for the 2 active projects

-- ─── Use Cases ───────────────────────────────────────────────────────────────

insert into use_cases (id, name, problem, solution, priority, status, hours_per_week, hours_per_quarter, build_hours, roi, confidence, type, display_order) values

('11111111-0000-0000-0000-000000000001',
 'Ops Internal Form Preparation Tool',
 'Savvy Dash has limited support for multiple types of forms which leads to many CSAs manually downloading forms, while pulling up the Dash and copying over that information.',
 'Lightweight internal tool which can read the form, parse it, and automatically pull in as much information as possible from the CRM.',
 'P0', 'Complete', 10, 120, 50, 2.0, 'Medium', 'Both', 1),

('11111111-0000-0000-0000-000000000002',
 'Ops Tasking Prioritization Tool',
 'CSAs have to deal with tons of emails, slacks, and the lack of shared visibility often leads to context switching between tons of different platforms. 3 main problems: Lost Notifications, Lack of Prioritization, Automated Tasks.',
 'Custom build which allows for all Slack and email communications to be linked directly to the advisor/ticket, plus automated followups and AI prioritization layer.',
 'P0', 'In Progress', 5, 60, 50, 1.2, 'High', 'Both', 2),

('11111111-0000-0000-0000-000000000003',
 'AI Agent for Message-to-Task Auto-Creation',
 'CSAs receive many tasks via Slack messages that require manual ticket creation, leading to lost requests and extra overhead.',
 'AI agent that monitors Slack channels and automatically creates tasks from messages, reducing manual overhead.',
 'P0', 'Not Started', 0.5, 6, 30, 0.2, 'High', 'Both', 3),

('11111111-0000-0000-0000-000000000004',
 'AI Agent for Money Movement Tasks',
 'Money movement tasks (wires, ACH, transfers) require manual processing with sensitive same-day cut-off times.',
 'AI agent that automates money movement task creation and alerting, with awareness of custodian cut-off times.',
 'P1', 'Blocked', 0.5, 6, 35, 0.17, 'High', 'Both', 4),

('11111111-0000-0000-0000-000000000005',
 'Fidelity DAO / IAA to Dash Auto-Sync',
 'CSAs manually pull Fidelity DAO/IAA documents and enter data into Dash, taking ~10 min per CSA per week.',
 'Automated sync that reads Fidelity documents (with 2FA support) and pushes data directly into Dash.',
 'P1', 'Not Started', 0.2, 2.4, 20, 0.12, 'Medium', 'Both', 5),

('11111111-0000-0000-0000-000000000006',
 'AI Agent for Daily Channel Digest',
 'CSAs spend 30–45 min per day reviewing Slack channels for relevant updates and action items.',
 'AI agent that generates a daily digest of key Slack activity, surfacing action items and important updates.',
 'P1', 'Not Started', 0.3, 3.6, 8, 0.45, 'High', 'Both', 6),

('11111111-0000-0000-0000-000000000007',
 'Post-Signing Spreadsheet Auto-Update',
 'After a DocuSign is completed, CSAs manually update tracking spreadsheets — 5–10 min per signed client.',
 'DocuSign webhook triggers automatic spreadsheet updates on signing completion.',
 'P1', 'Not Started', 0.5, 6, 20, 0.3, 'Medium', 'Steady State', 7),

('11111111-0000-0000-0000-000000000008',
 'Schwab Alert Status',
 'CSAs manually check Schwab alert statuses, adding ~1 min of context switching per task.',
 'Automated Schwab alert status display within the unified hub, eliminating manual lookups.',
 'P2', 'Blocked', 0.2, 2.4, 10, 0.24, 'Medium', 'Both', 8),

('11111111-0000-0000-0000-000000000009',
 'Weekend Auto-Reply Bot',
 'Advisors send messages on weekends expecting replies, not knowing CSAs are off. ~5–10 min of boundary management per CSA per week.',
 'Automated weekend auto-reply bot that sets advisor expectations and optionally surfaces CSA availability calendars.',
 'P2', 'Blocked', 0.08, 0.96, 8, 0.12, 'Medium', 'Both', 9),

('11111111-0000-0000-0000-000000000010',
 'Transfer ETA Notification',
 'Clients and advisors repeatedly ask for transfer ETAs, requiring CSAs to manually check and communicate status (~30 min avg per query).',
 'Automated transfer ETA notifications sent to advisors/clients, with links back to the task for manual updates when needed.',
 'P2', 'Blocked', 0.5, 6, 25, 0.24, 'Medium', 'Both', 10),

('11111111-0000-0000-0000-000000000011',
 'Fee Schedules for Orion Manual Entry',
 'Fee schedule entry into Orion is entirely manual — ~25 min per task, with significant volume during repapering.',
 'Automated fee schedule population using Orion API write access, pulling data from Dash.',
 'P2', 'Blocked', 2.5, 30, 50, 0.6, 'Low', 'Both', 11),

('11111111-0000-0000-0000-000000000012',
 'Voided Check / Bank Statement Auto-Reader',
 'CSAs manually read voided checks and bank statements to fill MoneyLink forms — daily task, 1–3 day back-and-forth loops.',
 'AI document reader that parses voided checks and bank statements to auto-fill MoneyLink form fields.',
 'P2', 'Not Started', 0.2, 2.4, 20, 0.12, 'Medium', 'Both', 12),

('11111111-0000-0000-0000-000000000013',
 'Financial Planning Agreement Self-Serve',
 'FPA setup requires CSA coordination — ~15–20 min per agreement with lots of back-and-forth.',
 'Self-serve DocuSign template for FPAs built into Dash, with automatic advisor and billing alerts on signing.',
 'P2', 'Not Started', 0.25, 3, 40, 0.075, 'Medium', 'Both', 13),

('11111111-0000-0000-0000-000000000014',
 'CSA Knowledge Store Chatbot',
 'Newer CSAs ask ~4 huddles per day worth of questions that experienced CSAs must answer, consuming ~1 hr/week.',
 'AI chatbot trained on internal CSA knowledge, custodian policies, and documented procedures to answer common questions.',
 'P2', 'Blocked', 1.0, 12, 30, 0.4, 'High', 'Both', 14);


-- ─── Tasks: Ops Form Prep Tool (all 100% complete) ─────────────────────────

insert into tasks (use_case_id, name, percent_complete, is_complete, category, start_date, end_date) values

('11111111-0000-0000-0000-000000000001', 'Collect full form inventory from CSAs', 100, true, 'Discovery', '2026-03-25', '2026-03-25'),
('11111111-0000-0000-0000-000000000001', 'Define CRM fields needed and API shape', 100, true, 'Discovery', '2026-03-25', '2026-03-25'),
('11111111-0000-0000-0000-000000000001', 'Set up FastAPI backend', 100, true, 'Backend Setup', '2026-03-25', '2026-03-25'),
('11111111-0000-0000-0000-000000000001', 'Build data schema for fields, mappings, and match results', 100, true, 'Backend', '2026-03-25', '2026-03-25'),
('11111111-0000-0000-0000-000000000001', 'Build PDF field extraction pipeline (AcroForm parser)', 100, true, 'Core Extraction', '2026-03-25', '2026-03-26'),
('11111111-0000-0000-0000-000000000001', 'Build CRM data fetch by account number', 100, true, 'Backend', '2026-03-25', '2026-03-26'),
('11111111-0000-0000-0000-000000000001', 'Set up rule-based alias matching system', 100, true, 'Matching Logic', '2026-03-25', '2026-03-27'),
('11111111-0000-0000-0000-000000000001', 'Integrate Claude/Bedrock for semantic field matching', 100, true, 'Matching Logic', '2026-03-25', '2026-03-27'),
('11111111-0000-0000-0000-000000000001', 'Build confidence scoring and color overlays', 100, true, 'Frontend', '2026-03-26', '2026-03-27'),
('11111111-0000-0000-0000-000000000001', 'Convert extracted fields to editable UI inputs', 100, true, 'Frontend', '2026-03-26', '2026-03-27'),
('11111111-0000-0000-0000-000000000001', 'Wire CRM query to auto-populate matched fields on load', 100, true, 'Integration', '2026-03-27', '2026-03-28'),
('11111111-0000-0000-0000-000000000001', 'Build PDF download with fills applied', 100, true, 'Integration', '2026-03-27', '2026-03-28'),
('11111111-0000-0000-0000-000000000001', 'Build vanilla JS frontend', 100, true, 'Frontend Setup', '2026-03-25', '2026-03-28'),
('11111111-0000-0000-0000-000000000001', 'Add multi-delete for uploaded files', 100, true, 'Frontend', '2026-03-28', '2026-03-28'),
('11111111-0000-0000-0000-000000000001', 'Deploy to Vercel', 100, true, 'Deployment', '2026-03-28', '2026-03-28'),
('11111111-0000-0000-0000-000000000001', 'Set up login allow-list', 100, true, 'Security', '2026-03-28', '2026-03-29'),
('11111111-0000-0000-0000-000000000001', 'Add static firm/advisor fills', 100, true, 'Backend', '2026-03-25', '2026-03-26'),
('11111111-0000-0000-0000-000000000001', 'Build section detection logic', 100, true, 'Core Extraction', '2026-03-26', '2026-03-28'),
('11111111-0000-0000-0000-000000000001', 'Build skip logic for sensitive fields', 100, true, 'Security', '2026-03-27', '2026-03-29'),
('11111111-0000-0000-0000-000000000001', 'Fix Fidelity encrypted PDF support', 100, true, 'Extraction Refinement', '2026-03-29', '2026-03-29'),
('11111111-0000-0000-0000-000000000001', 'Add Schwab XFA format support', 100, true, 'Extraction Refinement', '2026-03-28', '2026-03-30'),
('11111111-0000-0000-0000-000000000001', 'Map Schwab Individual & Joint form', 100, true, 'Form Mapping', '2026-03-28', '2026-03-29'),
('11111111-0000-0000-0000-000000000001', 'Map Schwab Inherited IRA form', 100, true, 'Form Mapping', '2026-03-29', '2026-03-29');


-- ─── Tasks: Ops Prioritization Tool (mixed %) ──────────────────────────────

insert into tasks (use_case_id, name, percent_complete, is_complete, category, start_date, end_date) values

('11111111-0000-0000-0000-000000000002', 'Flask backend + PostgreSQL connection', 100, true, 'Backend / Infra', '2026-03-29', null),
('11111111-0000-0000-0000-000000000002', 'Task queue API — filter by CSA', 100, true, 'Backend / Infra', '2026-03-30', null),
('11111111-0000-0000-0000-000000000002', 'CSA filter endpoint', 100, true, 'Backend / Infra', '2026-03-30', null),
('11111111-0000-0000-0000-000000000002', 'Static frontend (index.html)', 100, true, 'Frontend / UI', '2026-03-30', null),
('11111111-0000-0000-0000-000000000002', 'Gmail API — email fetch from client-service inbox', 30, false, 'Gmail Integration', '2026-04-02', null),
('11111111-0000-0000-0000-000000000002', 'Task queue view with priority indicators (AI + Rule Based)', 0, false, 'Gmail Integration', '2026-04-08', null),
('11111111-0000-0000-0000-000000000002', 'Advisor log panel for communications', 0, false, 'Frontend / UI', '2026-04-10', '2026-04-11'),
('11111111-0000-0000-0000-000000000002', 'Manual priority override', 0, false, 'Frontend / UI', '2026-04-12', '2026-04-13'),
('11111111-0000-0000-0000-000000000002', 'Stuck flag on tasks with no activity 48+ hrs', 0, false, 'Frontend / UI', '2026-04-14', '2026-04-17'),
('11111111-0000-0000-0000-000000000002', 'DocuSign webhook endpoint → write envelope status events to Supabase', 0, false, 'DocuSign Integration', '2026-04-16', '2026-04-21'),
('11111111-0000-0000-0000-000000000002', 'Display DocuSign envelope history in advisor log', 0, false, 'DocuSign Integration', '2026-04-18', '2026-04-25'),
('11111111-0000-0000-0000-000000000002', 'Supabase schema', 0, false, 'Backend / Infra', '2026-04-20', '2026-04-29'),
('11111111-0000-0000-0000-000000000002', 'Dash GraphQL read-only connection — advisor metadata', 0, false, 'Backend / Infra', '2026-04-22', '2026-05-03'),
('11111111-0000-0000-0000-000000000002', 'Claude prioritization — every 30 min per CSA', 0, false, 'AI Prioritization', '2026-04-24', '2026-05-07'),
('11111111-0000-0000-0000-000000000002', 'Stuck task detection (48+ hrs) + suggested action', 0, false, 'AI Prioritization', '2026-04-26', '2026-05-11'),
('11111111-0000-0000-0000-000000000002', 'Email entity resolution — map sender → advisor record in Dash', 0, false, 'Gmail Integration', '2026-04-28', '2026-05-15'),
('11111111-0000-0000-0000-000000000002', 'Attach matched emails to open task', 0, false, 'Gmail Integration', '2026-04-30', '2026-05-19'),
('11111111-0000-0000-0000-000000000002', 'Slack bot with channels:history across advisor-facing channels', 0, false, 'Slack Integration', '2026-05-02', '2026-05-23'),
('11111111-0000-0000-0000-000000000002', 'Slack 30-min polling → entity resolution → attach to open task', 0, false, 'Slack Integration', '2026-05-04', '2026-05-27');
