// debug-supabase.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function runDebug() {
  console.log("--- Starting Supabase RLS Debug ---");

  // 1. Test with ANON KEY (Should fail to update)
  const anonClient = createClient(supabaseUrl!, anonKey!);
  console.log("\nTesting with ANON_KEY...");
  
  const { data: anonData, error: anonError, status: anonStatus } = await anonClient
    .from('roblox_pages')
    .update({ useful_summary: 'Test with Anon' })
    .not('id', 'is', null) // Target any row
    .limit(1)
    .select();

  console.log(`Status: ${anonStatus}`);
  console.log(`Error:`, anonError ? anonError.message : "None (but check if data is empty)");
  console.log(`Rows Updated: ${anonData?.length || 0}`);

  // 2. Test with SERVICE_ROLE_KEY (Should succeed)
  const serviceClient = createClient(supabaseUrl!, serviceKey!);
  console.log("\nTesting with SERVICE_ROLE_KEY...");

  const { data: svcData, error: svcError, status: svcStatus } = await serviceClient
    .from('roblox_pages')
    .update({ useful_summary: 'Test with Service Role' })
    .not('id', 'is', null)
    .limit(1)
    .select();

  console.log(`Status: ${svcStatus}`);
  console.log(`Error:`, svcError ? svcError.message : "None");
  console.log(`Rows Updated: ${svcData?.length || 0}`);
}

runDebug();