# Legal corpus build report

- generated_at: `2026-10-22T05:27:14+00:00`
- source: `indiacode.gov.in (DSpace 9.1 REST API)` (retrieved live; raw responses cached under `ml/data/raw/`)
- acts fetched: **17** / requested 17
- chunks: **2336**
- exact duplicates removed: 3
- near-duplicate pairs clustered: 4
- split: train=1872 / val=234 / test=230
- cross-split leakage clusters: **0**
- validation: PASS

## Per-act counts

| act_key | title | sections | with text | chunks |
|---|---|---:|---:|---:|
| bns_2023 | The Bharatiya Nyaya Sanhita, 2023 | 358 | 358 | 380 |
| bnss_2023 | The Bharatiya Nagarik Suraksha Sanhita, 2023 | 531 | 531 | 549 |
| bsa_2023 | The Bharatiya Sakshya Adhiniyam, 2023 | 170 | 170 | 179 |
| cpc_1908 | The Code of Civil Procedure, 1908 | 171 | 171 | 183 |
| contract_1872 | The Indian Contract Act, 1872 | 268 | 268 | 268 |
| pvdva_2005 | The Protection of Women from Domestic Violence Act, 2005 | 37 | 37 | 38 |
| dowry_1961 | The Dowry Prohibition Act, 1961 | 13 | 13 | 13 |
| posh_2013 | The Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013 | 30 | 30 | 31 |
| dpdp_2023 | The Digital Personal Data Protection Act, 2023. | 44 | 44 | 51 |
| ita_2000 | The Information Technology Act, 2000 | 125 | 125 | 131 |
| cpa_2019 | The Consumer Protection Act, 2019 | 107 | 107 | 118 |
| senior_2007 | The Maintenance and Welfare of Parents and Senior Citizens Act, 2007 | 32 | 32 | 32 |
| jj_act_2015 | The Juvenile Justice (Care and Protection of Children) Act, 2015. | 112 | 112 | 124 |
| pocso_2012 | The Protection of Children from Sexual Offences Act, 2012 | 47 | 47 | 49 |
| copyright_1957 | The Copyright Act, 1957 | 105 | 105 | 118 |
| lsa_1987 | The Legal Services Authorities Act, 1987 | 40 | 40 | 40 |
| rti_2005 | The Right to Information Act, 2005 | 31 | 31 | 35 |

## Reproduce

```
python -m ml build --manifest ml/configs/corpus_manifest.json
python -m ml build --offline   # rebuild from cached raw payloads only
```
