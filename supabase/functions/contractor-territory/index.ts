import { withSupabase } from "npm:@supabase/server@1.7.0";
import zipcodes from "npm:zipcodes-us@1.1.3";
import { z } from "npm:zod@3.24.2";

const RADIUS_OPTIONS = [25, 50, 75, 100, 125, 150] as const;
const SERVICE_TYPES = [
  "Roofing",
  "HVAC",
  "Plumbing",
  "Electrical",
  "Kitchen Remodel",
  "Bathroom Remodel",
  "Windows & Doors",
  "Solar",
] as const;

const bodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("sync"),
    force: z.boolean().optional().default(false),
  }).strict(),
  z.object({
    action: z.literal("update"),
    companyName: z.string().trim().min(2).max(120),
    contactName: z.string().trim().min(2).max(100),
    phone: z.string().trim().min(7).max(20),
    city: z.string().trim().min(2).max(100),
    active: z.boolean(),
    serviceTypes: z.array(z.enum(SERVICE_TYPES)).min(1),
    baseZip: z.string().trim().regex(/^\d{5}$/),
    serviceRadiusMiles: z.number().int().refine(
      (value) => RADIUS_OPTIONS.includes(value as (typeof RADIUS_OPTIONS)[number]),
      "Unsupported service radius",
    ),
  }).strict(),
]);

function coverageFor(baseZip: string, radiusMiles: number) {
  const base = zipcodes.find(baseZip);
  if (!base.isValid) throw new Error("Enter a valid U.S. ZIP code.");

  const nearby = zipcodes.findByRadius(base.latitude, base.longitude, radiusMiles);
  const zips = Array.from(
    new Set([
      baseZip,
      ...nearby
        .map((item) => item.zipCode)
        .filter((zip): zip is string => /^\d{5}$/.test(zip)),
    ]),
  ).sort();

  if (zips.length === 0 || zips.length > 10_000) {
    throw new Error("We could not build a valid ZIP territory for that radius.");
  }

  return {
    zips,
    baseLocation: {
      city: base.city,
      state: base.stateCode,
    },
  };
}

export default {
  fetch: withSupabase({ auth: "user" }, async (request, ctx) => {
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405 });
    }

    try {
      const parsed = bodySchema.safeParse(await request.json());
      if (!parsed.success) {
        return Response.json(
          { error: parsed.error.issues[0]?.message ?? "Check the submitted information." },
          { status: 400 },
        );
      }

      const userId = ctx.userClaims?.id;
      if (!userId) {
        return Response.json({ error: "Sign in required" }, { status: 401 });
      }

      if (parsed.data.action === "sync") {
        const { data: contractor, error: contractorError } = await ctx.supabaseAdmin
          .from("contractors")
          .select("base_zip, service_radius_miles, territory_synced_at")
          .eq("user_id", userId)
          .maybeSingle();

        if (contractorError) throw contractorError;
        if (!contractor) {
          return Response.json({ ok: true, synced: false, reason: "contractor_not_found" });
        }
        if (!contractor.base_zip) {
          return Response.json({ ok: true, synced: false, reason: "base_zip_required" });
        }

        const radius = contractor.service_radius_miles ?? 50;
        if (contractor.territory_synced_at && !parsed.data.force) {
          const { count, error: countError } = await ctx.supabaseAdmin
            .from("contractor_territories")
            .select("*", { count: "exact", head: true })
            .eq("contractor_id", (
              await ctx.supabaseAdmin
                .from("contractors")
                .select("id")
                .eq("user_id", userId)
                .single()
            ).data?.id ?? "");

          if (countError) throw countError;
          return Response.json({
            ok: true,
            synced: false,
            reason: "already_synced",
            coverageCount: count ?? 0,
          });
        }

        const coverage = coverageFor(contractor.base_zip, radius);
        const { data: coverageCount, error: syncError } = await ctx.supabaseAdmin.rpc(
          "sync_contractor_radius_territory",
          {
            p_user_id: userId,
            p_base_zip: contractor.base_zip,
            p_service_radius_miles: radius,
            p_territory_zips: coverage.zips,
          },
        );
        if (syncError) throw syncError;

        return Response.json({
          ok: true,
          synced: true,
          coverageCount,
          baseLocation: coverage.baseLocation,
        });
      }

      const coverage = coverageFor(
        parsed.data.baseZip,
        parsed.data.serviceRadiusMiles,
      );
      const { data: coverageCount, error: updateError } = await ctx.supabaseAdmin.rpc(
        "apply_contractor_radius_profile",
        {
          p_user_id: userId,
          p_company_name: parsed.data.companyName,
          p_contact_name: parsed.data.contactName,
          p_phone: parsed.data.phone,
          p_city: parsed.data.city,
          p_active: parsed.data.active,
          p_service_types: parsed.data.serviceTypes,
          p_base_zip: parsed.data.baseZip,
          p_service_radius_miles: parsed.data.serviceRadiusMiles,
          p_territory_zips: coverage.zips,
        },
      );
      if (updateError) throw updateError;

      return Response.json({
        ok: true,
        synced: true,
        coverageCount,
        baseLocation: coverage.baseLocation,
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : "Contractor territory update failed");
      return Response.json(
        {
          error:
            error instanceof Error
              ? error.message
              : "We could not update this service territory.",
        },
        { status: 500 },
      );
    }
  }),
};
