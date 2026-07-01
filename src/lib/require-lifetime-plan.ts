import type { NavigateOptions } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

type NavigateFn = (opts: NavigateOptions) => void;

/** Returns false and redirects to /pricing when the user has not paid. */
export async function requireLifetimePlan(userId: string, navigate: NavigateFn): Promise<boolean> {
  const { data } = await supabase.from("profiles").select("plan_status").eq("id", userId).maybeSingle();
  if (data?.plan_status !== "lifetime") {
    navigate({ to: "/pricing", replace: true });
    return false;
  }
  return true;
}
