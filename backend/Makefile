# ==========================================
# PERSONAL FINANCE MANAGER - TEST MAKEFILE
# ==========================================

.PHONY: help dev test test-unit test-integration test-fuzz test-load test-all install clean

# ==========================================
# DEFAULT
# ==========================================

help:
	@echo "====================================="
	@echo " PERSONAL FINANCE MANAGER - COMMANDS "
	@echo "====================================="
	@echo "make install           - Cai dependencies"
	@echo "make dev               - Chay backend"
	@echo "make test-unit         - Chay Unit Test"
	@echo "make test-integration  - Chay Integration Test"
	@echo "make test-fuzz         - Chay Fuzz Test"
	@echo "make test-load         - Chay Load Test"
	@echo "make test-all          - Chay toan bo test"
	@echo "make clean             - Xoa cache"
	@echo "====================================="


# ==========================================
# INSTALL
# ==========================================

install:
	npm install


# ==========================================
# RUN BACKEND
# ==========================================

dev:
	npm run dev


# ==========================================
# UNIT TEST
# ==========================================

test-unit:
	npm run test:unit


# ==========================================
# INTEGRATION TEST
# ==========================================

test-integration:
	npm run test:integration


# ==========================================
# FUZZ TEST
# ==========================================

test-fuzz:
	npm run test:fuzz


# ==========================================
# LOAD TEST
# ==========================================

test-load:
	npm run test:load


# ==========================================
# RUN ALL TESTS
# ==========================================

test-all:
	npm run test:unit
	npm run test:integration
	npm run test:fuzz
	npm run test:load


# ==========================================
# CLEAN CACHE
# ==========================================

clean:
	rm -rf node_modules
	rm -rf coverage
	rm -rf .jest-cache