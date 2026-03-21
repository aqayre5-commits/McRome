// test-rls.mjs
import { createClient } from '@supabase/supabase-js';

// DOUBLE CHECK THESE THREE VALUES
const supabaseUrl = "PASTE_URL_HERE"; // Ensure it starts with https://
const anonKey = "PASTE_ANON_KEY_HERE";
const serviceKey = "PASTE_SERVICE_ROLE_KEY_HERE";

async function runDebug() {
  console.log("--- Connectivity Check ---");
  try {
    const response = await fetch(supabaseUrl);
    console.log(`Connected to Supabase API: ${response.ok ? "✅" : "❌"}`);
  } catch (e) {
    console.error("❌ Network Error: Could not reach the Supabase URL. Check your URL and Internet.");
    return;
  }

  const serviceClient = createClient(supabaseUrl, serviceKey);
  console.log("\n[Test] Attempting Service Role Update...");

  const { data, error, status } = await serviceClient
    .from('roblox_pages')
    .update({ useful_summary: 'DEBUG_TEST_SUCCESS' })
    .not('id', 'is', null)
    .limit(1)
    .select();

  if (error) {
    console.error("❌ Supabase Error:", error.message);
  } else {
    console.log(`✅ Success! Status: ${status}`);
    console.log(`Rows Updated: ${data?.length || 0}`);
  }
}

runDebug();