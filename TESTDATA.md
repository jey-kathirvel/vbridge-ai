# Synthetic Test Data

## Overview

The registration module is currently under development by another team.

To avoid blocking AI development, V-Bridge AI Lab uses synthetic business profiles.

The AI Engine is completely independent of the data source.

---

# Architecture

```
Registration API

(Not Ready)

↓

Synthetic Dataset

↓

AI Persona

↓

AI Matchmaking
```

---

# Why Mock Data?

- Independent development
- AI testing
- UI testing
- API validation
- Performance testing

---

# Dataset Structure

```json
{
  "company_name":"",
  "industry":"",
  "country":"",
  "city":"",
  "products":[],
  "services":[],
  "business_goals":[],
  "target_markets":[],
  "employee_range":"",
  "annual_revenue":"",
  "technology":[],
  "certifications":[]
}
```

---

# Sample

```json
{
  "company_name":"ABC Robotics",
  "industry":"Industrial Automation",
  "country":"India",
  "products":[
      "Robotics",
      "IoT"
  ],
  "business_goals":[
      "Find Buyers"
  ]
}
```

---

# Data Sources

Current

- JSON
- Local Files

Future

- Registration Service
- PostgreSQL
- Apollo
- CRM

---

# Important Design Principle

The AI Engine must not depend on where the data originates.

Supported sources

✓ JSON

✓ PostgreSQL

✓ Registration API

✓ Apollo

✓ CRM

All data must first be normalized into the common company profile schema before entering the AI pipeline.

---

# Migration Strategy

Current

```
JSON

↓

Normalizer

↓

AI Engine
```

Future

```
Registration API

↓

Normalizer

↓

AI Engine
```

No changes are required in the AI Matchmaking Engine when switching data sources.
