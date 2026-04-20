# Australian SME Business Dataset (Free Sample)

**This is a free sample.** The full dataset (42 tables, 83,000+ rows) is available at [mindweavetech.gumroad.com](https://mindweavetech.gumroad.com/l/trcdsq).

---

## What is this?

A complete simulation of an Australian retail SME operating over 2 financial years. Unlike flat fake-data generators (Faker, Mockaroo), this dataset was built by running a day-by-day business simulation — relationships emerge naturally, not by scripting.

**This sample includes ~2,800 rows across 26 tables.** Full reference tables (chart of accounts, products, customers, employees) plus sampled transaction tables (first 100-500 rows of sales, purchases, journal entries, etc.).

## What makes this different

- **Cross-domain traceability:** Every sale traces end-to-end: Customer → Sales Order → Invoice → Payment → Bank Transaction → Journal Entry
- **Double-entry accounting:** 7,400+ journal entries with debits always equalling credits (in the full dataset)
- **Australian compliance:** Real ATO PAYG tax brackets, 11.5% super, quarterly BAS returns with GST, Australian chart of accounts
- **Temporal realism:** Seasonal sales patterns, staff turnover, inventory restocking cycles, payment behaviour variation

## Sample tables included

### Full reference tables
| Table | Rows | Description |
|-------|------|-------------|
| companies | 1 | Simulated business entity |
| departments | 4 | Management, Sales, Warehouse, Administration |
| chart_of_accounts | 56 | Full Australian retail chart of accounts |
| products | 25 | Outdoor/camping retail products |
| customers | 173 | Customers with payment terms and behaviour traits |
| suppliers | 10 | Stock and service suppliers |
| employees | 14 | Full employee records |
| bank_accounts | 2 | Operating and savings accounts |
| fixed_assets | 10 | POS, computers, shop fittings, vehicle |
| projects | 10 | Internal projects |
| tax_returns | 8 | Quarterly BAS returns |
| tax_return_lines | 56 | BAS line items |
| pay_runs | 52 | Fortnightly pay runs |
| bank_statements | 24 | Monthly statements |
| price_history | 25 | Price changes |

### Sampled transaction tables (first N rows)
| Table | Sample Rows | Full Dataset |
|-------|------------|-------------|
| sales_orders | 200 | 2,707 |
| sales_order_lines | 500 | 12,189 |
| sales_invoices | 200 | 2,707 |
| journal_entries | 200 | 7,407 |
| journal_entry_lines | 500 | 18,623 |
| bank_transactions | 200 | 3,565 |
| inventory_movements | 200 | 13,135 |
| pay_run_lines | 100 | 621 |
| purchase_orders | 100 | 964 |

## Who this is for

- **Developers** building ERP, accounting, or business software
- **QA teams** testing complex business workflows across modules
- **Consultants** running demos and training without exposing client data
- **Data engineers** building ETL pipelines against a realistic source
- **Students** studying business systems and accounting
- **AI/ML teams** needing realistic business data for training

## Get the full dataset

The full dataset includes all 42 tables, 83,000+ rows, PostgreSQL dump, complete SQL schema, and full CSV export.

**[$49 on Gumroad →](https://mindweavetech.gumroad.com/l/trcdsq)**

## Foreign key relationships

See `_relationships.csv` for the complete foreign key map showing how all tables connect.

## Simulated business

| Field | Value |
|-------|-------|
| Company | Outback Outdoor Supplies Pty Ltd |
| Industry | Retail (outdoor/camping equipment) |
| Location | Western Australia |
| Period | 1 July 2023 – 30 June 2025 |
| Employees | 14 (12 active, 2 terminated) |
| Customers | 173 |
| Products | 25 SKUs |

## License

This sample is free to use for development, testing, training, and evaluation. The full dataset is commercially licensed — see Gumroad for terms.

---

Built by [Mindweave Technologies](https://mindweave.tech) using [sme-sim](https://github.com/mindweavetech/sme-sim), an open-source business simulation engine.
