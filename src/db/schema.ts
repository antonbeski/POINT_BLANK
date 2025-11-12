import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const watchlist = sqliteTable('watchlist', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticker: text('ticker').notNull(),
  name: text('name').notNull(),
  addedAt: text('added_at').notNull(),
  notes: text('notes'),
});

export const portfolio = sqliteTable('portfolio', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticker: text('ticker').notNull(),
  quantity: real('quantity').notNull(),
  buyPrice: real('buy_price').notNull(),
  buyDate: text('buy_date').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

export const analysisHistory = sqliteTable('analysis_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ticker: text('ticker').notNull(),
  period: text('period').notNull(),
  interval: text('interval').notNull(),
  indicatorsEnabled: integer('indicators_enabled', { mode: 'boolean' }).notNull(),
  runAt: text('run_at').notNull(),
});

export const userPreferences = sqliteTable('user_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  defaultTicker: text('default_ticker').notNull(),
  defaultPeriod: text('default_period').notNull(),
  defaultInterval: text('default_interval').notNull(),
  showIndicators: integer('show_indicators', { mode: 'boolean' }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});