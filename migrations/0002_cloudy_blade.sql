ALTER TABLE `player-stats` RENAME COLUMN "fgPct" TO "fg_pct";--> statement-breakpoint
ALTER TABLE `player-stats` RENAME COLUMN "threeP" TO "three_p";--> statement-breakpoint
ALTER TABLE `player-stats` RENAME COLUMN "threePA" TO "three_pa";--> statement-breakpoint
ALTER TABLE `player-stats` RENAME COLUMN "threePPct" TO "three_p_pct";--> statement-breakpoint
ALTER TABLE `player-stats` RENAME COLUMN "ftPct" TO "ft_pct";--> statement-breakpoint
ALTER TABLE `player-stats` RENAME COLUMN "gmSc" TO "gm_sc";--> statement-breakpoint
ALTER TABLE `player-stats` RENAME COLUMN "seasonType" TO "season_type";--> statement-breakpoint
ALTER TABLE `player-stats` ALTER COLUMN "fg_pct" TO "fg_pct" text;--> statement-breakpoint
ALTER TABLE `player-stats` ALTER COLUMN "three_p_pct" TO "three_p_pct" text;--> statement-breakpoint
ALTER TABLE `player-stats` ALTER COLUMN "ft_pct" TO "ft_pct" text;--> statement-breakpoint
ALTER TABLE `player-stats` ALTER COLUMN "gm_sc" TO "gm_sc" text;