import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://xxgyhehzbjmhuqpsyhka.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4Z3loZWh6YmptaHVxcHN5aGthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNzExMzEsImV4cCI6MjEwMDc0NzEzMX0.RwiEMtttJsnJpx_KEUpNl70xyepEn1dElQEhH8Cr7X4"
);

async function run() {
  const email = `test_affiliate_${Date.now()}@example.com`;
  const password = "password123";

  try {
    console.log("1. Signing up a new test user:", email);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome: "Test Affiliate", full_name: "Test Affiliate" }
      }
    });

    if (signUpError) {
      console.error("Sign up error:", signUpError);
      return;
    }

    const session = signUpData.session;
    const user = signUpData.user;
    console.log("Sign up success. User ID:", user?.id);

    // If email confirmation is required, session might be null. Let's check.
    if (!session) {
      console.log("Email confirmation is required. Trying to sign in directly (in case auto-confirm is enabled)...");
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        console.error("Sign in failed (confirm email may be required):", signInError.message);
        return;
      }
      console.log("Logged in. User ID:", signInData.user?.id);
    }

    console.log("2. Querying 'afiliados' as the new user...");
    const { data: afiliados, error: afiliadosErr } = await supabase.from('afiliados').select('*');
    console.log("Afiliados query result:", afiliados, "Error:", afiliadosErr);

    console.log("3. Querying 'user_roles' as the new user...");
    const { data: roles, error: rolesErr } = await supabase.from('user_roles').select('*');
    console.log("User roles query result:", roles, "Error:", rolesErr);

    console.log("4. Attempting to insert a lead using the user's ID as afiliado_id...");
    const { data: leadData, error: leadErr } = await supabase.from('leads').insert({
      afiliado_id: user.id,
      nome_responsavel: "Test Client",
      nome_empresa: "Client Company",
      valor_ofertado: 1000,
      status: "novo"
    });
    console.log("Lead insert result:", leadData, "Error:", leadErr);

  } catch (e) {
    console.error("Unexpected error:", e);
  }
}

run();
