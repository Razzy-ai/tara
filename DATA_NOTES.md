# Data Notes

## Overview

Three datasets were analyzed:

* SAMPLE_A
* SAMPLE_B
* SAMPLE_C

Each dataset contains:

* 1500 transactions
* 8 mutual funds
* 8 holdings

Date range:

* Start: 2024-01-01
* End: 2025-03-30

---

## Transactions

### Common Fields

```text
id
date
merchant
category
amount
currency
memo
```

### Categories Observed

* health
* groceries
* food
* transport
* travel
* rent
* utilities
* shopping
* entertainment
* subscription
* transfer
* uncategorized

### Key Observations

* Refund transactions are represented by negative amounts.
* Merchant names contain aliases and inconsistent formatting.
* Transfer transactions exist and should be excluded from spending analytics.
* Memos contain useful information such as:

  * UPI references
  * NEFT references
  * Purchase descriptions
  * Refund descriptions

### Merchant Alias Examples

#### Swiggy

* Swiggy
* SWIGGY*ORDER
* Swiggy Instamart
* SWIGGY BANGALORE

#### Uber

* Uber
* UBER INDIA SYSTEMS PVT
* UBER*TRIP

#### Apollo Pharmacy

* Apollo Pharmacy
* APOLLO PHARMACY MUMBAI

#### Zepto

* Zepto
* ZEPTO*ORDER

---

## Funds

### Fund Structure

```text
id
name
category
nav
```

### NAV Data

* Each fund contains 24 NAV entries.
* Example NAV structure:

```json
{
  "date": "2023-04-01",
  "value": 101.24
}
```

---

## Holdings

### Holding Structure

```text
fund_id
fund_name
units
purchase_date
purchase_nav
```

### Validation

* Total Holdings: 8
* Missing Fund Relations: None

---

## Data Cleaning Requirements

1. Normalize merchant aliases.
2. Separate refunds from expenses.
3. Exclude self-transfers from spending analysis.
4. Standardize merchant naming conventions.
5. Extract structured payment information from memo fields.
6. Validate fund-holding relationships.

---

## Dataset Statistics

| Dataset  | Transactions | Refunds | Transfers | Merchants |
| -------- | ------------ | ------- | --------- | --------- |
| SAMPLE_A | 1500         | 69      | 67        | 49        |
| SAMPLE_B | 1500         | 71      | 58        | 51        |
| SAMPLE_C | 1500         | 67      | 60        | 45        |

## Conclusion

The datasets appear suitable for building:

* Personal finance analytics
* Spending categorization
* Merchant normalization pipelines
* Budget tracking systems
* Investment portfolio analysis
