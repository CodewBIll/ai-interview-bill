import { createBrowserClient } from "@supabase/ssr";

import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/config";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!browserClient) {
    browserClient = createBrowserClient(
      supabaseUrl,
      supabasePublishableKey
    );
  }

  return browserClient;
}
