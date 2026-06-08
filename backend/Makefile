# Makefile for Backend Personal Finance Manager
# Author: Dang Viet Hung (UC03)
# Description: Quick commands to run backend development, database sync, and tests.

.PHONY: dev sync test-search test-search-unit test-search-integration test-search-fuzz test-search-load help

help:
	@echo "========================================================================="
	@echo "  Backend CLI Commands Makefile"
	@echo "========================================================================="
	@echo "  make test-search             - Run ALL UC03 Transaction Search tests"
	@echo "  make test-search-unit        - Run ONLY UC03 Search Unit Test"
	@echo "  make test-search-integration - Run ONLY UC03 Search Integration Test"
	@echo "  make test-search-fuzz        - Run ONLY UC03 Search Fuzz Test"
	@echo "  make test-search-load        - Run ONLY UC03 Search Load/Stress Test"
	@echo "========================================================================="

dev:
	npm run dev

sync:
	npm run sync

# --- Specific UC03 Transaction Search tests (Dang Viet Hung) ---
test-search:
	npx cross-env NODE_OPTIONS=--experimental-vm-modules jest tests/unit/transaction.service.unit.test.ts tests/integration/transaction.service.integration.test.ts tests/fuzz/transaction.service.fuzz.test.ts

test-search-unit:
	npx cross-env NODE_OPTIONS=--experimental-vm-modules jest tests/unit/transaction.service.unit.test.ts

test-search-integration:
	npx cross-env NODE_OPTIONS=--experimental-vm-modules jest tests/integration/transaction.service.integration.test.ts

test-search-fuzz:
	npx cross-env NODE_OPTIONS=--experimental-vm-modules jest tests/fuzz/transaction.service.fuzz.test.ts

test-search-load:
	npx tsx tests/load/search.load.ts
