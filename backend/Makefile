# ==========================================
# BUDGET TEST MAKEFILE
# ==========================================

.PHONY: help unit integration fuzz load all

help:
	@echo "================================="
	@echo " BUDGET TEST COMMANDS "
	@echo "================================="
	@echo "make unit         - Budget Unit Test"
	@echo "make integration  - Budget Integration Test"
	@echo "make fuzz         - Budget Fuzz Test"
	@echo "make load         - Budget Load Test"
	@echo "make all          - Run All Budget Tests"
	@echo "================================="


# ==========================================
# UNIT TEST
# ==========================================

unit:
	npx jest tests/unit/budget.unit.test.ts


# ==========================================
# INTEGRATION TEST
# ==========================================

integration:
	npx jest tests/integration/budget.integration.test.ts


# ==========================================
# FUZZ TEST
# ==========================================

fuzz:
	npx jest tests/fuzz/budget.fuzz.test.ts


# ==========================================
# LOAD TEST
# ==========================================

load:
	npx tsx tests/load/budget.load.ts


# ==========================================
# RUN ALL
# ==========================================

all:
	npx jest tests/unit/budget.unit.test.ts
	npx jest tests/integration/budget.integration.test.ts
	npx jest tests/fuzz/budget.fuzz.test.ts
	npx tsx tests/load/budget.load.ts