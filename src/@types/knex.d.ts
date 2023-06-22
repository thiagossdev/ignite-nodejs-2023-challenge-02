// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Knex } from 'knex';

declare module 'knex/types/tables' {
  interface Account {
    id: string;
    document: string;
    name: string;
    email: string;
    created_at: string;
    updated_at: string;
  }

  interface Tables {
    accounts: Account;
  }
}
