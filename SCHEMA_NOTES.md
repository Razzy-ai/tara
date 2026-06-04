# Database Schema Notes

## Overview

The database is designed to store transaction history, mutual fund information, NAV history, and investment holdings. The schema is normalized to support efficient querying and future analytics.

---

## Transactions

Stores all spending and money movement records.

### Purpose

* Track user expenses and transfers.
* Support spending analysis by merchant, category, and date.
* Preserve both raw and normalized merchant names.

### Special Notes

* `merchant` stores the original merchant name from the dataset.
* `normalizedMerchant` stores a standardized merchant name used for alias detection and aggregation.

Example:

| Merchant         | Normalized Merchant |
| ---------------- | ------------------- |
| SWIGGY*ORDER     | SWIGGY              |
| SWIGGY BANGALORE | SWIGGY              |
| Swiggy Instamart | SWIGGY              |

---

## Funds

Stores metadata for mutual funds.

### Purpose

* Maintain fund information independent of holdings.
* Serve as the parent entity for NAV records and holdings.

### Fields

* Fund ID
* Fund Name
* Fund Category

---

## FundNav

Stores historical Net Asset Value (NAV) data.

### Purpose

* Track fund performance over time.
* Enable time-based NAV queries and calculations.

### Design Decision

Each NAV entry is stored as a separate row instead of a JSON array.

Example:

| Fund ID | Date       | NAV |
| ------- | ---------- | --- |
| fund_1  | 2024-01-01 | 103 |
| fund_1  | 2024-02-01 | 105 |
| fund_1  | 2024-03-01 | 110 |

This structure simplifies filtering, aggregation, and historical analysis.

---

## Holdings

Stores investment positions owned by the user.

### Purpose

* Track purchased units of a fund.
* Record purchase date and purchase NAV.

### Relationship

Each holding references a fund through a foreign key (`fundId`).

Example:

Holding → Fund

This relationship enables portfolio valuation and performance calculations.

---

## Relationships

Fund (1) ────< FundNav (Many)

Fund (1) ────< Holding (Many)

Transactions are independent and do not have foreign key relationships with funds or holdings.

---

## Benefits of the Design

* Normalized structure reduces data duplication.
* Supports efficient filtering and aggregation.
* Enables merchant alias normalization.
* Simplifies historical NAV analysis.
* Provides a clear separation between transactions, funds, NAV history, and holdings.
