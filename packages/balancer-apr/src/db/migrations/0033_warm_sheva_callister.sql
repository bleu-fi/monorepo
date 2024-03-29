CREATE INDEX IF NOT EXISTS "gauges_pool_external_id_index" ON "gauges" ("pool_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gauges_network_slug_index" ON "gauges" ("network_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "gauges_address_index" ON "gauges" ("address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_snapshots_pool_external_id_index" ON "pool_snapshots" ("pool_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_snapshots_temp_pool_external_id_index" ON "pool_snapshots_temp" ("pool_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_rate_providers_pool_external_id_index" ON "pool_rate_providers" ("pool_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_rate_providers_network_slug_index" ON "pool_rate_providers" ("network_slug");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_rate_providers_token_address_index" ON "pool_rate_providers" ("token_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_rate_providers_address_index" ON "pool_rate_providers" ("address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_rate_providers_vulnerability_affected_index" ON "pool_rate_providers" ("vulnerability_affected");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_token_weights_snapshot_pool_external_id_index" ON "pool_token_weights_snapshot" ("pool_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_token_weights_snapshot_token_address_index" ON "pool_token_weights_snapshot" ("token_address");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_token_weights_snapshot_timestamp_index" ON "pool_token_weights_snapshot" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pool_tokens_pool_external_id_index" ON "pool_tokens" ("pool_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rewards_token_apr_pool_external_id_index" ON "rewards_token_apr" ("pool_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rewards_token_apr_timestamp_index" ON "rewards_token_apr" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "swap_fee_apr_pool_external_id_index" ON "swap_fee_apr" ("pool_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "swap_fee_apr_timestamp_index" ON "swap_fee_apr" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vebal_apr_pool_external_id_index" ON "vebal_apr" ("pool_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "vebal_apr_timestamp_index" ON "vebal_apr" ("timestamp");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yield_token_apr_pool_external_id_index" ON "yield_token_apr" ("pool_external_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "yield_token_apr_timestamp_index" ON "yield_token_apr" ("timestamp");--> statement-breakpoint
ALTER TABLE "vebal_apr" ADD CONSTRAINT "vebal_apr_timestamp_pool_external_id_unique" UNIQUE("timestamp","pool_external_id");