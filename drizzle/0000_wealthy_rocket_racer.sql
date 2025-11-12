CREATE TABLE `analysis_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticker` text NOT NULL,
	`period` text NOT NULL,
	`interval` text NOT NULL,
	`indicators_enabled` integer NOT NULL,
	`run_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portfolio` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticker` text NOT NULL,
	`quantity` real NOT NULL,
	`buy_price` real NOT NULL,
	`buy_date` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`default_ticker` text NOT NULL,
	`default_period` text NOT NULL,
	`default_interval` text NOT NULL,
	`show_indicators` integer NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `watchlist` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticker` text NOT NULL,
	`name` text NOT NULL,
	`added_at` text NOT NULL,
	`notes` text
);
