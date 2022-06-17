const knexConfig = require('../knexfile');
const knex = require('knex')(knexConfig['test'])

const JEST_TIMEOUT = 60000;

const ONE_SECOND = 1000;
const TWO_MILLISECONDS = 2;

beforeAll(async () => {
  await knex.raw(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    CREATE TABLE IF NOT EXISTS "users" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      CONSTRAINT pet_pkey_ PRIMARY KEY ("id")
    );
  `);
})

afterAll(async () => {
  await knex.raw("drop table users");
  await knex.destroy();
})

test('timeout throws an exception', async () => {
  await expect(knex.raw('select pg_sleep(10)').timeout(ONE_SECOND)).rejects.toThrow('Defined query timeout of 1000ms exceeded when running query.');
}, JEST_TIMEOUT)

test('catching error', async () => {
  try {
    await knex.raw('select pg_sleep(10)').timeout(ONE_SECOND)
  } catch (error) {
    console.log(error);
  }
}, JEST_TIMEOUT)

test('with real data', async () => {
  const entriesToAdd = new Array(10000);

  for (const _ of entriesToAdd) {
    await knex('users').insert({});
  }

  await expect(
    knex.
      raw('select * from users inner join users u on u.id = users.id').
      timeout(TWO_MILLISECONDS)
  ).rejects.toThrow('Defined query timeout of 2ms exceeded when running query.');

}, JEST_TIMEOUT)



