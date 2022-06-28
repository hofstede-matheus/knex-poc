const knexConfig = require('../knexfile');
const knexConfigGlobalTimeout = require('../knexfile_timeout');

const knex = require('knex')(knexConfig['test'])
const knexGlobalTimeout = require('knex')(knexConfigGlobalTimeout['test'])

const JEST_TIMEOUT = 60000;

const ONE_SECOND = 1000;
const TWO_MILLISECONDS = 2;

knex.on('start', async (query) => {
  // console.log(query);
})

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

describe('with query timeout only', () => {
  test('timeout throws an exception', async () => {
    await expect(knex.raw('select pg_sleep(10)').timeout(ONE_SECOND)).rejects.toThrow();
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
    ).rejects.toThrow();

  }, JEST_TIMEOUT)
})


describe('with global timeout', () => {
  test('timeout throws an exception', async () => {
    await expect(knexGlobalTimeout.raw('select pg_sleep(10)')).rejects.toThrow();
  }, JEST_TIMEOUT)

  test('with real data', async () => {
    const entriesToAdd = new Array(10000);

    entriesToAdd.forEach(async () => {
      await knexGlobalTimeout.from('users').insert({});
    })

    await expect(
      knexGlobalTimeout.
        raw('select * from users inner join users u on u.id = users.id')
    ).rejects.toThrow();

  }, JEST_TIMEOUT)
})
