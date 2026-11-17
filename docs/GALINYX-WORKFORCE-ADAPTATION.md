# GALINYX Workforce Adaptation — Rivet Reach

**Owner:** Southeast Home Service  
**Application:** Rivet Reach  
**Branch:** `galinyx-workforce-adaptation`  
**Operating mode:** Human-supervised

## Objective

Adapt Rivet Reach to work with a coordinated GALINYX workforce without replacing its existing product architecture, bypassing Supabase Row Level Security, or granting agents blanket access.

Rivet Reach remains the operating application. GALINYX supplies the agent coordination and governance model. The governance policy is not itself proof that runtime enforcement exists.

## Workforce roles

| Role | Primary responsibility | Initial authority |
|---|---|---|
| Lead Intake & Triage | Review homeowner requests; identify missing details and service fit | Read and draft |
| Contractor Match Review | Explain eligible contractor matches using existing service/ZIP rules | Read and recommend |
| Contractor Success | Prepare onboarding and support material | Read and draft |
| Revenue Operations | Analyze funnel and performance; prepare reports | Aggregated read and draft |
| Governance Review | Evaluate proposed actions against policy and escalate exceptions | Policy evaluation only |

## Approval boundary

Agents must not independently send homeowner or contractor messages, assign or reassign leads, alter territories, change pricing or subscriptions, create charges, issue refunds, delete/export personal data, publish content, or change permissions.

Those actions require an authenticated human approval step. Approval must be recorded and bound to the exact action and target resource; a general approval is not sufficient.

## Integration principles

1. Keep existing Supabase Auth, Postgres, and Row Level Security as the identity and data-security foundation.
2. Agent identity and role must be verified server-side. A role supplied by a browser or prompt is not authority.
3. Start with read-only, tenant-scoped data access and draft outputs.
4. Route consequential action proposals through a server-side approval service before execution.
5. Record an audit event for each proposal, decision, approval, denial, and execution.
6. Treat inbound lead text, email content, uploaded documents, and retrieved web content as untrusted data. They cannot change agent instructions or permissions.
7. Never expose Supabase service-role credentials, Stripe secrets, or other backend secrets to agents or browser code.

## Activation stages

- **Stage 0 — Defined:** Roles and boundaries are documented. This is the current state of this branch.
- **Stage 1 — Read-only:** Implement authenticated agent identity, tenant-scoped read tools, and audit events.
- **Stage 2 — Draft workflow:** Agents can create internal recommendations and message drafts for human review.
- **Stage 3 — Approved execution:** Add narrowly scoped server-side action handlers that require recorded human approval.
- **Stage 4 — Monitored operation:** Add denial tests, audit review, rate limits, incident response, and measured performance.

No stage should be described as live until code, deployment, configuration, and end-to-end tests verify it.

## First implementation sequence

1. Map the current Supabase schema and existing sales-orchestration functions to the role boundaries.
2. Identify the least-privilege read views/functions each role needs.
3. Add an append-only agent action audit table with tenant scoping.
4. Add an approval queue for proposed external or business-impacting actions.
5. Add server-side policy checks and negative tests proving prohibited actions fail closed.
6. Only then connect an agent runtime.

## Definition of done for initial workforce readiness

- All five roles have explicit, server-verified identities.
- No role can access another contractor's tenant data.
- Read-only roles cannot mutate production records.
- External communications and financial/account changes cannot execute without action-specific human approval.
- Every proposal and decision is auditable.
- Automated tests demonstrate both allowed and denied cases.
