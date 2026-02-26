#!/usr/bin/env node
// scripts/appwrite-init-keno.mjs
// ─────────────────────────────────────────────────────────────────────────────
//  Creates ALL 7 collections for Keno Deluxe (idempotent — safe to re-run).
//
//  Order:
//    1. roles              ← auth / permissions structure
//    2. permissions        ←
//    3. role_permissions
//    4. staff              ← staff users (cashiers, admins)
//    5. venues             ← points of sale (taquillas)
//    6. rounds             ← each executed draw
//    7. tickets            ← bets (venue + online)
//    8. ticket_events      ← immutable audit log
//
//  Run:
//    node scripts/appwrite-init-keno.mjs
//
//  Required env vars (.env.local or shell):
//    APPWRITE_ENDPOINT       https://cloud.appwrite.io/v1
//    APPWRITE_PROJECT_ID     your project id
//    APPWRITE_API_KEY        server key with databases.* scope
//    APPWRITE_DATABASE_ID    existing database id (e.g. "main")
// ─────────────────────────────────────────────────────────────────────────────

import { Client, Databases, ID, Permission, Role } from 'node-appwrite';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Load .env.local ────────────────────────────────────────
const __dir = dirname(fileURLToPath(import.meta.url));
try {
  const raw = readFileSync(resolve(__dir, '../.env.local'), 'utf8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch { /* .env.local optional */ }

const {
  NEXT_PUBLIC_APPWRITE_ENDPOINT: APPWRITE_ENDPOINT = 'https://cloud.appwrite.io/v1',
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: APPWRITE_PROJECT_ID,
  APPWRITE_API_KEY,
  NEXT_PUBLIC_APPWRITE_DATABASE_ID: APPWRITE_DATABASE_ID,
} = process.env;

if (!APPWRITE_PROJECT_ID || !APPWRITE_API_KEY || !APPWRITE_DATABASE_ID) {
  console.error(`
❌  Missing required environment variables:
    NEXT_PUBLIC_APPWRITE_PROJECT_ID  = ${APPWRITE_PROJECT_ID ?? 'NOT SET'}
    APPWRITE_API_KEY                 = ${APPWRITE_API_KEY ? '***' : 'NOT SET'}
    NEXT_PUBLIC_APPWRITE_DATABASE_ID = ${APPWRITE_DATABASE_ID ?? 'NOT SET'}
`);
  process.exit(1);
}

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const db = new Databases(client);

// ─────────────────────────────────────────────────────────────────────────────
// COLLECTION SCHEMA  (7 collections, in dependency order)
// ─────────────────────────────────────────────────────────────────────────────

const COLLECTIONS = [

  // ══════════════════════════════════════════════════════════
  // 1. roles
  //    Defines what a user type can do in the system.
  //    isSystem = true means the role ships with the product
  //    and cannot be edited or deleted from the UI.
  // ══════════════════════════════════════════════════════════
  {
    id: 'roles',
    name: 'Roles',
    attrs: [
      { fn: 'string', key: 'name', required: true, size: 100 },
      { fn: 'string', key: 'description', required: false, size: 500 },
      { fn: 'boolean', key: 'isSystem', required: false, dflt: false },
    ],
    indexes: [
      { key: 'uidx_name', type: 'unique', attrs: ['name'] },
      { key: 'idx_isSystem', type: 'key', attrs: ['isSystem'] },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 2. permissions
  //    Atomic capability tokens grouped by domain.
  //    e.g. group="CONFIG"  id="config.edit"
  //         group="USERS"   id="users.delete"
  //         group="BILLING" id="billing.view"
  //         group="KENO"    id="keno.tickets.void"
  // ══════════════════════════════════════════════════════════
  {
    id: 'permissions',
    name: 'Permissions',
    attrs: [
      { fn: 'string', key: 'group', required: true, size: 50 },
      { fn: 'string', key: 'description', required: false, size: 500 },
    ],
    indexes: [
      { key: 'idx_group', type: 'key', attrs: ['group'] },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 3. role_permissions
  //    Many-to-many join: which permissions belong to each role.
  //    roleId       → roles.id
  //    permissionId → permissions.id
  // ══════════════════════════════════════════════════════════
  {
    id: 'role_permissions',
    name: 'Role Permissions',
    attrs: [
      { fn: 'string', key: 'roleId', required: true, size: 36 },
      { fn: 'string', key: 'permissionId', required: true, size: 100 },
    ],
    indexes: [
      // Unique pair prevents duplicate assignments
      { key: 'uidx_role_perm', type: 'unique', attrs: ['roleId', 'permissionId'] },
      { key: 'idx_roleId', type: 'key', attrs: ['roleId'] },
      { key: 'idx_permissionId', type: 'key', attrs: ['permissionId'] },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 4. staff
  //    One record per system user (linked to Appwrite Auth).
  //    userId  → Appwrite Auth $id
  //    role    → matches roles.id  (e.g. "admin", "vendor")
  //    status  → active | inactive | suspended
  // ══════════════════════════════════════════════════════════
  {
    id: 'staff',
    name: 'Staff',
    attrs: [
      // Appwrite Auth $id — links this record to the auth user
      { fn: 'string', key: 'userId', required: true, size: 36 },
      { fn: 'string', key: 'fullName', required: true, size: 150 },
      // status: active | inactive | suspended
      { fn: 'enum', key: 'status', required: false, elements: ['active', 'inactive', 'suspended'], dflt: 'active' },
      { fn: 'string', key: 'email', required: true, size: 255 },
      { fn: 'string', key: 'phone', required: false, size: 30 },
    ],
    indexes: [
      { key: 'uidx_userId', type: 'unique', attrs: ['userId'] },
      { key: 'idx_status', type: 'key', attrs: ['status'] },
      { key: 'idx_email', type: 'key', attrs: ['email'] },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 5. venues  (taquillas / points of sale)
  //    A venue is a physical location, separate from the vendor
  //    user so that one venue can have rotating staff / shifts.
  // ══════════════════════════════════════════════════════════
  {
    id: 'venues',
    name: 'Venues',
    attrs: [
      { fn: 'string', key: 'name', required: true, size: 100 },
      { fn: 'string', key: 'code', required: true, size: 20 }, // VEN-001
      { fn: 'boolean', key: 'isActive', required: false, dflt: true },
      // vendorIds: Appwrite Auth $ids of cashiers authorised at this venue
      { fn: 'string', key: 'vendorIds', required: false, size: 36, array: true },
      // commissionPct: % the venue earns on each winning payout (e.g. 5.0 = 5 %)
      { fn: 'float', key: 'commissionPct', required: false, min: 0, max: 100, dflt: 0 },
      { fn: 'string', key: 'address', required: false, size: 255 },
      { fn: 'string', key: 'phone', required: false, size: 30 },
      { fn: 'string', key: 'notes', required: false, size: 500 },
    ],
    indexes: [
      { key: 'uidx_code', type: 'unique', attrs: ['code'] },
      { key: 'idx_isActive', type: 'key', attrs: ['isActive'] },
      { key: 'idx_vendorIds', type: 'key', attrs: ['vendorIds'] },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 5. rounds  (each executed draw / sorteo)
  // ══════════════════════════════════════════════════════════
  {
    id: 'rounds',
    name: 'Rounds',
    attrs: [
      { fn: 'integer', key: 'roundNumber', required: true, min: 1 },
      { fn: 'datetime', key: 'scheduledAt', required: true },
      { fn: 'datetime', key: 'drawnAt', required: false },
      // numbers: the 20 winning numbers (1-80), empty until the draw runs
      { fn: 'integer', key: 'numbers', required: false, min: 1, max: 80, array: true },
      // ballDelayMs: animation speed pushed to all clients for this round
      { fn: 'integer', key: 'ballDelayMs', required: false, min: 100, max: 2000, dflt: 340 },
      // status: scheduled | drawing | completed | cancelled
      { fn: 'string', key: 'status', required: false, size: 20, dflt: 'scheduled' },
      { fn: 'datetime', key: 'nextRoundAt', required: false },
      // Denormalized totals — updated when the round closes (fast dashboard queries)
      { fn: 'integer', key: 'totalTickets', required: false, min: 0, dflt: 0 },
      { fn: 'integer', key: 'totalPayout', required: false, min: 0, dflt: 0 }, // cents
    ],
    indexes: [
      { key: 'uidx_roundNumber', type: 'unique', attrs: ['roundNumber'] },
      { key: 'idx_status', type: 'key', attrs: ['status'] },
      { key: 'idx_scheduledAt', type: 'key', attrs: ['scheduledAt'] },
      { key: 'idx_status_sch', type: 'key', attrs: ['status', 'scheduledAt'] },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 6. tickets  (bets — venue and online channels)
  //
  //  Venue sale (cashier):  venueId ✅  vendorUserId ✅  playerUserId ❌/✅
  //  Online (player app):   venueId ❌  vendorUserId ❌  playerUserId ✅
  //  Venue + player acct:   venueId ✅  vendorUserId ✅  playerUserId ✅
  // ══════════════════════════════════════════════════════════
  {
    id: 'tickets',
    name: 'Tickets',
    attrs: [
      // Human-readable id printed on the physical ticket (TKT-2026-00042)
      { fn: 'string', key: 'ticketNumber', required: true, size: 30 },

      // ── Who sold it ──────────────────────────────────────
      { fn: 'string', key: 'venueId', required: false, size: 36 }, // null if online
      { fn: 'string', key: 'vendorUserId', required: false, size: 36 }, // Appwrite Auth $id

      // ── Who played ───────────────────────────────────────
      { fn: 'string', key: 'playerUserId', required: false, size: 36 }, // null if anonymous
      { fn: 'string', key: 'playerName', required: false, size: 100 }, // walk-in name

      // ── Linked round ─────────────────────────────────────
      { fn: 'string', key: 'roundId', required: false, size: 36 }, // null until draw

      // ── Bet ───────────────────────────────────────────────
      { fn: 'integer', key: 'selectedNums', required: true, min: 1, max: 80, array: true },
      { fn: 'integer', key: 'betAmount', required: true, min: 100 }, // cents

      // ── Result (set by processRound after each draw) ──────
      { fn: 'integer', key: 'hits', required: false, min: 0, max: 10 },
      { fn: 'integer', key: 'winAmount', required: false, min: 0, dflt: 0 }, // cents
      { fn: 'integer', key: 'commissionAmount', required: false, min: 0, dflt: 0 }, // cents

      // ── Lifecycle status ──────────────────────────────────
      // pending → matched → paid | void | refunded
      { fn: 'string', key: 'status', required: false, size: 20, dflt: 'pending' },

      // ── Sales channel ─────────────────────────────────────
      // taquilla | online | app
      { fn: 'string', key: 'channel', required: false, size: 20, dflt: 'taquilla' },

      // ── Audit timestamps ──────────────────────────────────
      { fn: 'datetime', key: 'printedAt', required: false },
      { fn: 'datetime', key: 'paidAt', required: false },
      { fn: 'string', key: 'paidBy', required: false, size: 36 }, // userId
      { fn: 'datetime', key: 'voidedAt', required: false },
      { fn: 'string', key: 'voidReason', required: false, size: 200 },
      { fn: 'datetime', key: 'refundedAt', required: false },
    ],
    indexes: [
      { key: 'uidx_ticketNumber', type: 'unique', attrs: ['ticketNumber'] },
      { key: 'idx_venueId', type: 'key', attrs: ['venueId'] },
      { key: 'idx_vendorUserId', type: 'key', attrs: ['vendorUserId'] },
      { key: 'idx_playerUserId', type: 'key', attrs: ['playerUserId'] },
      { key: 'idx_roundId', type: 'key', attrs: ['roundId'] },
      { key: 'idx_status', type: 'key', attrs: ['status'] },
      { key: 'idx_channel', type: 'key', attrs: ['channel'] },
      // Compound — venue dashboard
      { key: 'idx_venue_status', type: 'key', attrs: ['venueId', 'status'] },
      { key: 'idx_venue_round', type: 'key', attrs: ['venueId', 'roundId'] },
      // Compound — player history
      { key: 'idx_player_status', type: 'key', attrs: ['playerUserId', 'status'] },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 7. ticket_events  (immutable audit log — INSERT ONLY)
  //    Every status change appends one record here.
  //    Never updated or deleted. Used for disputes, refund
  //    evidence, and cashier accountability.
  // ══════════════════════════════════════════════════════════
  {
    id: 'ticket_events',
    name: 'Ticket Events',
    attrs: [
      { fn: 'string', key: 'ticketId', required: true, size: 36 },
      // created | matched | paid | voided | refunded | printed
      { fn: 'string', key: 'event', required: true, size: 30 },
      // Appwrite Auth $id of whoever triggered the action
      { fn: 'string', key: 'actorId', required: false, size: 36 },
      // vendor | admin | system | player
      { fn: 'string', key: 'actorRole', required: false, size: 20 },
      { fn: 'string', key: 'note', required: false, size: 500 },
      // Full JSON snapshot of the ticket at the moment of the event
      { fn: 'string', key: 'snapshot', required: false, size: 5000 },
    ],
    indexes: [
      { key: 'idx_ticketId', type: 'key', attrs: ['ticketId'] },
      { key: 'idx_event', type: 'key', attrs: ['event'] },
      { key: 'idx_actorId', type: 'key', attrs: ['actorId'] },
      { key: 'idx_ticketId_event', type: 'key', attrs: ['ticketId', 'event'] },
    ],
  },

];

/**
 * Standard Permissions for Collections in this dashboard.
 * Granting full CRUD to all authenticated users (Role.users()).
 * Security is handled at the app/routing layer via usePermissions.
 */
const collectionPermissions = [
  Permission.read(Role.users()),
  Permission.create(Role.users()),
  Permission.update(Role.users()),
  Permission.delete(Role.users()),
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const delay = ms => new Promise(r => setTimeout(r, ms));

async function safe(label, fn) {
  try {
    const r = await fn();
    console.log(`    ✅  ${label}`);
    return r;
  } catch (e) {
    if (e.code === 409) {
      console.log(`    ⏭️   ${label} — already exists, skipping`);
    } else {
      console.warn(`    ⚠️   ${label} — ${e.message} (code ${e.code})`);
    }
  }
}

async function createAttr(collId, a) {
  const label = `${a.key}  (${a.fn}${a.array ? '[]' : ''}, ${a.required ? 'required' : 'optional'})`;
  const dbId = APPWRITE_DATABASE_ID;
  const req = a.required ?? false;

  switch (a.fn) {
    case 'string':
      return safe(label, () =>
        db.createStringAttribute(dbId, collId, a.key, a.size ?? 255, req, a.dflt ?? null, a.array ?? false)
      );
    case 'integer':
      return safe(label, () =>
        db.createIntegerAttribute(dbId, collId, a.key, req, a.min ?? null, a.max ?? null, a.dflt ?? null, a.array ?? false)
      );
    case 'float':
      return safe(label, () =>
        db.createFloatAttribute(dbId, collId, a.key, req, a.min ?? null, a.max ?? null, a.dflt ?? null, a.array ?? false)
      );
    case 'boolean':
      return safe(label, () =>
        db.createBooleanAttribute(dbId, collId, a.key, req, a.dflt ?? null, a.array ?? false)
      );
    case 'enum':
      return safe(label, () =>
        db.createEnumAttribute(dbId, collId, a.key, a.elements ?? [], req, a.dflt ?? null, a.array ?? false)
      );
    case 'datetime':
      return safe(label, () =>
        db.createDatetimeAttribute(dbId, collId, a.key, req, a.dflt ?? null, a.array ?? false)
      );
    default:
      console.warn(`    ❓  Unknown type "${a.fn}" for key "${a.key}"`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`
╔════════════════════════════════════════════╗
║   Keno Deluxe — Appwrite Schema Init       ║
╚════════════════════════════════════════════╝
  Endpoint  : ${APPWRITE_ENDPOINT}
  Project   : ${APPWRITE_PROJECT_ID}
  Database  : ${APPWRITE_DATABASE_ID}

  Collections (8 total, in order):
    1. roles
    2. permissions
    3. role_permissions
    4. staff
    5. venues
    6. rounds
    7. tickets
    8. ticket_events

  Already exists? Each step is skipped with ⏭️  — safe to re-run.
`);

  for (const [i, coll] of COLLECTIONS.entries()) {
    console.log(`\n══════════════════════════════════════════════`);
    console.log(`${i + 1}/${COLLECTIONS.length}  ${coll.name}  (id: "${coll.id}")`);
    console.log(`══════════════════════════════════════════════`);

    // 1. Collection (Create or Update permissions)
    await safe(`collection "${coll.id}"`, async () => {
      try {
        return await db.createCollection(APPWRITE_DATABASE_ID, coll.id, coll.name, collectionPermissions);
      } catch (e) {
        if (e.code === 409) {
          // Already exists — update permissions just in case
          return await db.updateCollection(APPWRITE_DATABASE_ID, coll.id, coll.name, collectionPermissions);
        }
        throw e;
      }
    });
    await delay(500);

    // 2. Attributes
    console.log(`\n  Attributes:`);
    for (const attr of coll.attrs) {
      await createAttr(coll.id, attr);
      await delay(250);
    }

    // 3. Wait for Appwrite to mark attrs as "available" before indexing
    //    (indexes fail if attrs are still in "processing" state)
    console.log(`\n  Waiting for attributes to propagate...`);
    await delay(4000);

    // 4. Indexes
    console.log(`  Indexes:`);
    for (const idx of coll.indexes) {
      const label = `${idx.key}  (${idx.type}: [${idx.attrs.join(', ')}])`;
      await safe(label, () =>
        db.createIndex(
          APPWRITE_DATABASE_ID,
          coll.id,
          idx.key,
          idx.type,
          idx.attrs,
          idx.attrs.map(() => 'ASC'),
        )
      );
      await delay(300);
    }

    console.log(`\n  ✅  ${coll.name} complete`);
  }

  // ───────────────────────────────────────────────────────────
  // SEED — initial data (idempotent via try/catch on 409)
  // ───────────────────────────────────────────────────────────
  console.log(`\n\n${'═'.repeat(46)}`);
  console.log(`🌱  Seeding initial data...`);
  console.log(`${'═'.repeat(46)}`);

  await seedPermissions();
  await seedRoles();
  await seedRolePermissions();
  await seedAdminStaff();

  console.log(`
╔════════════════════════════════════════════╗
║   Schema + seed complete! (8 collections)  ║
╚════════════════════════════════════════════╝

Next steps:
  1. Appwrite Console → Databases → ${APPWRITE_DATABASE_ID}
     Verify all 8 collections show status "enabled"

  2. Set permissions per collection
     (Console → collection → Settings → Permissions):

       roles            read: users      write: role:admin
       permissions      read: users      write: role:admin
       role_permissions read: users      write: role:admin
       staff            read: users      write: role:admin
       venues           read: users      write: role:admin
       rounds           read: any        write: server key only
       tickets          read: users      write: users
       ticket_events    read: users      write: users (insert-only in app code)

  3. Add to src/lib/appwrite/collections.ts:

       export const COL = {
         ROLES:         'roles',
         PERMISSIONS:   'permissions',
         ROLE_PERMS:    'role_permissions',
         STAFF:         'staff',
         VENUES:        'venues',
         ROUNDS:        'rounds',
         TICKETS:       'tickets',
         TICKET_EVENTS: 'ticket_events',
       };

  4. Change the initial admin password immediately:
     Appwrite Console → Auth → Users → owner@keno.local
`);
}

// ─────────────────────────────────────────────────────────────────────────────
// SEED FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

// ── 1. Permissions ────────────────────────────────────────
async function seedPermissions() {
  console.log(`\n  Permissions:`);

  const PERMISSIONS = [
    // ── System config ─────────────────────────────────────
    { id: 'CONFIG_READ', group: 'CONFIG', description: 'Allows viewing and accessing system and application configuration settings.' },
    { id: 'CONFIG_WRITE', group: 'CONFIG', description: 'Allows creating, updating, and modifying system and application configuration settings.' },
    // ── Roles ─────────────────────────────────────────────
    { id: 'ROLES_MANAGE', group: 'ROLES', description: 'Allows creating, editing, and assigning roles, including managing role permissions.' },
    // ── Users ─────────────────────────────────────────────
    { id: 'USERS_INVITE', group: 'USERS', description: 'Allows inviting new users to the organization and managing pending invitations.' },
    // ── Staff ─────────────────────────────────────────────
    { id: 'STAFF_READ', group: 'STAFF', description: 'Can view staff members and their roles.' },
    { id: 'STAFF_INVITE', group: 'STAFF', description: 'Allows inviting new staff users and managing pending invitations.' },
    { id: 'STAFF_UPDATE', group: 'STAFF', description: 'Can update staff roles and permissions.' },
    { id: 'STAFF_DELETE', group: 'STAFF', description: 'Can remove staff members from the system.' },
    { id: 'STAFF_ASSIGN_ROLES', group: 'STAFF', description: 'Can assign roles to staff members.' },
    // ── Keno — venues ─────────────────────────────────────
    { id: 'KENO_VENUES_CREATE', group: 'KENO', description: 'Can create and register new venues (taquillas).' },
    { id: 'KENO_VENUES_READ', group: 'KENO', description: 'Can view venues and their details.' },
    { id: 'KENO_VENUES_UPDATE', group: 'KENO', description: 'Can update venue information and assigned vendors.' },
    // ── Keno — tickets ────────────────────────────────────
    { id: 'KENO_TICKETS_CREATE', group: 'KENO', description: 'Can issue new tickets (bets) at a venue.' },
    { id: 'KENO_TICKETS_VOID', group: 'KENO', description: 'Can void or cancel issued tickets.' },
    { id: 'KENO_TICKETS_PAY', group: 'KENO', description: 'Can mark winning tickets as paid.' },
    // ── Keno — reports ────────────────────────────────────
    { id: 'KENO_REPORTS_VIEW', group: 'KENO', description: 'Can view sales and payout reports.' },
  ];

  for (const p of PERMISSIONS) {
    const { id, ...data } = p;
    await safe(`permission: ${id}`, () =>
      db.createDocument(APPWRITE_DATABASE_ID, 'permissions', id, data)
    );
    await delay(150);
  }
}

// ── 2. Roles ──────────────────────────────────────────────
async function seedRoles() {
  console.log(`\n  Roles:`);

  const ROLES = [
    {
      id: 'owner',
      name: 'Owner',
      description: 'Full system access. Built-in role — cannot be edited or deleted.',
      isSystem: true,
    },
    {
      id: 'manager',
      name: 'Gerente',
      description: 'Can create and activate vendors, manage venues, and view reports.',
      isSystem: false,
    },
    {
      id: 'vendor',
      name: 'Vendedor / Cajero',
      description: 'Can issue tickets and mark payouts at assigned venues.',
      isSystem: false,
    },
  ];

  for (const r of ROLES) {
    const { id, ...data } = r;
    await safe(`role: ${id}`, () =>
      db.createDocument(APPWRITE_DATABASE_ID, 'roles', id, data)
    );
    await delay(150);
  }
}

// ── 3. Role → Permission assignments ─────────────────────
async function seedRolePermissions() {
  console.log(`\n  Role permissions:`);

  // owner  — all permissions
  const OWNER_PERMS = [
    'CONFIG_READ', 'CONFIG_WRITE',
    'ROLES_MANAGE',
    'USERS_INVITE',
    'STAFF_READ', 'STAFF_INVITE', 'STAFF_UPDATE', 'STAFF_DELETE', 'STAFF_ASSIGN_ROLES',
    'KENO_VENUES_CREATE', 'KENO_VENUES_READ', 'KENO_VENUES_UPDATE',
    'KENO_TICKETS_CREATE', 'KENO_TICKETS_VOID', 'KENO_TICKETS_PAY',
    'KENO_REPORTS_VIEW',
  ];

  // manager — can manage staff (not delete/assign roles), manage venues, see reports
  const MANAGER_PERMS = [
    'CONFIG_READ',
    'STAFF_READ', 'STAFF_INVITE', 'STAFF_UPDATE',
    'KENO_VENUES_CREATE', 'KENO_VENUES_READ', 'KENO_VENUES_UPDATE',
    'KENO_TICKETS_CREATE', 'KENO_TICKETS_VOID', 'KENO_TICKETS_PAY',
    'KENO_REPORTS_VIEW',
  ];

  // vendor — only ticket operations and venue read
  const VENDOR_PERMS = [
    'KENO_VENUES_READ',
    'KENO_TICKETS_CREATE', 'KENO_TICKETS_PAY',
  ];

  const ASSIGNMENTS = [
    ...OWNER_PERMS.map(p => ({ roleId: 'owner', permissionId: p })),
    ...MANAGER_PERMS.map(p => ({ roleId: 'manager', permissionId: p })),
    ...VENDOR_PERMS.map(p => ({ roleId: 'vendor', permissionId: p })),
  ];

  for (const a of ASSIGNMENTS) {
    const docId = `${a.roleId}_${a.permissionId}`;
    await safe(`${a.roleId} → ${a.permissionId}`, () =>
      db.createDocument(APPWRITE_DATABASE_ID, 'role_permissions', docId, a)
    );
    await delay(150);
  }
}

// ── 4. Initial admin staff record ─────────────────────────
// NOTE: This creates the STAFF RECORD only.
// You still need to create the Appwrite Auth user manually
// (Console → Auth → Create User) with the same email,
// then update the userId field in this record.
async function seedAdminStaff() {
  console.log(`\n  Initial admin staff:`);

  const ADMIN_STAFF = {
    userId: 'REPLACE_WITH_APPWRITE_AUTH_USER_ID',  // ← update after creating Auth user
    fullName: 'Administrador Principal',
    status: 'active',
    email: 'owner@keno.local',
    phone: null,
  };

  await safe(`staff: ${ADMIN_STAFF.email}  ⚠️  Remember to set userId!`, () =>
    db.createDocument(APPWRITE_DATABASE_ID, 'staff', 'owner_staff', ADMIN_STAFF)
  );

  console.log(`
  ┌─────────────────────────────────────────────┐
  │  ⚠️   IMPORTANT — Initial admin setup        │
  │                                             │
  │  1. Go to Appwrite Console → Auth → Users   │
  │  2. Create user:                            │
  │       Email:    owner@keno.local            │
  │       Password: ChangeMe123!  (change it!)  │
  │  3. Copy the user's $id                     │
  │  4. Open Databases → staff collection       │
  │  5. Find this record and set userId = $id   │
  └─────────────────────────────────────────────┘`);
}

// ─────────────────────────────────────────────────────────────────────────────
// ENTRY POINT
// ─────────────────────────────────────────────────────────────────────────────

main().catch(e => {
  console.error('\n❌  Fatal error:', e.message);
  process.exit(1);
});
