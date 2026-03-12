import postgres from 'postgres';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required. Set it in .env');
  process.exit(1);
}

const sql = postgres(DATABASE_URL);

// Fixed UUIDs for idempotent seeding
const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const ADMIN_USER_ID = '00000000-0000-0000-0000-000000000010';
const MANAGER_USER_ID = '00000000-0000-0000-0000-000000000011';
const SALES_REP_USER_ID = '00000000-0000-0000-0000-000000000012';
const EVENT_ID = '00000000-0000-0000-0000-000000000020';

async function seed() {
  console.log('Seeding demo data...');

  // Tenant
  await sql`
    INSERT INTO tenants (id, name, slug, plan, default_currency, default_tax_rate)
    VALUES (${TENANT_ID}, 'A-Journal Demo', 'a-journal-demo', 'professional', 'EUR', 2100)
    ON CONFLICT (id) DO NOTHING
  `;
  console.log('  Tenant created');

  // Users (auth_id would normally come from Supabase Auth — use placeholders)
  const usersData = [
    { id: ADMIN_USER_ID, email: 'admin@demo.scanorder.com', name: 'Anna van der Berg', role: 'admin', auth_id: '00000000-0000-0000-0000-aaaaaaaaaaaa' },
    { id: MANAGER_USER_ID, email: 'manager@demo.scanorder.com', name: 'Max de Vries', role: 'manager', auth_id: '00000000-0000-0000-0000-bbbbbbbbbbbb' },
    { id: SALES_REP_USER_ID, email: 'sales@demo.scanorder.com', name: 'Sophie Bakker', role: 'sales_rep', auth_id: '00000000-0000-0000-0000-cccccccccccc' },
  ];
  for (const u of usersData) {
    await sql`
      INSERT INTO users (id, tenant_id, email, full_name, role, auth_id)
      VALUES (${u.id}, ${TENANT_ID}, ${u.email}, ${u.name}, ${u.role}, ${u.auth_id})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log('  Users created');

  // Event
  await sql`
    INSERT INTO events (id, tenant_id, name, location, start_date, end_date, status)
    VALUES (
      ${EVENT_ID}, ${TENANT_ID}, 'Maison&Objet Paris 2026',
      'Paris Nord Villepinte', '2026-09-04', '2026-09-08', 'upcoming'
    )
    ON CONFLICT (id) DO NOTHING
  `;
  console.log('  Event created');

  // Products — A-Journal style stationery
  const productsData = [
    { sku: 'AJ-A5-DOT-SAG', barcode: '8719326523145', name: 'A5 Dotted Notebook - Sage', price: 895, category: 'Notebooks', stock: 142 },
    { sku: 'AJ-A5-DOT-DRO', barcode: '8719326523152', name: 'A5 Dotted Notebook - Dried Rose', price: 895, category: 'Notebooks', stock: 98 },
    { sku: 'AJ-A5-DOT-FOR', barcode: '8719326523169', name: 'A5 Dotted Notebook - Forest', price: 895, category: 'Notebooks', stock: 115 },
    { sku: 'AJ-A5-DOT-MID', barcode: '8719326523176', name: 'A5 Dotted Notebook - Midnight', price: 895, category: 'Notebooks', stock: 203 },
    { sku: 'AJ-A5-LIN-SAG', barcode: '8719326523183', name: 'A5 Lined Notebook - Sage', price: 895, category: 'Notebooks', stock: 87 },
    { sku: 'AJ-A5-LIN-DRO', barcode: '8719326523190', name: 'A5 Lined Notebook - Dried Rose', price: 895, category: 'Notebooks', stock: 64 },
    { sku: 'AJ-B5-WKP-SAG', barcode: '8719326523206', name: 'B5 Weekly Planner - Sage', price: 1250, category: 'Planners', stock: 156 },
    { sku: 'AJ-B5-WKP-DRO', barcode: '8719326523213', name: 'B5 Weekly Planner - Dried Rose', price: 1250, category: 'Planners', stock: 134 },
    { sku: 'AJ-B5-WKP-FOR', barcode: '8719326523220', name: 'B5 Weekly Planner - Forest', price: 1250, category: 'Planners', stock: 89 },
    { sku: 'AJ-A4-DYP-SAG', barcode: '8719326523237', name: 'A4 Daily Planner - Sage', price: 650, category: 'Planners', stock: 245 },
    { sku: 'AJ-A4-DYP-DRO', barcode: '8719326523244', name: 'A4 Daily Planner - Dried Rose', price: 650, category: 'Planners', stock: 198 },
    { sku: 'AJ-A6-PKT-SAG', barcode: '8719326523251', name: 'A6 Pocket Notebook - Sage', price: 595, category: 'Notebooks', stock: 312 },
    { sku: 'AJ-A6-PKT-DRO', barcode: '8719326523268', name: 'A6 Pocket Notebook - Dried Rose', price: 595, category: 'Notebooks', stock: 287 },
    { sku: 'AJ-DSK-PLN-26', barcode: '8719326523275', name: 'Desk Planner 2026', price: 1495, category: 'Planners', stock: 76 },
    { sku: 'AJ-WLL-PLN-26', barcode: '8719326523282', name: 'Wall Planner 2026', price: 995, category: 'Planners', stock: 54 },
    { sku: 'AJ-GFT-SET-01', barcode: '8719326523299', name: 'Gift Set - Notebook + Pen', price: 1895, category: 'Gift Sets', stock: 120 },
    { sku: 'AJ-PEN-BLK-01', barcode: '8719326523305', name: 'Fineliner Pen - Black', price: 395, category: 'Accessories', stock: 450 },
    { sku: 'AJ-PEN-SAG-01', barcode: '8719326523312', name: 'Fineliner Pen - Sage', price: 395, category: 'Accessories', stock: 380 },
    { sku: 'AJ-STK-FLR-01', barcode: '8719326523329', name: 'Sticker Sheet - Florals', price: 295, category: 'Accessories', stock: 520 },
    { sku: 'AJ-STK-ICN-01', barcode: '8719326523336', name: 'Sticker Sheet - Icons', price: 295, category: 'Accessories', stock: 488 },
    { sku: 'AJ-TPE-WSH-01', barcode: '8719326523343', name: 'Washi Tape Set - Sage/Rose', price: 695, category: 'Accessories', stock: 210 },
    { sku: 'AJ-CVR-A5-LTH', barcode: '8719326523350', name: 'A5 Leather Notebook Cover', price: 2495, category: 'Accessories', stock: 45 },
    { sku: 'AJ-MKR-SET-06', barcode: '8719326523367', name: 'Marker Set - 6 Colors', price: 1295, category: 'Accessories', stock: 167 },
    { sku: 'AJ-A5-BLK-PLN', barcode: '8719326523374', name: 'A5 Blank Notebook - Black', price: 895, category: 'Notebooks', stock: 178 },
    { sku: 'AJ-A5-GRD-SAG', barcode: '8719326523381', name: 'A5 Grid Notebook - Sage', price: 895, category: 'Notebooks', stock: 93 },
  ];

  for (const p of productsData) {
    await sql`
      INSERT INTO products (id, tenant_id, sku, barcode, name, base_price, tax_rate, stock_qty, category, is_active)
      VALUES (
        gen_random_uuid(), ${TENANT_ID}, ${p.sku}, ${p.barcode}, ${p.name},
        ${p.price}, 2100, ${p.stock}, ${p.category}, true
      )
      ON CONFLICT DO NOTHING
    `;
  }
  console.log(`  ${productsData.length} products created`);

  // Customers — Dutch B2B companies
  const customersData = [
    { company: 'De Bijenkorf B.V.', contact: 'Anna van der Berg', email: 'inkoop@bijenkorf.nl', phone: '+31 20 621 8080', vat: 'NL001234567B01', group: 'A' },
    { company: 'Dille & Kamille', contact: 'Mark Jansen', email: 'orders@dille-kamille.nl', phone: '+31 30 233 1234', vat: 'NL002345678B01', group: 'B' },
    { company: 'HEMA Inkoop', contact: 'Lisa de Groot', email: 'buying@hema.nl', phone: '+31 20 311 4111', vat: 'NL003456789B01', group: 'A' },
    { company: 'Bruna Wholesale', contact: 'Tom Smit', email: 'wholesale@bruna.nl', phone: '+31 30 280 2800', vat: 'NL004567890B01', group: 'B' },
    { company: 'Bol.com Partners', contact: 'Eva Mulder', email: 'partners@bol.com', phone: '+31 30 310 2000', vat: 'NL005678901B01', group: 'A' },
    { company: 'Aardewerk & Co', contact: 'Pieter Bakker', email: 'info@aardewerk.nl', phone: '+31 10 411 2233', vat: 'NL006789012B01', group: 'C' },
    { company: 'Sissy-Boy', contact: 'Fleur Hendriks', email: 'buying@sissy-boy.nl', phone: '+31 20 626 0098', vat: 'NL007890123B01', group: 'B' },
    { company: 'Arket Netherlands', contact: 'Johan Vermeer', email: 'nl.buying@arket.com', phone: '+31 20 520 8080', vat: 'NL008901234B01', group: 'A' },
    { company: 'Sostrene Grene NL', contact: 'Kirsten Nielsen', email: 'nl@sostrenegrene.com', phone: '+31 20 770 1234', vat: 'NL009012345B01', group: 'C' },
    { company: 'Flying Tiger NL', contact: 'Anders Larsen', email: 'nl.ops@flyingtiger.com', phone: '+31 20 845 5678', vat: 'NL010123456B01', group: 'C' },
  ];

  for (const c of customersData) {
    await sql`
      INSERT INTO customers (id, tenant_id, company_name, contact_name, email, phone, vat_number, price_group, address)
      VALUES (
        gen_random_uuid(), ${TENANT_ID}, ${c.company}, ${c.contact}, ${c.email},
        ${c.phone}, ${c.vat}, ${c.group},
        ${JSON.stringify({ street: 'Voorbeeldstraat 1', city: 'Amsterdam', postal_code: '1012 AB', country: 'NL' })}
      )
      ON CONFLICT DO NOTHING
    `;
  }
  console.log(`  ${customersData.length} customers created`);

  console.log('\nSeed complete!');
  await sql.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
