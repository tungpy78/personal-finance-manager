# Makefile for Backend Personal Finance Manager
# Author: Dang Viet Hung (UC03)
# Description: Quick commands to run backend development, database sync, and tests.

.PHONY: dev sync test test-unit test-integration test-fuzz test-load help

help:
	@echo "========================================================================="
	@echo "  Backend CLI Commands Makefile"
	@echo "========================================================================="
	@echo "  make dev              - Start the development server (auto-reload)"
	@echo "  make sync             - Sync Database schemas (Sequelize migration)"
	@echo "  make test             - Run ALL tests (Unit, Integration, Fuzz)"
	@echo "  make test-unit        - Run ONLY Unit Tests"
	@echo "  make test-integration - Run ONLY Integration Tests (Database required)"
	@echo "  make test-fuzz        - Run ONLY Fuzz Tests"
	@echo "  make test-load        - Run API Load/Stress Test"
	@echo "========================================================================="

dev:
	npm run dev

sync:
	npm run sync

test:
	npm run test

test-unit:
	npm run test:unit

test-integration:
	npm run test:integration

test-fuzz:
	npm run test:fuzz

test-load:
	npm run test:load
